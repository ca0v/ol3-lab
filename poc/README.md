## Problem
Rendering a large number of feature is impractical.  A a system is needed for determining when to fetch "count" and when to fetch the actual features.  A clustering strategy for determining when to render an approximation of the features and when to render the actual features is needed.

## Cient Side Solutions
Existing client-side clustering strategies rely on having the underlying geometry and testing for proximity, basically buffering around a feature, testing for any unclustered neighbors and putting them all in the same cluster.  This strategy only works when all the features are loaded in the current viewport.

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
These would have access to the features and send approximations to the client.  Some examples:
* Vector Tiles, geometries are styled and simplified bases on zoom level
* https://github.com/cjstehno/coffeaelectronica/wiki/Mapping-Large-Data-Sets

## Expectation
We do not want to retrieve too many features too soon.  A solution should optimize server communication and screen real-estate to present the user with as much detail as possible without overwhelming the UI.  Although a server-side solution might be optimal and Vector Tiles are ideal, I think with a "count" query I can get similar functionality, if not performance, with a client-side only solution that works with older ArcGIS and OGC systems that can return a "count" or "hits" result.

## Meeting the Expectation
Here I will outline a "density" strategy that give "mass" and "volume" to "tiles" and individual "features".  Tile density is really just a way of ensuring we do not consume too few pixels when representing the data associate with a tile.  Put the features aside for the time being and consider only "count" data, or the number of features with centroid within the bounds of a tile.  Since we have the "count" of a tile, We can now consider a tiles mass to be the count and the tiles volume to be the area (with thickness 1).  With that we have a way to compute tile density.

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

## Computing Cluster Threshold
There needs to be a criteria for deciding if a feature should render.  We need some threshold value that, when crossed, renders the features as a cluster marker.

Assume clustered results are rendered within a circle of radius proportional to the square root of the count that marker represents.  This allows the area of the circle to represent the count.  In other words if `count ∝ 2πr²` then `r ∝ √count`.

We need the marker to be visible for small count, so assume the radius is computed by `r = A + B√count` where `A` and `B` are configuration options `ClusterMinSize` and `ClusterScale`. The fixed size ensures for small counts we will still get a reasonably sized cluster marker.

Likely defaults are `A=5` and `B = ⅜TileSize/√1000`, or simply `B=3` when `TileSize=256`.  This will ensure all markers are large enough to render a single digit inside of them (10 pixel radius, minimum) and also will grow in area to approximate the count.  Styles will dictate optimum values so they will be externally configurable.

    radius(node) => A + B * Math.sqrt(node.data.count)

Now if the radius is small enough we can probably render the children instead to give the user more markers with more counts in more precise locations.  Keep in mind that the radius of a child will appear in a tile ¼ the area and ½ the width of the parent and therefore the radius of the child must be less than or equal to ½ the max allowed radius of the parent.  That is to say, the child threshold must be ¼ the parent theshold since the child area is ¼ the parent area.  This will always be true in the aggregate that the child radius will ½ the parent because the average count of a child is ¼ the parent count, but it is the extremes that we care about.  

### Rule 1
If *any* child exceeds the threshold then use all the children of the parent to compute the parents center-of-mass and render the parent as a cluster marker.  

### Rule 2
If no child exceeds this threshold then repeat the process for the grand-children of the parent, repeating recursively until all leaf nodes have at least one sibling that exceeds threshold, or itself exceeds the threshold.  At that point, rule 1 comes back into play.

### Rule 3
Now it may be that we reach a child tile that has such a small count as to justify querying for the features within that tile.  This introduces a new configuration option...how many features should we render in a single tile?  Call this `MaxFeaturesPerTile`.
Once this happens it is not a given that the features will render.  We now need to compute the density of each feature.  As before with tiles, any features that are too dense will result in the parent tile rendering as a cluster, so either all the features will render or none of them will.  

### Rule 4
Alternatively we can do a client-side spatial query to cluster neighboring features to allow reaching across grid boundaries.  I think that without this last step things will snap to grid lines, but I will leave this as a future rule.

### Threshold
The Threshold should be externally configurable via `ClusterDensityThreshold` but should default to a value that ensures a reasonably styled cluster marker will remain within the tile it represents.  Assuming a square tile, `T` if size `w²` pixels at zoom level `Z`, it will have an area of `w²4<sup>(z-Z)</sup>`, where `z` represent the current zoom level.  As the user zooms out from `Z` the tile `T` gets smaller because z-Z gets smaller.  The smaller `T` gets the more dense it becomes.  At some point it should disappear, yielding to its parent to render instead.  This threshold value should default to about 2πr², which is `2π(A+B√count)²`.  

If the `w²4<sup>(z-Z)</sup>` exceeds `2π(A+B√count)²` then the tile is too dense to render.

## Areas of Concern
My solution for computing `cluster density` seems like it would be simpler if each cluster marker had a physical geometry (e.g. circle or polygon) associated with it.  In that case zooming in/out would have a visual effect on the markers.  When they get too large we render the children instead.  I feel that is a better option and may lend itself to using a built-in client-side clustering strategy.  Keep in mind current `count` results can count the same feature multiple times so it is still benificial to maintain the parent count data, complicating a built-in solution.

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


PRELIMINARY RESULTS
* Missing animation 
* Missing proper styling
* Center-of-mass calculations are wrong
![Rough Draft](./assets/draft.gif)