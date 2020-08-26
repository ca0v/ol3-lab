# OpenLayers Playground

Proof of Concept code for learning aspects of OpenLayers and related spatial libraries.

-   [ol3-lab](https://github.com/ca0v/ol3-lab/)
-   [v5.1.3](https://github.com/ca0v/ol3-lab/tree/v5.1.3/) switches to npm

## Tests

-   [v5.1.3](https://rawgit.com/ca0v/ol3-lab/v5.1.3/loaders/tests.html?test=*&theme=dark)

## Examples

-   [v6.4.3](https://rawgit.com/ca0v/ol3-lab/v6.4.3/index.html)
-   [v5.1.3](https://rawgit.com/ca0v/ol3-lab/v5.1.3/loaders/tests.html?theme=dark)
-   [v4.6.5](https://rawgit.com/ca0v/ol3-lab/v4.6.5/rawgit.html?run=ol3-lab/labs/index)
-   [master](https://rawgit.com/ca0v/ol3-lab/master/index.html)

## Develop

-   `>npm run dev`

## Style Lab

![alt text](./ol3-lab/ux/docs/style-lab.png "ux/style-lab")

![5star](./ol3-lab/ux/docs/5star.png)

```
[{
    "star": {
        "fill": {
            "pattern": {
                "orientation": "cross",
                "color": "rgba(81,237,59,0.5)",
                "spacing": 2,
                "repitition": "repeat"
            }
        },
        "opacity": 1,
        "stroke": {
            "color": "rgba(81,237,5,1)",
            "width": 0
        },
        "radius": 50,
        "radius2": 15,
        "points": 5,
        "angle": 0,
        "rotation": 0
    }
}]
```

![starlight](./ol3-lab/ux/docs/starlight.png)

```
[{
    "star": {
        "fill": {
            "color": "rgba(254,246,223,0.8)"
        },
        "opacity": 1,
        "stroke": {
            "color": "rgba(5,45,5,0.2)",
            "width": 1
        },
        "radius": 18,
        "radius2": 3,
        "points": 12,
        "angle": 0,
        "rotation": 0
    }
}]
```

![redheat](./ol3-lab/ux/docs/redheat.png)

```
[{
    "circle": {
        "fill": {
            "gradient": {
                "type": "radial(20,20,10,20,20,0)",
                "stops": "rgba(255,0,0,0) 0%;rgba(255,0,0,0.1) 10%;rgba(255,0,0,0.2) 20%;rgba(255,0,0,0.3) 40%;rgba(255,0,0,0.6) 100%"
            }
        },
        "opacity": 1,
        "stroke": {
            "color": "rgba(255,255,255,0.1)",
            "width": 1
        },
        "radius": 20,
        "rotation": 0
    }
}]
```

## Polyline Encoder

![before](./ol3-lab/ux/docs/not-simplify.png) ![after](./ol3-lab/ux/docs/simplify.png)

```
t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF
```

## Individual Test Results

-   TODO - [ol-ags](https://rawgit.com/ca0v/ol3-ags/v5.1.3/loaders/tests.html)
-   [ol-draw](https://rawgit.com/ca0v/ol3-draw/v5.1.3/loaders/tests.html)
-   [ol-fun](https://rawgit.com/ca0v/ol3-fun/v5.1.3/loaders/tests.html)
-   TODO - [ol-geocoder](https://rawgit.com/ca0v/ol3-geocoder/v5.1.3/loaders/tests.html)
-   [ol-grid](https://rawgit.com/ca0v/ol3-grid/v5.1.3/loaders/tests.html)
-   [ol-input](https://rawgit.com/ca0v/ol3-input/v5.1.3/loaders/tests.html)
-   TODO - [ol-lab](https://rawgit.com/ca0v/ol3-lab/v5.1.3/loaders/tests.html)
-   [ol-layerswitcher](https://rawgit.com/ca0v/ol3-layerswitcher/v5.1.3/loaders/tests.html)
-   TODO - [ol-mapquest](https://rawgit.com/ca0v/ol3-mapquest/v5.1.3/loaders/tests.html)
-   [ol-panzoom](https://rawgit.com/ca0v/ol3-panzoom/v5.1.3/loaders/tests.html)
-   [ol-popup](https://rawgit.com/ca0v/ol3-popup/v5.1.3/loaders/tests.html)
-   [ol-search](https://rawgit.com/ca0v/ol3-search/v5.1.3/loaders/tests.html)
-   [ol-symbolizer](https://rawgit.com/ca0v/ol3-symbolizer/v5.1.3/loaders/tests.html)
