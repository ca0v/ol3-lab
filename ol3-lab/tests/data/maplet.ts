export let maplet = {
    "data": {
        "Map": {
            "Symbology": {
                "Symbols": [{
                    "Icons": [{
                        "id": "*",
                        "type": "json",
                        "style": "[{\r\n    \"star\": {\r\n        \"fill\": {\r\n            \"color\": \"rgba(238,162,144,1)\"\r\n        },\r\n        \"opacity\": 1,\r\n        \"stroke\": {\r\n            \"color\": \"rgba(169,141,168,0.8)\",\r\n            \"width\": 1\r\n        },\r\n        \"radius\": 7,\r\n        \"radius2\": 2,\r\n        \"points\": 5\r\n    }\r\n},\r\n{\r\n    \"icon\": {\r\n        \"src\": \"app/icons/solid.png\",\r\n        \"anchor-y\": 1,\r\n        \"color\": \"rgba(94, 94, 94, 1)\",\r\n        \"scale\": 0.8\r\n    }\r\n},\r\n{\r\n    \"text\": {\r\n        \"text\": \"9\",\r\n        \"font\": \"16px Helvetica\",\r\n        \"offset-y\": -32,\r\n        \"fill\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 1\r\n        }\r\n    }\r\n}]",
                        "Width": 0,
                        "Height": 0,
                        "Label": "Point Feature"
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "somecount_0_10",
                                "Value": "<10"
                            }]
                        },
                        "id": "tiny",
                        "type": "json",
                        "style": "[{\r\n    \"star\": {\r\n        \"fill\": {\r\n            \"color\": \"rgba(94, 94, 94, 0.5)\"\r\n        },\r\n        \"opacity\": 1,\r\n        \"rotation\": 0,\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 1\r\n        },\r\n        \"radius\": 55,\r\n        \"radius2\": 20,\r\n        \"points\": 2\r\n    }\r\n},\r\n{\r\n    \"svg\": {\r\n        \"imgSize\": [\r\n        13, 20],\r\n        \"anchor\": [0.5, 1],\r\n        \"scale\": 1,\r\n        \"rotation\": 0,\r\n        \"fill\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255, 255, 255, 1)\",\r\n            \"width\": 1\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n},\r\n{\r\n    \"text\": {\r\n        \"text\": \"9\",\r\n        \"font\": \"12px Helvetica\",\r\n        \"scale\": 1,\r\n        \"rotation\": 0,\r\n        \"offset-x\": 0,\r\n        \"offset-y\": -12,\r\n        \"fill\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 0\r\n        }\r\n    }\r\n}]",
                        "Width": 0,
                        "Height": 0,
                        "Label": "Point Feature"
                    }],
                    "id": "point-features",
                    "Label": "Point Features"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "style",
                        "style": "{\r\n    \"type\": \"mixed\",\r\n    \"fill\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [255, 0, 0, 0.9]\r\n    },\r\n    \"stroke\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [170, 220, 170, 1],\r\n        \"width\": 3\r\n    }\r\n}",
                        "Width": 0,
                        "Height": 0,
                        "Label": "Red Zone"
                    }],
                    "id": "red-zones",
                    "Label": "Red Zone"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "style",
                        "style": "{\r\n    \"type\": \"mixed\",\r\n    \"fill\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [150, 220, 130, 0.5]\r\n    },\r\n    \"stroke\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [170, 220, 170, 1],\r\n        \"width\": 3\r\n    }\r\n}",
                        "Width": 0,
                        "Height": 0,
                        "Label": "Green Zone"
                    }],
                    "id": "green-zones",
                    "Label": "Green Zone"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "json",
                        "style": "[{\r\n    \"fill\": {\r\n        \"pattern\": {\r\n            \"orientation\": \"horizontal\",\r\n            \"color\": \"rgba(192,192,192, 0.5)\",\r\n            \"spacing\": 10,\r\n            \"repitition\": \"repeat\"\r\n        }\r\n    }\r\n},\r\n{\r\n    \"fill\": {\r\n        \"pattern\": {\r\n            \"orientation\": \"vertical\",\r\n            \"color\": \"rgba(192,192,192, 0.5)\",\r\n            \"spacing\": 10,\r\n            \"repitition\": \"repeat\"\r\n        }\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"white\",\r\n        \"width\": 3\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"black\",\r\n        \"width\": 1\r\n    }\r\n},\r\n{\r\n    \"image\": {\r\n        \"scale\": 2,\r\n        \"imgSize\": [13, 21],\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"fill\": {\r\n            \"color\": \"rgba(50,50,50,1)\"\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n}]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "selected",
                                "Value": ">0"
                            }]
                        },
                        "id": "selected",
                        "type": "json",
                        "style": "[{\r\n    \"fill\": {\r\n        \"color\": \"rgba(6,151,232,0.5)\"\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"white\",\r\n        \"width\": 3\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"rgba(6,151,232,1)\",\r\n        \"width\": 1\r\n    }\r\n},\r\n{\r\n    \"image\": {\r\n        \"scale\": 2,\r\n        \"imgSize\": [13, 21],\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"fill\": {\r\n            \"color\": \"rgba(6,151,232,1)\"\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n}]",
                        "Width": 0,
                        "Height": 0
                    }],
                    "id": "parcels",
                    "Label": "PARCEL <%- PRCLID %>",
                    "template": "app/templates/parcel-template"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 1.5,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "lon",
                                "Value": ">-99999999999"
                            }]
                        },
                        "id": "coordinates",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 1.5,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<%= parseFloat(lat).toFixed(5) %>,<%= parseFloat(lon).toFixed(5) %>"
                    }],
                    "id": "points",
                    "Label": "Default"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<%= address_symbol_title %>"
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "count",
                                "Value": ">0"
                            },
                            {
                                "id": "selected",
                                "Value": ">0"
                            }]
                        },
                        "id": "selected-cluster",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(6,151,232,1)\", \r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(6,151,232,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(0,0,0,1)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -24,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"14pt serif\"\r\n                        }\r\n                    }]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "count",
                                "Value": ">0"
                            }]
                        },
                        "id": "cluster",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(51,51,51,0.85)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(51,51,51,1)\",\r\n                                \"width\": 3\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -24,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"14pt serif\"\r\n                        }\r\n                    }]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "selected",
                                "Value": ">0"
                            }]
                        },
                        "id": "selected-address",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(6,151,232,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<%= address_symbol_title %>"
                    }],
                    "id": "addresses",
                    "Label": "Address"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "style",
                        "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"silver-pink.png\",\r\n        \"anchorYValue\": 1\r\n    }\r\n}",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "count",
                                "Value": ">1"
                            }]
                        },
                        "id": "int-cluster-selected",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(21,120,205,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -25,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"13pt sans-serif\"\r\n                        }\r\n                    }]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "selected",
                                "Value": ">0"
                            }]
                        },
                        "id": "int-selected",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(21,120,205,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "count",
                                "Value": ">0"
                            }]
                        },
                        "id": "int-cluster",
                        "type": "json",
                        "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(94,94,94,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -25,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"13pt sans-serif\"\r\n                        }\r\n                    }]",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "ServiceRequest,serviceRequest"
                            }]
                        },
                        "id": "ServiceRequest.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "planning,Planning"
                            }]
                        },
                        "id": "Planning_Application.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0,
                        "template": "app/templates/civics-infoviewer-template"
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "businessLicense,BusinessLicense"
                            }]
                        },
                        "id": "License_Application.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "building,Building"
                            }]
                        },
                        "id": "Building_Review.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "project,Project"
                            }]
                        },
                        "id": "Project_Application.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "use,Use"
                            }]
                        },
                        "id": "Use_Application.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "codeEnforcement,CodeEnforcement"
                            }]
                        },
                        "id": "Case.png",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "_dataType",
                                "Value": "tradeLicense,TradeLicense"
                            }]
                        },
                        "id": "trade-license",
                        "type": "json",
                        "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "type",
                                "Value": "address"
                            }]
                        },
                        "id": "address-marker",
                        "type": "style",
                        "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"white-hole.png\",\r\n        \"anchor\": [0.5, 1.0],\r\n        \"color\": [255, 0, 0], \r\n        \"opacity\": 0.5,\r\n        \"scale\": 0.75\r\n    },\r\n    \"text\": {\r\n        \"text\": \"<%=text %>\",\r\n        \"textAlign\": \"center\",\r\n        \"textBaseline\": \"top\"\r\n    }\r\n}",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<address><%= text %></address>"
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "type",
                                "Value": "text,address"
                            }]
                        },
                        "id": "text-only-marker",
                        "type": "style",
                        "style": "{\"type\":\"circle\",\"radius\":7,\"fill\":{\"color\":[247,96,84]}}",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<address><%= text %></address>"
                    },
                    {
                        "id": "MapPin.png",
                        "Width": 0,
                        "Height": 0
                    }],
                    "id": "*",
                    "Label": "<%= computedDescription %>",
                    "template": "app/templates/civics-infoviewer-template"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "style",
                        "style": "{\"type\":\"sfs\",\"style\":\"solid\",\"color\":[0,246,0,0.5],\"outline\":{\"type\":\"sls\",\"style\":\"solid\",\"color\":[246,103,197],\"width\":1}}",
                        "Width": 0,
                        "Height": 0
                    }],
                    "id": "properties",
                    "Label": "<%= PROPID %> - <%= PROPNAME %> <h6><%= Comment %></h6>"
                },
                {
                    "Icons": [{
                        "id": "*",
                        "type": "style",
                        "style": "{\"type\":\"circle\",\"radius\":9,\"fill\":{\"color\":[247,96,247]}}",
                        "Width": 0,
                        "Height": 0
                    },
                    {
                        "Filters": {
                            "Filters": [{
                                "id": "requestType.type",
                                "Value": "GISTest"
                            }]
                        },
                        "id": "ServiceRequest.png",
                        "type": "style",
                        "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"white-hole.png\",\r\n        \"anchorYUnits\": \"pixels\",\r\n        \"anchorYValue\": 62,\r\n        \"color\": [203, 28, 99, 10]\r\n    },\r\n    \"text\": {\r\n        \"text\": \"SR <%=id%>\",\r\n        \"textAlign\": \"center\",\r\n        \"textBaseline\": \"top\",\r\n        \"offsetY\": 64,\r\n        \"scale\": 2\r\n    }\r\n}",
                        "Width": 0,
                        "Height": 0,
                        "Label": "<address>Service Request <%= id %></address><address><%= address.displayText %></address><comment><%= requestType.description %></comment>"
                    }],
                    "id": "crm-servicerequest",
                    "Label": "<address><%= locationLine1 %></address><address><%= locationLine2 %></address>"
                }],
                "IconWidth": 0,
                "IconHeight": 0
            },
            "Layers": {
                "Layers": [{
                    "Layers": {
                        "Layers": [{
                            "Options": {
                                "Values": [{
                                    "id": "symbology",
                                    "about": "Render as a zone",
                                    "value": "green-zones"
                                },
                                {
                                    "id": "resultRecordCount",
                                    "about": "Do not return more than 100 results",
                                    "value": "100"
                                },
                                {
                                    "id": "visible",
                                    "value": "true"
                                },
                                {
                                    "id": "filter",
                                    "value": "<%= green_zone_filter %>"
                                }]
                            },
                            "id": "green-zone",
                            "text": "Green Zones",
                            "url": "<%= primary_featureserver_url %>/<%= zone_layer_id %>",
                            "type": "app/layer-factory/ags-featureserver",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 22,
                            "disabled": false
                        },
                        {
                            "Options": {
                                "Values": [{
                                    "id": "symbology",
                                    "about": "Render as a zone",
                                    "value": "red-zones"
                                },
                                {
                                    "id": "resultRecordCount",
                                    "about": "Do not return more than 100 results",
                                    "value": "100"
                                },
                                {
                                    "id": "visible",
                                    "value": "true"
                                },
                                {
                                    "id": "filter",
                                    "value": "<%= red_zone_filter %>"
                                }]
                            },
                            "id": "red-zone",
                            "text": "Red Zones",
                            "url": "<%= primary_featureserver_url %>/<%= zone_layer_id %>",
                            "type": "app/layer-factory/ags-featureserver",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 22,
                            "disabled": false
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "visible",
                            "value": "true"
                        }]
                    },
                    "id": "zones",
                    "text": "Zones",
                    "type": "app/layer-factory/group",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 22,
                    "disabled": false
                },
                {
                    "id": "parcels",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false,
                    "Events": {
                        "Events": [{
                            "name": "attempt-parcel-reverse-geocode,universal-search",
                            "id": "reverse-geoquery-multiplexer",
                            "about": "Wait for parcel and address results",
                            "mid": "app/commands/multiplexer",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "once",
                                    "about": "Only do this once per \"use-this-parcel\" event",
                                    "value": "true"
                                },
                                {
                                    "id": "in",
                                    "value": "parcel-result-ready,address-join-results-ready"
                                },
                                {
                                    "id": "out",
                                    "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                                    "value": "civics:map-click-results"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Wait for parcels and associated addresses only when this parcel layer is visible",
                                    "value": "true"
                                }]
                            }
                        },
                        {
                            "name": "attempt-parcel-reverse-geocode,universal-search",
                            "id": "reverse-geoquery-multiplexer-no-parcel",
                            "about": "Wait for address results",
                            "mid": "app/commands/multiplexer",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "once",
                                    "about": "Only do this once per \"use-this-parcel\" event",
                                    "value": "true"
                                },
                                {
                                    "id": "in",
                                    "about": "Once this multiplexer is activated it will wait for the address results to be ready before notifying civics of a a map-click-result",
                                    "value": "address-result-ready"
                                },
                                {
                                    "id": "out",
                                    "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                                    "value": "civics:map-click-results"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Do not attempt to wait for addresses unless this parcel layer is not visible",
                                    "value": "false"
                                }]
                            }
                        },
                        {
                            "name": "attempt-parcel-reverse-geocode",
                            "id": "attempt-parcel-reverse-geocode",
                            "about": "If parcel layer visible then search for a parcel otherwise spoof an empty result",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "When this layer is checked attempt to locate a parcel via a reverse geoquery",
                                    "value": "parcel-reverse-geoquery"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Do not attempt to locate a parcel when this layer is not visible",
                                    "value": "true"
                                }]
                            }
                        },
                        {
                            "name": "attempt-parcel-reverse-geocode",
                            "id": "do-not-attempt-parcel-reverse-geocode",
                            "about": "If parcel layer visible then search for a parcel",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "when-visible",
                                    "about": "only trigger this event when this layer is not visible",
                                    "value": "false"
                                },
                                {
                                    "id": "event",
                                    "about": "Spoof a parcel ready with no results so the multiplexer can continue",
                                    "value": "parcel-result-ready"
                                }]
                            }
                        },
                        {
                            "name": "layer-visible",
                            "id": "clear-features-on-hide",
                            "about": "Clear all the parcel features when unchecked",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "value": "clear-features-from-layer"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "When this layer is no longer visible clear features from the parcel-features layer",
                                    "value": "false"
                                },
                                {
                                    "id": "layer-name",
                                    "about": "Clears the features from the parcel-features layers",
                                    "value": "parcel-features"
                                }]
                            }
                        },
                        {
                            "name": "universal-search",
                            "id": "ags-parcel-locator",
                            "about": "Use the AGS find service to search for parcels",
                            "mid": "app/commands/ags-geoquery-locator",
                            "text": "Parcel Locator",
                            "type": "find",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>/<%= parcel_layer_id %>&sr=4326"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                    "value": "parcels"
                                },
                                {
                                    "id": "zoommap",
                                    "value": "true"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "parcel-result-ready,auto-zoom,report-search-status"
                                },
                                {
                                    "id": "layer-name",
                                    "about": "merge features into the parcel-features layer",
                                    "value": "parcel-features"
                                },
                                {
                                    "id": "keywords",
                                    "value": "parcel"
                                },
                                {
                                    "id": "type",
                                    "value": "find"
                                },
                                {
                                    "id": "message",
                                    "value": "Parcel Search Completed"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "showLayers",
                            "about": "Parcels Only",
                            "value": "<%= parcel_layer_id %>"
                        },
                        {
                            "id": "layerType",
                            "value": "rest"
                        },
                        {
                            "id": "visible",
                            "value": "true"
                        }]
                    },
                    "text": "Parcels",
                    "url": "<%= primary_mapserver_url %>",
                    "type": "app/layer-factory/arcgis-tile"
                },
                {
                    "id": "addresses",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false,
                    "Events": {
                        "Events": [{
                            "name": "add-to-parcel-layer,is-address-layer-checked",
                            "id": "trigger-if-address-checked",
                            "about": "Do not need is-address-layer-checked if using add-to-parcel-layer handler",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "value": "address-layer-checked"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Forwards the address-layer-checked event only when this addresses layer is visible",
                                    "value": "true"
                                }]
                            }
                        },
                        {
                            "name": "add-to-parcel-layer",
                            "id": "trigger-if-address-not-checked",
                            "about": "Do not need is-address-layer-checked if using add-to-parcel-layer handler",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "value": "address-join-results-ready"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "If the addresses layer is not checked then forward address-join-results-ready (with no results) to allow listeners to continue working",
                                    "value": "false"
                                }]
                            }
                        },
                        {
                            "name": "layer-visible",
                            "id": "clear-features-on-hide",
                            "about": "Clear all the parcel features when unchecked",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "value": "clear-features-from-layer"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Only when the addresses layer is not visible should we clear the address features from the address-feature layer",
                                    "value": "false"
                                },
                                {
                                    "id": "layer-name",
                                    "about": "Clears the features from the parcel-features layers",
                                    "value": "address-features"
                                }]
                            }
                        },
                        {
                            "name": "universal-search",
                            "id": "ags-address-locator",
                            "about": "Use the AGS find service to search for addresses",
                            "mid": "app/commands/ags-geoquery-locator",
                            "text": "Address Locator",
                            "type": "find",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "Signal the address results are ready and zoom to them",
                                    "value": "address-result-raw,auto-zoom,report-search-status"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>/<%= address_layer_id %>&sr=4326"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                    "value": "addresses"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "layer-name",
                                    "about": "merge features into the parcel-features layer",
                                    "value": "address-features"
                                },
                                {
                                    "id": "keywords",
                                    "value": "address"
                                },
                                {
                                    "id": "max-feature-count",
                                    "value": "<%= max_feature_count %>"
                                },
                                {
                                    "id": "type",
                                    "value": "find"
                                },
                                {
                                    "id": "message",
                                    "value": "Address Search Completed"
                                }]
                            }
                        },
                        {
                            "name": "attempt-address-reverse-geocode",
                            "id": "attempt-address-reverse-geocode",
                            "about": "If address layer visible then search for a address",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "If address layer checked allow an attempt to geocode",
                                    "value": "address-reverse-geoquery"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "Only attempt an address-reverse-geoquery when this address layer is visible",
                                    "value": "true"
                                }]
                            }
                        },
                        {
                            "name": "attempt-address-reverse-geocode",
                            "id": "do-not-attempt-address-reverse-geocode",
                            "about": "If address layer visible then search for a address",
                            "mid": "app/commands/trigger",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "Report an empty result set",
                                    "value": "address-result-ready"
                                },
                                {
                                    "id": "when-visible",
                                    "about": "When the addresses layer is not visible signal address-result-ready (no results) to prevent downstream handlers from blocking",
                                    "value": "false"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "layerType",
                            "value": "rest"
                        },
                        {
                            "id": "showLayers",
                            "about": "Addresses",
                            "value": "<%= address_layer_id %>"
                        },
                        {
                            "id": "visible",
                            "value": "true"
                        }]
                    },
                    "text": "Addresses",
                    "url": "<%= primary_mapserver_url %>",
                    "type": "app/layer-factory/arcgis-tile"
                },
                {
                    "id": "parcel-features",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false,
                    "Commands": {
                        "Commands": [{
                            "id": "get-associated-addresses",
                            "about": "Triggers request to get addresses that reside within this parcel",
                            "mid": "app/commands/trigger",
                            "type": "infoviewer-extension",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "Invokes the handler which queries for addresses within this parcel only if the address layer is checked",
                                    "value": "is-address-layer-checked"
                                }]
                            }
                        }]
                    },
                    "Events": {
                        "Events": [{
                            "name": "address-join-results-ready",
                            "id": "render-address-to-infoviewer",
                            "about": "Add the address information into the infoviewer (used the 'type' to identify this as a special infoviewer-extension event)",
                            "mid": "app/commands/trigger",
                            "type": "infoviewer-extension",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "field-list",
                                    "about": "Address fields to render in the parcel info viewer",
                                    "value": "locationLine1,locationLine2"
                                },
                                {
                                    "id": "primary-field",
                                    "value": "locationLine1,locationLine2"
                                },
                                {
                                    "id": "show-labels",
                                    "value": "false"
                                },
                                {
                                    "id": "template",
                                    "value": "app/templates/parcel-address-template"
                                },
                                {
                                    "id": "event",
                                    "value": "render-address-to-infoviewer"
                                }]
                            }
                        },
                        {
                            "name": "address-layer-checked",
                            "id": "get-associated-addresses",
                            "about": "Runs a join query unless the address layer is unchecked",
                            "mid": "app/commands/ags-geoquery-locator",
                            "type": "join",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>"
                                },
                                {
                                    "id": "layers",
                                    "value": "<%= address_layer_id %>"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                },
                                {
                                    "id": "event",
                                    "about": "notify raw results are ready to be transformed before being rendered as detail data within the parcel popup",
                                    "value": "address-join-results-raw"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "returnGeometry",
                                    "value": "true"
                                },
                                {
                                    "id": "keywords",
                                    "value": "parcel"
                                }]
                            }
                        },
                        {
                            "name": "layer-addfeature",
                            "id": "add-parcel-feature",
                            "about": "Opens the popup after adding features to this layer",
                            "mid": "app/commands/synthetic-add-features",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "open info viewer for added features",
                                    "value": "show-info"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "layerType",
                            "value": "cluster"
                        },
                        {
                            "id": "cluster-symbology",
                            "value": "addresses"
                        },
                        {
                            "id": "field-list",
                            "value": "<%= secondary_parcel_fields %>",
                            "about": "List the fields in the order you'd like them to appear in the infoViewer"
                        },
                        {
                            "id": "cluster-distance",
                            "value": "10"
                        },
                        {
                            "id": "show-labels",
                            "value": "false",
                            "about": "False to show the field-list values but not the field names"
                        },
                        {
                            "id": "symbology",
                            "value": "parcels",
                            "about": "Identifies the symbology rule to apply to these features"
                        }]
                    },
                    "text": "Parcels Features",
                    "type": "app/layer-factory/configuration-features"
                },
                {
                    "id": "address-features",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false,
                    "Commands": {
                        "Commands": []
                    },
                    "Events": {
                        "Events": [{
                            "name": "layer-addfeature",
                            "id": "add-address-feature",
                            "about": "Opens the popup after adding features to this layer",
                            "mid": "app/commands/synthetic-add-features",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "open info viewer for added features",
                                    "value": "show-info"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "symbology",
                            "value": "addresses",
                            "about": "Identifies the symbology rule to apply to these features"
                        },
                        {
                            "id": "show-labels",
                            "value": "false",
                            "about": "False to show the field-list values but not the field names"
                        },
                        {
                            "id": "field-list",
                            "value": "<%= secondary_address_fields %>",
                            "about": "List the fields in the order you'd like them to appear in the infoViewer"
                        },
                        {
                            "id": "layerType",
                            "value": "cluster"
                        },
                        {
                            "id": "cluster-distance",
                            "value": "40"
                        },
                        {
                            "id": "cluster-symbology",
                            "value": "addresses"
                        }]
                    },
                    "text": "Address Features",
                    "type": "app/layer-factory/configuration-features"
                },
                {
                    "id": "points",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false,
                    "Events": {
                        "Events": [{
                            "name": "layer-addfeature",
                            "id": "add-point-feature",
                            "about": "Opens the popup after adding features to this layer",
                            "mid": "app/commands/synthetic-add-features",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "open info viewer for added features",
                                    "value": "show-info"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "symbology",
                            "about": "Use this symbology rule when rendering features on this layer",
                            "value": "points"
                        },
                        {
                            "id": "field-list",
                            "about": "Display these field values",
                            "value": "lon,lat"
                        },
                        {
                            "id": "show-labels",
                            "about": "Render labels as well as field values",
                            "value": "true"
                        },
                        {
                            "id": "field-labels",
                            "about": "Labels to use to identify the fields in the field-list",
                            "value": "↔,↕"
                        }]
                    },
                    "text": "Point Features",
                    "type": "app/layer-factory/configuration-features",
                    "Commands": {
                        "Commands": [{
                            "id": "get-zone-info",
                            "about": "Immediately executes a query and provides results back to the info viewer",
                            "mid": "app/commands/ags-geoquery-locator",
                            "text": "Zone query",
                            "type": "query",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_featureserver_url %>"
                                },
                                {
                                    "id": "filter",
                                    "value": "<%= green_zone_filter %> OR <%= red_zone_filter %>"
                                },
                                {
                                    "id": "layers",
                                    "value": "<%= zone_layer_id %>"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "map",
                                    "value": "false"
                                },
                                {
                                    "id": "event",
                                    "value": "zone-results"
                                },
                                {
                                    "id": "returnGeometry",
                                    "value": "false"
                                },
                                {
                                    "id": "field-list",
                                    "about": "Identify the field(s) used to distinguish a red zone from a green zone",
                                    "value": "<%= primary_zone_field %>"
                                },
                                {
                                    "id": "field-labels",
                                    "value": "Zone"
                                },
                                {
                                    "id": "show-labels",
                                    "value": "true"
                                },
                                {
                                    "id": "type",
                                    "value": "query"
                                }]
                            }
                        }]
                    }
                },
                {
                    "Commands": {
                        "Commands": [{
                            "id": "more-info",
                            "about": "Adds a 'more info' button to the info viewer popup",
                            "mid": "app/commands/trigger",
                            "text": "View Details",
                            "type": "action",
                            "disabled": false,
                            "Options": {
                                "Values": [{
                                    "id": "event",
                                    "about": "Event which fires when clicked",
                                    "value": "civics:show-details"
                                },
                                {
                                    "id": "css-name",
                                    "about": "css class name to apply to this button",
                                    "value": "btn btn-secondary"
                                }]
                            }
                        }]
                    },
                    "Options": {
                        "Values": [{
                            "id": "field-list",
                            "about": "List the fields in the order you'd like them to appear in the infoViewer",
                            "value": "id"
                        },
                        {
                            "id": "anchorYValue",
                            "about": "The vertical offset of the markers associated with this layer, a 1 will shift the marker up so the bottom edge touches the point-feature; use 0.5 to center.",
                            "value": "1"
                        },
                        {
                            "id": "show-labels",
                            "about": "Inform infoviewer to not show field labels for these features (only applies if field-labels are defined)",
                            "value": "false"
                        },
                        {
                            "id": "layerType",
                            "about": "Cluster the features",
                            "value": "cluster"
                        },
                        {
                            "id": "cluster-distance",
                            "about": "Only cluster features within 20 pixels apart",
                            "value": "20"
                        }]
                    },
                    "id": "civics",
                    "text": "Search Results",
                    "type": "app/layer-factory/configuration-features",
                    "basemap": false,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false
                },
                {
                    "Layers": {
                        "Layers": [{
                            "Options": {
                                "Values": [{
                                    "id": "layerType",
                                    "value": "tile"
                                },
                                {
                                    "id": "visible",
                                    "value": "false"
                                }]
                            },
                            "id": "ags-world-imagery",
                            "text": "Esri World Imagery",
                            "url": "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
                            "type": "app/layer-factory/arcgis-tile",
                            "basemap": true,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false
                        },
                        {
                            "Options": {
                                "Values": [{
                                    "id": "layerType",
                                    "value": "tile"
                                },
                                {
                                    "id": "visible",
                                    "value": "false"
                                }]
                            },
                            "id": "ags-world-street-map",
                            "text": "Esri World Street Map",
                            "url": "http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer",
                            "type": "app/layer-factory/arcgis-tile",
                            "basemap": true,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false
                        },
                        {
                            "Options": {
                                "Values": [{
                                    "id": "layerType",
                                    "value": "tile"
                                },
                                {
                                    "id": "visible",
                                    "value": "true"
                                }]
                            },
                            "id": "ags-world-terrain",
                            "text": "Esri Topo Map",
                            "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
                            "type": "app/layer-factory/arcgis-tile",
                            "basemap": true,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false
                        },
                        {
                            "Options": {
                                "Values": [{
                                    "id": "layerType",
                                    "value": "osm"
                                },
                                {
                                    "id": "layerStyle",
                                    "value": "osm"
                                },
                                {
                                    "id": "visible",
                                    "value": "false"
                                }]
                            },
                            "id": "mapquest-osm",
                            "text": "Map Quest",
                            "type": "app/layer-factory/native",
                            "basemap": true,
                            "minlevel": 10,
                            "maxlevel": 20,
                            "disabled": false
                        }]
                    },
                    "id": "basemap-layer-group",
                    "text": "Basemaps",
                    "type": "app/layer-factory/group",
                    "basemap": true,
                    "minlevel": 0,
                    "maxlevel": 0,
                    "disabled": false
                }]
            },
            "Options": {
                "Values": [{
                    "id": "default-controls",
                    "about": "See http://openlayers.org/en/latest/apidoc/ol.control.html#.defaults",
                    "value": "{\r\n    \"attribution\": false,\r\n    \"rotate\": false,\r\n    \"zoom\": false\r\n}"
                },
                {
                    "id": "default-interactions",
                    "about": "See http://openlayers.org/en/latest/apidoc/ol.interaction.html#.defaults",
                    "value": "{\r\n    \"altShiftDragRotate\": true,\r\n    \"doubleClickZoom\": true,\r\n    \"keyboard\": true,\r\n    \"mouseWheelZoom\": true,\r\n    \"shiftDragZoom\": true,\r\n    \"dragPan\": true,\r\n    \"pinchRotate\": false,\r\n    \"pinchZoom\": true,\r\n    \"zoomDuration\": 500\r\n}"
                },
                {
                    "id": "enable-rotation",
                    "about": "Allows user to rotate the map",
                    "value": "true"
                },
                {
                    "id": "resize-sensor",
                    "about": "detect when the container changes size",
                    "value": "true"
                },
                {
                    "id": "init-zoom",
                    "about": "Zoom into to about 10 block radius",
                    "value": "17"
                },
                {
                    "id": "extent",
                    "about": "Las Vegas and surrounding area",
                    "value": "-115.435,36.000, -114.938, 36.342"
                },
                {
                    "id": "init-center",
                    "about": "Somewhere in Las Vegas",
                    "value": "-115.2322,36.1822"
                },
                {
                    "id": "max-zoom",
                    "about": "To be moved to VIEWPORT",
                    "value": "19"
                },
                {
                    "id": "min-zoom",
                    "about": "To be moved to VIEWPORT",
                    "value": "10"
                }]
            }
        },
        "id": "rhythm-civics-wizard",
        "parentId": "rhythm-civics-address-parcel-selector-mixin,rhythm-civics-submit-record,rhythm-civics-wizard-mixin",
        "Commands": {
            "Commands": [{
                "id": "liferay-interpreter",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "forward",
                        "about": "events to forward to liferay",
                        "value": "civics:zone-validation,civics:map-click-results,flash-buffer"
                    },
                    {
                        "id": "channel-name",
                        "value": "civics-channel",
                        "about": "Radio channel to communicate with"
                    },
                    {
                        "id": "liferay-echo-prefix",
                        "value": "liferay",
                        "about": "Prefix messages with this text"
                    },
                    {
                        "id": "debug",
                        "value": "false",
                        "about": "True to hit a breakpoint each time this event fires"
                    },
                    {
                        "id": "snapshot",
                        "about": "take a snapshot of the feature(s)",
                        "value": "true"
                    },
                    {
                        "id": "stub",
                        "about": "Creates a stub listener (liferay will not get events)",
                        "value": "false"
                    },
                    {
                        "id": "trace",
                        "about": "write to console",
                        "value": "false"
                    }]
                },
                "about": "Listens for mediator events, re-interprets the arguments and triggers a new event on the civics channel",
                "mid": "app/commands/liferay-interpreter",
                "type": "startup"
            },
            {
                "id": "reverse-locator",
                "about": "detect when map is clicked",
                "mid": "app/commands/feature-selection-tool",
                "type": "startup",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "type",
                        "about": "User can click the map to query feature info (set value to point+box for multi-select)",
                        "value": "point"
                    },
                    {
                        "id": "event",
                        "about": "Identifies the desired EVENT handler",
                        "value": "map-or-feature-click"
                    },
                    {
                        "id": "buffer-size",
                        "about": "Make the buffer area large enough to easily select point features",
                        "value": "16"
                    },
                    {
                        "id": "condition",
                        "about": "shift, ctrl, alt must not be pressed",
                        "value": "none"
                    },
                    {
                        "id": "max-feature-count",
                        "about": "only consider the first feature",
                        "value": "<%= max_feature_count %>"
                    },
                    {
                        "id": "exclude-layer",
                        "value": "green-zone"
                    }]
                }
            },
            {
                "id": "get-info-tool",
                "about": "Allow user to click a feature to display information about that feature; this is failing because the map is not loaded by the time this runs so moving it into a toolbar control",
                "mid": "app/commands/feature-selection-tool",
                "text": "Get Info",
                "type": "startup",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "type",
                        "about": "User can click the map to query feature info (set value to point+box for multi-select)",
                        "value": "point"
                    },
                    {
                        "id": "event",
                        "about": "Identifies the desired EVENT handler",
                        "value": "show-info"
                    },
                    {
                        "id": "buffer-size",
                        "about": "Make the buffer area large enough to easily select point features",
                        "value": "16"
                    },
                    {
                        "id": "condition",
                        "value": "none"
                    },
                    {
                        "id": "exclude-layer",
                        "value": "green-zone"
                    }]
                }
            },
            {
                "id": "add-projection",
                "about": "defines available proj4 projections",
                "mid": "app/commands/add-projection",
                "type": "startup",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "EPSG:102707",
                        "value": "+proj=tmerc +lat_0=34.75 +lon_0=-115.5833333333333 +k=0.9999 +x_0=200000 +y_0=7999999.999999999 +datum=NAD83 +units=us-ft +no_defs"
                    },
                    {
                        "id": "EPSG:3421",
                        "value": "+proj=tmerc +lat_0=34.75 +lon_0=-115.5833333333333 +k=0.9999 +x_0=200000.00001016 +y_0=8000000.000010163 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs"
                    },
                    {
                        "id": "EPSG:4269",
                        "value": "+proj=longlat +ellps=GRS80 +datum=NAD83 +no_defs"
                    },
                    {
                        "id": "EPSG:102113",
                        "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                    },
                    {
                        "id": "EPSG:3857",
                        "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                    },
                    {
                        "id": "EPSG:26729",
                        "value": "+proj=tmerc +lat_0=30.5 +lon_0=-85.83333333333333 +k=0.99996 +x_0=152400.3048006096 +y_0=0 +datum=NAD27 +units=us-ft +no_defs"
                    },
                    {
                        "id": "EPSG:102726",
                        "value": "+proj=lcc +lat_1=44.33333333333334 +lat_2=46 +lat_0=43.66666666666666 +lon_0=-120.5 +x_0=2500000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs"
                    },
                    {
                        "id": "EPSG:102100",
                        "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                    },
                    {
                        "id": "EPSG:2193",
                        "value": "+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
                    }]
                }
            },
            {
                "id": "feature-collection-handler",
                "about": "watches the feature collection and keeps it in sync with a vector layer",
                "mid": "app/commands/feature-collection-handler",
                "type": "startup",
                "disabled": false
            }]
        },
        "about": "Allows user to click the map to find parcels and associated addresses.  If no parcel is found then an address search is attempted.  It will only search if the associated layer is visible.",
        "text": "test mixin",
        "Events": {
            "Events": [{
                "name": "address-result-raw",
                "id": "address-attribute-mapper",
                "about": "Modify the raw address data by adding locationLine1 and locationLine2 to the feature models",
                "mid": "app/commands/view-model",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "in",
                        "about": "These are localization references which each map into the \"out\" fields.  Both lines can contain multiple fields.",
                        "value": "<%= address_location_line_1 %>, <%= address_location_line_2 %>"
                    },
                    {
                        "id": "out",
                        "about": "These are the attributes that are added to the feature model",
                        "value": "locationLine1, locationLine2"
                    },
                    {
                        "id": "event",
                        "about": "The address model is now ready to be consumed because it now has the desired attributes",
                        "value": "address-result-ready"
                    }]
                }
            },
            {
                "name": "address-join-results-raw",
                "id": "address-join-attribute-mapper",
                "about": "Modify the raw detail address data by adding locationLine1 and locationLine2 to the feature models",
                "mid": "app/commands/view-model",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "in",
                        "about": "These are localization references which each map into the \"out\" fields.  Both lines can contain multiple fields.",
                        "value": "<%= address_location_line_1 %>, <%= address_location_line_2 %>"
                    },
                    {
                        "id": "out",
                        "about": "These are the attributes that are added to the feature model",
                        "value": "locationLine1, locationLine2"
                    },
                    {
                        "id": "event",
                        "about": "Notify that the addresses associated with the parcel are ready; it now has the desired attributes.",
                        "value": "address-join-results-ready"
                    }]
                }
            },
            {
                "name": "liferay:universal-search",
                "id": "universal-search-interpreter",
                "about": "redirects a liferay 'universal-search' event to a native 'universal-search' event allowing liferay to invoke map searches",
                "mid": "app/commands/trigger",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "universal-search"
                    }]
                }
            },
            {
                "id": "feature-is-not-click-validator",
                "about": "Overridden to attempt a parcel geocode when no feature has been clicked",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "No feature clicked, clear existing features, attempt parcel reverse-geocode if parcel layer is visible",
                        "value": "clear-features-from-layer,attempt-parcel-reverse-geocode"
                    },
                    {
                        "id": "max-result-count",
                        "about": "We don't want any zones!",
                        "value": "0"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is at least one feature",
                        "value": "false"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    }]
                },
                "name": "map-or-feature-click",
                "mid": "app/commands/validator",
                "type": "action"
            },
            {
                "id": "ags-address-locator",
                "about": "Overridden to disable, should only happen when address layer is visible",
                "disabled": true,
                "name": "universal-search",
                "mid": "app/commands/ags-geoquery-locator",
                "text": "Address Locator",
                "type": "find",
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>/<%= address_layer_id %>&sr=4326"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    },
                    {
                        "id": "keywords",
                        "value": "address"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "auto-zoom,report-search-status"
                    },
                    {
                        "id": "max-feature-count",
                        "value": "<%= max_feature_count %>"
                    },
                    {
                        "id": "type",
                        "value": "find"
                    },
                    {
                        "id": "message",
                        "value": "Address Search Completed"
                    }]
                }
            },
            {
                "id": "ags-parcel-locator",
                "about": "Overridden to disable, only perform when the parcel layer is checked so moved to that layer",
                "disabled": true,
                "name": "universal-search",
                "mid": "app/commands/ags-geoquery-locator",
                "text": "Parcel Locator",
                "type": "find",
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>/<%= parcel_layer_id %>&sr=4326"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    },
                    {
                        "id": "keywords",
                        "value": "parcel"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "auto-zoom,report-search-status"
                    },
                    {
                        "id": "max-feature-count",
                        "value": "<%= max_feature_count %>"
                    },
                    {
                        "id": "type",
                        "value": "find"
                    },
                    {
                        "id": "message",
                        "value": "Parcel Search Completed"
                    },
                    {
                        "id": "symbology",
                        "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                        "value": "parcels"
                    },
                    {
                        "id": "zoommap",
                        "value": "true"
                    },
                    {
                        "id": "layer-name",
                        "about": "merge features into the parcel-features layer",
                        "value": "parcel-features"
                    }]
                }
            },
            {
                "name": "address-reverse-geoquery",
                "id": "ags-address-reverse-locator",
                "about": "Override to only respond to address-reverse-geoquery",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "once the addresses are found notify the handler that will transform the attribute data",
                        "value": "address-result-raw"
                    },
                    {
                        "id": "buffer-size",
                        "value": "16"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    },
                    {
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    },
                    {
                        "id": "layers",
                        "value": "<%= address_layer_id %>"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    }]
                },
                "mid": "app/commands/ags-geoquery-locator",
                "type": "spatial"
            },
            {
                "name": "parcel-reverse-geoquery",
                "id": "ags-parcel-reverse-locator",
                "about": "Override to only respond to parcel-reverse-geoquery",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "once the parcels are found notify that parcel results are ready",
                        "value": "parcel-result-ready"
                    },
                    {
                        "id": "buffer-size",
                        "value": "1"
                    },
                    {
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>"
                    },
                    {
                        "id": "symbology",
                        "value": "parcels"
                    },
                    {
                        "id": "layers",
                        "value": "<%= parcel_layer_id %>"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    }]
                },
                "mid": "app/commands/ags-geoquery-locator",
                "text": "Parcel Locator",
                "type": "spatial"
            },
            {
                "name": "address-result-ready",
                "id": "address-found",
                "about": "If address found add it to the address layer",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                        "value": "add-to-address-layer"
                    },
                    {
                        "id": "min-result-count",
                        "about": "We don't want any zones!",
                        "value": "1"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is at least one feature",
                        "value": "false"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    },
                    {
                        "id": "max-result-count",
                        "about": "Do not perform max test",
                        "value": ""
                    }]
                }
            },
            {
                "name": "address-result-ready",
                "id": "address-not-found",
                "about": "If address not found render the click location",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                        "value": "show-coordinates"
                    },
                    {
                        "id": "max-result-count",
                        "about": "No address found so show click location",
                        "value": "0"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is at least one feature",
                        "value": "false"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    },
                    {
                        "id": "min-result-count",
                        "about": "No results",
                        "value": "0"
                    },
                    {
                        "id": "trace",
                        "value": "true"
                    }]
                }
            },
            {
                "name": "parcel-result-ready",
                "id": "parcel-found",
                "about": "If parcel found add it to the parcel layer",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                        "value": "add-to-parcel-layer"
                    },
                    {
                        "id": "min-result-count",
                        "about": "We don't want any zones!",
                        "value": "1"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is at least one feature",
                        "value": "false"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    },
                    {
                        "id": "max-result-count",
                        "about": "Do not perform max test",
                        "value": ""
                    }]
                }
            },
            {
                "name": "parcel-result-ready",
                "id": "parcel-not-found",
                "about": "If parcel not found attempt an address reverse-geocode",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "No parcel was found so search for an address if the address layer is checked",
                        "value": "attempt-address-reverse-geocode"
                    },
                    {
                        "id": "max-result-count",
                        "about": "No parcel found okay to attempt address search",
                        "value": "0"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is at least one feature",
                        "value": "false"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    },
                    {
                        "id": "min-result-count",
                        "about": "No results found",
                        "value": "0"
                    }]
                }
            },
            {
                "name": "show-click-location",
                "id": "forward-show-click-location",
                "mid": "app/commands/trigger",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "civics:map-click-results"
                    },
                    {
                        "id": "trace",
                        "value": "true"
                    }]
                }
            },
            {
                "id": "reverse-geoquery-multiplexer",
                "disabled": true,
                "name": "reverse-geoquery",
                "about": "Each time reverse-geoquery initiates wait until both the address and parcel search returns before raising show-coordinates",
                "mid": "app/commands/multiplexer",
                "Options": {
                    "Values": [{
                        "id": "once",
                        "about": "Only do this once per \"use-this-parcel\" event",
                        "value": "true"
                    },
                    {
                        "id": "in",
                        "value": "add-to-address-layer,add-to-parcel-layer,associated-addresses,find-associated-addresses"
                    },
                    {
                        "id": "out",
                        "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                        "value": "show-coordinates,civics:map-click-results"
                    }]
                }
            },
            {
                "name": "find-associated-addresses",
                "id": "find-associated-addresses-handler",
                "about": "Get addresses associated with a parcel",
                "mid": "app/commands/ags-geoquery-locator",
                "text": "",
                "type": "join",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>"
                    },
                    {
                        "id": "layers",
                        "value": "<%= address_layer_id %>"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    },
                    {
                        "id": "event",
                        "value": "associated-addresses"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    }]
                }
            },
            {
                "name": "map-or-feature-click",
                "id": "feature-is-click-validator",
                "about": "If one or more features are clicked...",
                "mid": "app/commands/validator",
                "type": "action",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "Identifies the desired EVENT handler",
                        "value": "show-feature-info"
                    },
                    {
                        "id": "min-result-count",
                        "about": "There is no constraint on the minimum result count because we don't want any zones",
                        "value": "1"
                    },
                    {
                        "id": "trigger-invalid",
                        "about": "Do not trigger if there is not at least one feature",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "add-to-points-layer,liferay:add-to-points-layer",
                "id": "add-to-points-layer-handler",
                "about": "Adds a point to the points layer",
                "mid": "app/commands/add-features-to-layer",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "layer-name",
                        "value": "points"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "show-coordinates",
                "id": "show-coordinates-validator",
                "about": "If no features are found create a feature from the coordinate and render it",
                "mid": "app/commands/validator",
                "type": "action",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "Create a point at the clicked location only when there are no features present",
                        "value": "show-click-location"
                    },
                    {
                        "id": "max-result-count",
                        "about": "We don't want any zones!",
                        "value": "0"
                    },
                    {
                        "id": "trigger-invalid",
                        "value": "false"
                    },
                    {
                        "id": "show-coordinates",
                        "value": "true"
                    }]
                }
            },
            {
                "name": "show-click-location",
                "id": "show-click-location-handler",
                "about": "Adds a feature to the map every time the user clicks on a non-feature (features are after every click so this has to happen last)",
                "mid": "app/commands/create-point-feature",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "Renders the click location as a point on the points layer",
                        "value": "add-to-points-layer"
                    },
                    {
                        "id": "symbology",
                        "value": "points"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    }]
                }
            },
            {
                "id": "show-info-handler",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "template",
                        "about": "Default to the civics template which renders the label and the field values listed in the 'field-list'",
                        "value": "app/templates/civics-infoviewer-template"
                    },
                    {
                        "id": "use-svg",
                        "value": "false"
                    }]
                },
                "name": "show-info",
                "about": "Opens an infoviewer on the map",
                "mid": "app/commands/popup-tool"
            },
            {
                "name": "universal-search",
                "id": "google-locator",
                "about": "Listens for 'universal-search' and attempts to find an address or intersection via a google search",
                "mid": "app/commands/google-geocoder",
                "text": "Google Address Locator",
                "type": "find",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "region",
                        "about": "limit search results to the United States (not working)",
                        "value": "US"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "geoquery-result"
                    },
                    {
                        "id": "key-template",
                        "value": "<%=place_id %>"
                    }]
                }
            },
            {
                "name": "map-click",
                "id": "google-reverse-locator",
                "about": "reverse-geocode on every map-click",
                "mid": "app/commands/google-geocoder",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "reverse",
                        "about": "one of true,false,auto but in this case true will try to find an address when the map is clicked",
                        "value": "true"
                    },
                    {
                        "id": "google-result-type",
                        "about": "valid values include street_address, neighborhood, political, postal_code, administrative_area_level_1, administrative_area_level_2",
                        "value": "street_address"
                    },
                    {
                        "id": "key-template",
                        "about": "the place_id is a google feature identifier, use it as our feature key",
                        "value": "<%=place_id %>"
                    },
                    {
                        "id": "event",
                        "about": "Place the marker on the map (the marker has a label so don't show the info viewer)",
                        "value": "geoquery-result"
                    },
                    {
                        "id": "condition",
                        "about": "Only executes when the shift key is pressed",
                        "value": "shift"
                    }]
                }
            },
            {
                "name": "universal-search",
                "id": "ags-property-locator",
                "about": "Use the AGS find service to search for properties",
                "mid": "app/commands/ags-geoquery-locator",
                "text": "Property Locator",
                "type": "find",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "<%= primary_mapserver_url %>/15&sr=4326"
                    },
                    {
                        "id": "symbology",
                        "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                        "value": "properties"
                    },
                    {
                        "id": "zoommap",
                        "value": "true"
                    },
                    {
                        "id": "key-template",
                        "value": "<%= layer_key_template %>"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "geoquery-result"
                    },
                    {
                        "id": "type",
                        "value": "find"
                    }]
                }
            },
            {
                "name": "show-in-map",
                "id": "show-in-map-handler",
                "about": "Add features on the map",
                "mid": "app/commands/render-features",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "grid",
                        "value": "false"
                    },
                    {
                        "id": "map",
                        "value": "true"
                    },
                    {
                        "id": "preserve-extent",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "add-to-address-layer",
                "id": "add-to-address-layer-handler",
                "about": "Adds features on argument stack to the address-features layer",
                "mid": "app/commands/add-features-to-layer",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "layer-name",
                        "about": "Identifies the layer that will receive the features",
                        "value": "address-features"
                    },
                    {
                        "id": "symbology",
                        "about": "Identify the default feature symbology",
                        "value": "addresses"
                    }]
                }
            },
            {
                "name": "add-to-parcel-layer",
                "id": "add-to-parcel-layer-handler",
                "about": "Adds features on argument stack to the parcel-features layer",
                "mid": "app/commands/add-features-to-layer",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "layer-name",
                        "about": "Identifies the layer that will receive the features",
                        "value": "parcel-features"
                    },
                    {
                        "id": "symbology",
                        "about": "Identify the default feature symbology",
                        "value": "parcels"
                    }]
                }
            },
            {
                "name": "auto-zoom,liferay:auto-zoom",
                "id": "auto-zoom-handler",
                "about": "When invoked, changes the map extent to include the features on the event stack",
                "mid": "app/commands/auto-zoom",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "panmap",
                        "about": "Allow the map to pan",
                        "value": "true"
                    },
                    {
                        "id": "zoommap",
                        "about": "Allow the map to zoom",
                        "value": "true"
                    },
                    {
                        "id": "preserve-extent",
                        "about": "true => Prevent the current viewport to pan out of view",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "current-location",
                "id": "current-location-handler",
                "about": "pan to current location, chrome requires https",
                "mid": "app/commands/geolocation-tool",
                "type": "action",
                "disabled": false
            },
            {
                "name": "universal-search",
                "id": "ips-address-locator",
                "about": "Search addresses for universal search value",
                "mid": "app/commands/ips-geoquery-locator",
                "text": "Address Locator",
                "type": "find",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "property/addresses"
                    },
                    {
                        "id": "service-query-template",
                        "value": "{\r\n    \"formulaName\": \"FalseMapValidation\",\r\n    \"Data\": {\r\n        \"attributes\": {\r\n            \"PARCLKEY\": 10153454,\r\n            \"PARCLID\": \"00005-44454-4546\"\r\n        }\r\n    }\r\n}"
                    },
                    {
                        "id": "symbology",
                        "value": "addresses"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "geoquery-result"
                    }]
                }
            },
            {
                "name": "universal-search",
                "id": "ips-crm-servicerequest-locator",
                "about": "Search service requests for universal search value",
                "mid": "app/commands/ips-geoquery-locator",
                "text": "Address Locator",
                "type": "find",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "query-service",
                        "value": "crm/ServiceRequests"
                    },
                    {
                        "id": "service-query-template",
                        "value": "{filter:{property:id,operator:Equals,value:\"<%- location %>\"}}"
                    },
                    {
                        "id": "symbology",
                        "value": "crm-servicerequest"
                    },
                    {
                        "id": "event",
                        "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                        "value": "geoquery-result"
                    }]
                }
            },
            {
                "name": "show-info-handler-controller",
                "id": "synthetic-click",
                "about": "When paging occurs treat that as if the user clicked the associated feature",
                "mid": "app/commands/infoviewer-paging-as-feature-click-event",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "about": "highlight the feature each time the user pages",
                        "value": "flash-buffer"
                    },
                    {
                        "id": "debug",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "flash-buffer",
                "id": "flash-buffer-handler",
                "about": "Temporarily display geometry",
                "mid": "app/commands/flash-feature",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "delay",
                        "about": "wait one second before removing feature",
                        "value": "0"
                    }]
                }
            },
            {
                "name": "liferay:map-trace-extent",
                "id": "map-trace-extent-handler",
                "about": "return map extent for filtering",
                "mid": "app/commands/api/get-current-extent",
                "disabled": false
            },
            {
                "name": "command",
                "id": "command-handler",
                "about": "Allows commands to execute via trigger(\"command\", args), facilitates command interception",
                "mid": "app/commands/command-handler",
                "disabled": false
            },
            {
                "name": "map-resolution",
                "id": "map-event-handler",
                "about": "logs the maps viewstate",
                "mid": "app/commands/map-event-handler",
                "disabled": true
            },
            {
                "name": "feature-hover",
                "id": "feature-hover-handler",
                "about": "Highlight feature when cursor moves over it",
                "mid": "app/commands/feature-highlight-handler",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "symbology",
                        "about": "Identify styling rules for features under the cursor",
                        "value": "hover"
                    }]
                }
            },
            {
                "name": "show-in-grid",
                "id": "show-in-grid-handler",
                "about": "Add features to the grid",
                "mid": "app/commands/render-features",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "grid",
                        "value": "true"
                    },
                    {
                        "id": "map",
                        "value": "false"
                    }]
                }
            },
            {
                "name": "show-layer",
                "id": "show-layer-handler",
                "about": "If layer is decorated with an extent then ensure that extent is visible when layer is made visible",
                "mid": "app/commands/show-layer-handler",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "panmap",
                        "value": "true"
                    },
                    {
                        "id": "zoommap",
                        "value": "true"
                    }]
                }
            },
            {
                "name": "geoquery-result",
                "id": "geoquery-result-handler",
                "mid": "app/commands/geoquery-result-handler",
                "text": "Query Results",
                "type": "geoquery-form",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "panmap",
                        "about": "overrides auto-zoom configuration to ensure map pans",
                        "value": "true"
                    },
                    {
                        "id": "zoommap",
                        "about": "overrides auto-zoom configuration to ensure map zooms",
                        "value": "true"
                    },
                    {
                        "id": "event",
                        "about": "show the feature on the map and pan+zoom the feature(s) into view",
                        "value": "show-in-map,auto-zoom"
                    }]
                }
            },
            {
                "name": "report-search-status",
                "id": "report-search-status-handler",
                "about": "Add \"growl\" handler to support notifying user when no results are found",
                "mid": "app/commands/growl",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "remove-delay",
                        "about": "Clear message after 5 seconds",
                        "value": "5"
                    },
                    {
                        "id": "className",
                        "value": "ol-control top-4 left-3 growl"
                    }]
                }
            },
            {
                "name": "liferay:use-this-parcel",
                "id": "parcel-selection-handler",
                "about": "Once user selects a parcel broadcast events to run a zones query, zone validation query and parcel validation query",
                "mid": "app/commands/trigger",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "in-red-zone,in-green-zone,in-zone"
                    },
                    {
                        "id": "trace",
                        "value": "true"
                    }]
                }
            },
            {
                "name": "in-zone",
                "id": "in-zone-handler",
                "about": "invoke a zone query for any zones that intersect the currently selected feature",
                "mid": "app/commands/ags-geoquery-locator",
                "type": "spatial",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "in-zone-handler"
                    },
                    {
                        "id": "query-service",
                        "value": "<%= primary_featureserver_url %>"
                    },
                    {
                        "id": "layers",
                        "about": "This is the 'areas' layer on the IPS drawings",
                        "value": "<%= zone_layer_id %>"
                    },
                    {
                        "id": "filter",
                        "about": "get all zones",
                        "value": "1=1"
                    },
                    {
                        "id": "returnGeometry",
                        "value": "false"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    }]
                }
            },
            {
                "name": "in-red-zone",
                "id": "in-red-zone-handler",
                "about": "invoke a zone query for the total count of zones that intersect the currently selected feature",
                "mid": "app/commands/ags-geoquery-locator",
                "type": "spatial",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "red-zone-count"
                    },
                    {
                        "id": "query-service",
                        "value": "<%= primary_featureserver_url %>"
                    },
                    {
                        "id": "layers",
                        "about": "This is the 'areas' layer on the IPS drawings",
                        "value": "<%= zone_layer_id %>"
                    },
                    {
                        "id": "filter",
                        "about": "Just an example of filtering out valid zones, here only 'RED' zones are counted",
                        "value": "<%= red_zone_filter %>"
                    },
                    {
                        "id": "returnCountOnly",
                        "value": "true"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    }]
                }
            },
            {
                "name": "in-green-zone",
                "id": "in-green-zone-handler",
                "about": "invoke a zone query for the total count of zones that intersect the currently selected feature",
                "mid": "app/commands/ags-geoquery-locator",
                "type": "spatial",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "event",
                        "value": "green-zone-count"
                    },
                    {
                        "id": "query-service",
                        "value": "<%= primary_featureserver_url %>"
                    },
                    {
                        "id": "layers",
                        "about": "This is the 'areas' layer on the IPS drawings",
                        "value": "<%= zone_layer_id %>"
                    },
                    {
                        "id": "filter",
                        "about": "Just an example of filtering out valid zones, here only 'GREEN' zones are counted",
                        "value": "<%= green_zone_filter %>"
                    },
                    {
                        "id": "returnCountOnly",
                        "value": "true"
                    },
                    {
                        "id": "type",
                        "value": "spatial"
                    }]
                }
            },
            {
                "name": "red-zone-count",
                "id": "red-zone-valid",
                "about": "Validates the zone-count-handler results, if the count=0 then valid",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "max-result-count",
                        "about": "We do not want any zones!",
                        "value": "0"
                    }]
                }
            },
            {
                "name": "green-zone-count",
                "id": "green-zone-valid",
                "about": "Validates the zone-count-handler results, if the count>1 then valid",
                "mid": "app/commands/validator",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "min-result-count",
                        "about": "must be in the green zone",
                        "value": "1"
                    }]
                }
            },
            {
                "name": "liferay:use-this-parcel,civics:show-details,liferay:which-zone",
                "id": "parcel-validation-multiplexer",
                "about": "Report the current feature, validation results and intersecting zones back to civics",
                "mid": "app/commands/multiplexer",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "once",
                        "about": "Only do this once per \"use-this-parcel\" event",
                        "value": "true"
                    },
                    {
                        "id": "in",
                        "value": "in-zone-handler,red-zone-valid,green-zone-valid"
                    },
                    {
                        "id": "out",
                        "value": "civics:zone-validation"
                    },
                    {
                        "id": "trace",
                        "value": "true"
                    },
                    {
                        "id": "debug",
                        "value": "true"
                    }]
                }
            },
            {
                "name": "civics:zone-validation",
                "id": "parcel-zone-package-handler",
                "about": "Prepare the results before sending to civics",
                "mid": "app/commands/trigger",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "trace",
                        "value": "true"
                    }]
                }
            }]
        },
        "Controls": {
            "Controls": [{
                "Events": {
                    "Events": [{
                        "name": "change",
                        "id": "change-handler",
                        "about": "When the input changes trigger a universal search event",
                        "mid": "app/commands/trigger",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                "id": "event",
                                "about": "When the input changes trigger a universal search",
                                "value": "clear-features-from-layer,universal-search"
                            }]
                        }
                    }]
                },
                "id": "universal-search-input",
                "about": "Creates an 'input' control on the map",
                "mid": "app/controls/ol3-control",
                "text": "🔍",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "className",
                        "about": "Position the input in the top-left corner, configure the control to keep the expander to the left (via 'right')",
                        "value": "ol-control top-2 left-2 ol-input right"
                    },
                    {
                        "id": "control-type",
                        "about": "identify the ol3 constructor/class",
                        "value": "Input"
                    },
                    {
                        "id": "valueName",
                        "about": "output 'location' instead of 'value'",
                        "value": "location"
                    },
                    {
                        "id": "expanded",
                        "about": "Start the control already expanded",
                        "value": "true"
                    },
                    {
                        "id": "autoCollapse",
                        "about": "When user presses enter collapse the control",
                        "value": "false"
                    },
                    {
                        "id": "closedText",
                        "about": "Text when the control is collapsed",
                        "value": "🔍"
                    },
                    {
                        "id": "openedText",
                        "about": "Text when the control is expanded (collapses to the left)",
                        "value": "«"
                    },
                    {
                        "id": "placeholderText",
                        "value": "Search by location or parcel"
                    }]
                }
            },
            {
                "id": "map-overview-map",
                "about": "alternative zoom control",
                "mid": "app/controls/ol3-control",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "control-type",
                        "about": "identify the ol3 constructor/class",
                        "value": "OverviewMap"
                    },
                    {
                        "id": "className",
                        "about": "top-left",
                        "value": "top-3 right-2 ol-overviewmap"
                    },
                    {
                        "id": "label",
                        "about": "Text to display when the map is collapsed",
                        "value": "«"
                    },
                    {
                        "id": "collapseLabel",
                        "about": "text to display when the control is expanded (click to collapse)",
                        "value": "»"
                    }]
                }
            },
            {
                "id": "map-mouse-position",
                "about": "adds mouse coordinates to map, for testing and demonstration of why generic ol3-control is a trade-off",
                "mid": "app/controls/ol3-control",
                "disabled": true,
                "Options": {
                    "Values": [{
                        "id": "control-type",
                        "about": "identify the ol3 constructor/class",
                        "value": "MousePosition"
                    },
                    {
                        "id": "className",
                        "about": "top-left container",
                        "value": "ol-control top-2 right-3 ol-mouse-position"
                    },
                    {
                        "id": "undefinedHTML",
                        "about": "see http://openlayers.org/en/latest/apidoc/ol.control.MousePosition.html",
                        "value": "X,Y"
                    },
                    {
                        "id": "projection",
                        "about": "render coordinates using this projection",
                        "value": "EPSG:4326"
                    },
                    {
                        "id": "coordinateFormat",
                        "about": "example of why generic control will not work, requires an interpreter like map-hover-handler otherwise no way to specify 'coordinateFormat'",
                        "value": "eval(ol.coordinate.createStringXY(5))"
                    }]
                }
            },
            {
                "Controls": {
                    "Controls": [{
                        "id": "map-full-screen",
                        "about": "Display the map full screen",
                        "mid": "app/controls/ol3-control",
                        "type": "na",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                "id": "control-type",
                                "about": "identify the ol3 constructor/class",
                                "value": "FullScreen"
                            },
                            {
                                "id": "label",
                                "about": "http://openlayers.org/en/latest/apidoc/ol.control.FullScreen.html",
                                "value": "⤢"
                            }]
                        }
                    },
                    {
                        "id": "map-rotate",
                        "about": "Restores the map view to the original orientation",
                        "mid": "app/controls/ol3-control",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                "id": "control-type",
                                "about": "identify the ol3 constructor/class",
                                "value": "Rotate"
                            },
                            {
                                "id": "className",
                                "about": "top-left",
                                "value": "ol-zoom-extent"
                            }]
                        }
                    },
                    {
                        "id": "map-zoom-to-extent",
                        "about": "Restores the map to the original \"full\" extent",
                        "mid": "app/controls/ol3-control",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                "id": "control-type",
                                "about": "identify the ol3 constructor/class",
                                "value": "ZoomToExtent"
                            },
                            {
                                "id": "extent",
                                "about": "experimenting with eval",
                                "value": "eval([-12830000, 4320000,-12820000, 4330000])"
                            },
                            {
                                "id": "className",
                                "about": "top-left",
                                "value": "ol-zoom-extent"
                            }]
                        }
                    }]
                },
                "id": "top-right-toolbar",
                "about": "adds a control to the ol3 map control collection",
                "mid": "app/controls/map-panel",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "stack",
                        "value": "vertical"
                    },
                    {
                        "id": "position",
                        "value": "top-2 right-2"
                    }]
                }
            },
            {
                "Commands": {
                    "Commands": [{
                        "id": "current-location",
                        "about": "Invokes the 'current-location' handler, switch type to \"action\" to make it a button",
                        "mid": "app/commands/trigger",
                        "text": "⌖",
                        "type": "action",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                "id": "region",
                                "value": "current-location-tool"
                            },
                            {
                                "id": "title",
                                "value": "Go to current Location"
                            },
                            {
                                "id": "css-name",
                                "value": "current-location"
                            },
                            {
                                "id": "event",
                                "about": "This button triggers this event for the actual handler",
                                "value": "current-location"
                            }]
                        }
                    }]
                },
                "id": "current-location",
                "about": "adds a control to the ol3 map control collection",
                "mid": "app/controls/map-panel",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "position",
                        "value": "bottom-3 left-2"
                    }]
                }
            },
            {
                "id": "layer-switcher",
                "about": "adds a control to the ol3 map control collection, note 'text' is not honored because labels are defined in CSS for this control",
                "mid": "app/controls/ol3-control",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "className",
                        "about": "Position in the bottom-left of the map, decorate as necessary",
                        "value": "layer-switcher bottom-2 left-2"
                    },
                    {
                        "id": "control-type",
                        "about": "identify the ol3 constructor/class",
                        "value": "LayerSwitcher"
                    },
                    {
                        "id": "closeOnMouseOut",
                        "value": "false"
                    },
                    {
                        "id": "openOnMouseOver",
                        "value": "false"
                    }]
                }
            },
            {
                "id": "map-scale-line",
                "about": "scaleline",
                "mid": "app/controls/ol3-control",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "control-type",
                        "about": "identify the ol3 constructor/class",
                        "value": "ScaleLine"
                    },
                    {
                        "id": "className",
                        "about": "top-left container",
                        "value": "ol-control bottom-2 right-3 ol-scale-line"
                    },
                    {
                        "id": "units",
                        "about": "Use imperial measurements (degrees, imperial, nautical, metric, us)",
                        "value": "us"
                    }]
                }
            },
            {
                "Commands": {
                    "Commands": [{
                        "id": "zoom-in",
                        "mid": "app/commands/zoom",
                        "text": "+",
                        "type": "action",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                "id": "direction",
                                "value": "in"
                            },
                            {
                                "id": "css-name",
                                "value": "zoom-in"
                            },
                            {
                                "id": "title",
                                "about": "Tooltip Description",
                                "value": "Zoom In"
                            }]
                        }
                    }]
                },
                "id": "zoom-in-tool",
                "about": "adds a control to the ol3 map control collection",
                "mid": "app/controls/map-panel",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "position",
                        "value": "bottom-3 right-2"
                    }]
                }
            },
            {
                "Commands": {
                    "Commands": [{
                        "id": "zoom-out",
                        "mid": "app/commands/zoom",
                        "text": "−",
                        "type": "action",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                "id": "direction",
                                "value": "out"
                            },
                            {
                                "id": "css-name",
                                "value": "zoom-out"
                            },
                            {
                                "id": "title",
                                "about": "Tooltip Description",
                                "value": "Zoom Out"
                            }]
                        }
                    }]
                },
                "id": "zoom-out-tool",
                "about": "adds a control to the ol3 map control collection",
                "mid": "app/controls/map-panel",
                "disabled": false,
                "Options": {
                    "Values": [{
                        "id": "position",
                        "value": "bottom-2 right-2"
                    }]
                }
            }]
        },
        "Options": {
            "Values": [{
                "id": "css-name",
                "about": "loads a custom css to manipulate toolbar layout",
                "value": "rhythm-civics-base"
            },
            {
                "id": "css",
                "about": "stylesheet to load for this maplet",
                "value": "app/css/rhythm-civics-base.css"
            },
            {
                "id": "template",
                "about": "Markup for the view and regions",
                "value": "app/templates/rhythm-gis-template"
            },
            {
                "id": "region",
                "about": "Identifies the maplet container",
                "value": "gis-map-region"
            }]
        },
        "Localizations": {
            "Resources": [{
                "id": "agency-customization",
                "disabled": false,
                "Resources": [{
                    "id": "primary_mapserver_url",
                    "value": "https://localhost/ags/rest/services/IPS850/ORA2850/MapServer",
                    "about": "AGS MapServer url containing the address and parcel layers"
                },
                {
                    "id": "primary_featureserver_url",
                    "value": "https://localhost/ags/rest/services/ANNOTATIONS/IPS860_ANNOTATIONS/FeatureServer",
                    "about": "AGS MapServer url containing the zoning layer"
                },
                {
                    "id": "parcel_layer_id",
                    "value": "19",
                    "about": "Parcel layer identifier"
                },
                {
                    "id": "address_layer_id",
                    "value": "1",
                    "about": "Address layer identifier"
                },
                {
                    "id": "zone_layer_id",
                    "value": "3",
                    "about": "Zone layer identifier (red and green zones)"
                },
                {
                    "id": "layer_key_template",
                    "value": "<%- FID %>",
                    "about": "Field name template for uniquely identifying a feature"
                },
                {
                    "id": "address_location_line_1",
                    "value": "<%- STRNO %> <%- STRNAME %>",
                    "about": "Address field template for rendering the first line of the address"
                },
                {
                    "id": "address_location_line_2",
                    "value": "<%- CITY %> <%- ZIP %>",
                    "about": "Address field template for rendering the second line of the address"
                },
                {
                    "id": "primary_address_fields",
                    "value": "LONGNAME",
                    "about": "Identify the address fields that should represent an address title (CSV)"
                },
                {
                    "id": "secondary_address_fields",
                    "value": "OWNER,STRDIR,STRNAME,STRTYPE",
                    "about": "Identify the address fields that you want to see in the parcel infoviewer when the address is expanded"
                },
                {
                    "id": "green_zone_filter",
                    "value": "H8REGION in ('GREEN')",
                    "about": "Filter to apply to the zones layer to find only \"green\" zones."
                },
                {
                    "id": "red_zone_filter",
                    "value": "H8REGION NOT IN ('GREEN')",
                    "about": "Filter to apply to the zones layer to find only \"red\" zones."
                },
                {
                    "id": "primary_zone_field",
                    "value": "H8REGION",
                    "about": "Identify the field(s) used to distinguish a red zone from a green zone"
                },
                {
                    "id": "max_feature_count",
                    "value": "25",
                    "about": "The number of features to return when geocoding for an address or parcel"
                },
                {
                    "id": "address_symbol_title",
                    "value": "<%- STRNO %> <%- STRNAME %> <%- STRTYPE %><br>\r\n<%- CITY%> <%- STATE%>",
                    "about": "Title template for address markers"
                },
                {
                    "id": "parcel_symbol_title",
                    "value": "PARCEL <%- PRCLID %>",
                    "about": "Title template for parcel markers"
                },
                {
                    "id": "secondary_parcel_fields",
                    "value": "PRCLID",
                    "about": "These are the fields that are listed in the body of the feature infoviewer popup window"
                }]
            }]
        }
    },
    "href": "http://localhost/850rs/api/property/agencymaps/rhythm-civics-wizard"
};
