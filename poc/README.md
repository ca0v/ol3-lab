
## PRELIMINARY RESULTS
* Missing animation 
* Missing proper styling
* Center-of-mass calculations are wrong


A "卐" pattern seems to resolve a "crosshairs" issue I am having fetching features that are in more than one quadrant:

Notice if we assign each quadrant a given line segement to query:

|_ |‾ _| ‾| that when they are put together we get full coverage of all the edges with no duplicate coverage.  
卐卐  
卐卐

Therefore each quad will have a custom segment to query as well as the extent which defines the polygon. 

The advantage here is we can defer running the query until the tile itself has few enough features instead of relying on a tile centerline which is unique to each tile and therefore forced to run on all tiles that were by definition too large for a feature query.

The alternative is to use a different query and download all edge features twice.

![Rough Draft](./assets/draft.gif)

## TODO
* Illustrate how mass that crosses a tile boundary is detected and handled and why it requires the unfortunate overhead of running FID queries.

## Problem
Rendering a large number of features is impractical in terms of the overhead in acquiring that much data, storing it on the client and rendering it on a map. Vector Tiles overcome all of these issues and are a prefered solution, but are not always an option.  A system is needed for determining when to render an approximation of the features and when to render the actual features.

## Cient Side Solutions
Existing client-side clustering strategies rely on having the underlying geometry and testing for proximity.  This strategy only works when all the features are loaded in the current viewport.

From the Openlayers cluster source:

    cluster() {
        for (i = 0, ii = features.length; i < ii; i++) {
        feature = features[i];
        if (!(getUid(feature) in clustered)) {
            geometry = this.geometryFunction(feature);
            coordinates = geometry.getCoordinates();
            createOrUpdateFromCoordinate(coordinates, extent);
            buffer(extent, mapDistance, extent);

            neighbors = this.source.get(extent);
            neighbors = neighbors.filter(function (neighbor) {
                uid = getUid(neighbor);
                if (!(uid in clustered)) {
                    clustered[uid] = true;
                    return true;
                } else {
                    return false;
                }
            });
            this.features.push(this.createCluster(neighbors));
        }}
    }

