# OpenLayers Playground

This is Proof of Concept code for learning
aspects of OpenLayers and related spatial libraries

![alt text](./ux/docs/style-lab.png "ux/style-lab")

## Style Lab
![5star](./ux/docs/5star.png)
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

![starlight](./ux/docs/starlight.png)

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

![redheat](./ux/docs/redheat.png)


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

![before](./ux/docs/not-simplify.png) 
![after](./ux/docs/simplify.png)
```
t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF
```

## All Examples

* [index](https://cdn.rawgit.com/ca0v/ol3-lab/v3.17.1/rawgit.html?run=labs/index)

## Build using tsd, bower, tsc:

* tsd install
* bower install
* tsc -w
