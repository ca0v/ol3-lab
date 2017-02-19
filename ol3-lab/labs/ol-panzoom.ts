import ol = require("openlayers");
import { PanZoom } from "ol3-panzoom";

export function run() {

  let panZoom = new PanZoom({
    imgPath: "https://raw.githubusercontent.com/ca0v/ol3-panzoom/v3.20.1/ol3-panzoom/resources/ol2img"
  });

  var map = new ol.Map({
    // replace the default `ol.control.Zoom` control by the `olpz.control.PanZoom`
    controls: ol.control.defaults({
      zoom: false
    }).extend([
      panZoom
    ]),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    target: 'map',
    view: new ol.View({
      center: ol.proj.transform([-70, 50], 'EPSG:4326', 'EPSG:3857'),
      zoom: 5
    })
  });
}