The [AnimatedCluster](https://github.com/Viglino/ol-ext/blob/master/src/layer/AnimatedCluster.js) and [SelectCluster](https://github.com/Viglino/ol-ext/blob/master/src/interaction/SelectCluster.js) work ingeniously together to provide a responsive animation in this [animated cluster demo](http://viglino.github.io/ol-ext/examples/animation/map.animatedcluster.html) from Jean-Marc Viglino.

## Server Side Solutions
The server-side solution will also aggregate features before sending them to the client.

Some examples:
* Vector Tiles, geometries are styled and simplified bases on zoom level
* https://github.com/cjstehno/coffeaelectronica/wiki/Mapping-Large-Data-Sets

## Expectation

* Do not have slow load times
* Do not overwhelm the UI
* Provide eventual access to the actual feature data
* Operate against AGS Server, OGC WFS

### Performant
A solution should optimize server communication and screen real-estate to present the user with as much detail as possible without overwhelming the UI.  Although a server-side solution might be optimal and `Vector Tiles` are ideal, aggregate queries can provide similar functionality operating against older ArcGIS and OGC systems that can return a "count" or "hits" result.

## Definitions
| Term | Definition |
|:-|:-|
|tile|a MxN grid item|
|tile size|generally 256 x 256, the width and height of a single map tile|
|tile mass|the number of features within the bounds of that tile|
|tile volume|the number of pixels a tile represents|
|tile density|tile mass divided by tile volume|
|feature|data represented by a point, line or polygon marker|
|cluster marker|a point representing one or more features|
|density threshold|a scalar value that, once exceeded, indicates clustering is required|

## Strategy
There needs to be a criteria for deciding if a feature should render;
some threshold value that, once crossed, renders the features instead of the cluster marker.

A similar criteria is needed to determine when to download the actual features and when to work with aggregate data.  The data threshold would indicate when it is acceptable to download the actual feature data instead of an aggregated representation.

### Visual Thresholds
The Z value of a feature or tile can be used to determine how it should be represented visually.  For a tile the Z value is just that -- the Z in the XYZ location.  For a feature the Z value must be computed using the features bounding box.

The cluster marker representing a tile is stamped with the Z value of the tile they represent.

Now it is easy to decide if a feature should be rendered by comparing its Z value to the current zoom level.  If beyond threshold do not render it.

Cluster markers will have a tight range as there is no advantage to displaying a parent tile along side its child tiles.

Feature markers will have more leaway as it makes a lot of sense for the same feature to be visible over multiple zoom levels.

### Data Thresholds
Constraining queries to tiles makes this easy to reason about.  If  too much data would be downloaded into a tile defer the job to the children, which represent 25% of the parent surface.  Until that threshold is crossed the only aggregate data is available, but once crossed the features are downloaded but not necessarily visible to the user as that is controlled by the visual threshold. 

A good implementation will probably only query for features when the tile is visible enough to justify rendering features, but it is conceivable that features could be downloaded without being rendered.  Imaging the case where very small features are downloaded within a large tile.  The clustering strategy will still want to render these as features until the user zooms further in.  The Visual Threshold determines when to render these features.

### Rule 1
Render tiles where -2 <= current level - Z <= -2 to ensure an adaquately large marker can represent the cluster area.  I use 2 assuming a square tile size of 256 as this leaves 64 x 64 pixels for the marker.  When the Z-offset becomes too large sub-tiles will represent the area within this tile.  When the Z-offset becomes too small parent tiles will represent this area.

### Rule 2
Render features where -3 <= current level - Z <= 4 to ensure a single feature is visible across 8 zoom levels.  This assumes a 2D feature will fill at most 1024 x 1024 pixels and no less than 32 x 32 pixels.  When the Z-offset becomes too large there need not be any representation of the feature,  but when the Z-offset becomes too small the feature should be represented by  a cluster marker.

### Computing Cluster Position

To render clusters nearest to the location they represent, several values must be known:
* `@c`: the center of the tile
* `m`: the total mass of the tile
* `vm`: the mass of the visible features within the tile
* `dm`: the mass of the non-visible features within the tile
* `pm`: the phantom mass of the tile

The center of a tile is easily computed.
The total mass is either assigned via a count-query response or undefined.
The mass of a feature is 1.
The phantom mass is unaccounted for mass computed as `m - vm - dm`. 

It is not enough to know the mass but also the location of that mass:
* `@m`: the moment of m, m@c
* `@vm`: the moment of vm
* `@dm`: the moment of dm
* `@pm`: the moment of pm

A cluster only represents `dark mass` because visual mass represents itself.

The moment of a cluster is the `@dm+@pm`, which is `@m-@vm`.  The later can only be computed when `m` is defined and the former reduces to `@dm` when `m` is undefined.

### Computing Visible Moment
The `@vm` of a tile is equal to the `∑@vm` of its sub-tiles plus the moment of any visible features bound by exactly that tile.

### Computing Dark Moment
The `@dm` of a tile is equal to the `∑@dm` of its sub-tiles plus the moment of any hidden features bound by that tile and no sub-tiles.

### Computing Phantom Moment
The `@pm` of a tile is equal to  `@m-@dm-@vm` and represents location and mass of unknown features bound by a tile and no sub-tiles. We know they exist from the count query but we will not know where, exactly, until we query for the features.  A feature is associated with the smallest tile that fully contains that feature.  This will consistently assign a feature to exactly one tile to ensure it is not over-represented.

### Configuration
`clusterZOffset` is the zoom offset for cluster markers.  If this value plus the cluster Z value equals the current zoom level then the cluster is visible.
The `clusterZOffset` is also used to determine how far to query ahead for tile counts.

`featureMinZOffset` and `featureMaxZOffset` set the bounds of the visibility of a feature such that a feature is visible if `featureMinZOffset <= currentZoomLevel - Z <= featureMaxOffset`.

Since `Z` is associated with the feature we can style bases on this offset as well.  Styling rules must also be configurable although it is conceivable they can be derived from the layer symbology.

## Notes of Interest

### Computing Tile Identifier from an Extent
It was challenging to compute the tile identifiers given an extent due to floating point issues.  This solution got my tests to pass. The code below was a less-obvious solution for computing x and y but increased precision to acceptable levels:

    Z = pow(2, round(log2(root.w / node.w)))
    X = round(Z * (node.xmin - root.xmin)) / root.w)
    Y = round(Z * (node.ymin - root.ymin)) / root.h)

### Client-Side Caching of Aggregation Data
There are `stringify` and `unstringify` methods on the TileTree that may be used to cache the tree on the browser between sessions.  Since this tree is relatively expensive to build due to all the "count" or "hit" queries it will improve performance at the cost of a modest amount of client-side storage. 

There is a security risk in exposing aggregate feature counts, but defaulting to cache seems reasonable.  Use `DisableClusterCaching` to turn this feature off. 

There is risk of stale data but since the data grows more accurate as the user exercises the map (only leaf tiles need "count" data so zooming beyond current leaves will auto-refresh the data) it should be self-correcting without explicitly expiring the cache. The trick here is to only cache the leaf nodes and work backwards to rebuild the tree.  To that end, custom encoder/decoders should be used for processing the tree serializer, some for readability, some for terseness.  By default, use `TerseClusterEncoding`.

LINKS
* [this document](https://github.com/ca0v/ol3-lab/blob/v6.4.3/poc/README.md)