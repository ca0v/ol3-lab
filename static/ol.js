.ol-box {
  box-sizing: border-box;
  border-radius: 2px;
  border: 2px solid blue;
}

.ol-mouse-position {
  top: 8px;
  right: 8px;
  position: absolute;
}

.ol-scale-line {
  background: rgba(0,60,136,0.3);
  border-radius: 4px;
  bottom: 8px;
  left: 8px;
  padding: 2px;
  position: absolute;
}
.ol-scale-line-inner {
  border: 1px solid #eee;
  border-top: none;
  color: #eee;
  font-size: 10px;
  text-align: center;
  margin: 1px;
  will-change: contents, width;
  transition: all 0.25s;
}
.ol-scale-bar {
  position: absolute;
  bottom: 8px;
  left: 8px;
}
.ol-scale-step-marker {
  width: 1px;
  height: 15px;
  background-color: #000000;
  float: right;
  z-Index: 10;
}
.ol-scale-step-text {
  position: absolute;
  bottom: -5px;
  font-size: 12px;
  z-Index: 11;
  color: #000000;
  text-shadow: -2px 0 #FFFFFF, 0 2px #FFFFFF, 2px 0 #FFFFFF, 0 -2px #FFFFFF;
}
.ol-scale-text {
  position: absolute;
  font-size: 14px;
  text-align: center;
  bottom: 25px;
  color: #000000;
  text-shadow: -2px 0 #FFFFFF, 0 2px #FFFFFF, 2px 0 #FFFFFF, 0 -2px #FFFFFF;
}
.ol-scale-singlebar {
  position: relative;
  height: 10px;
  z-Index: 9;
  box-sizing: border-box;
  border: 1px solid black;
}

.ol-unsupported {
  display: none;
}
.ol-viewport, .ol-unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}
.ol-selectable {
  -webkit-touch-callout: default;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
.ol-grabbing {
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
  cursor: grabbing;
}
.ol-grab {
  cursor: move;
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: grab;
}
.ol-control {
  position: absolute;
  background-color: rgba(255,255,255,0.4);
  border-radius: 4px;
  padding: 2px;
}
.ol-control:hover {
  background-color: rgba(255,255,255,0.6);
}
.ol-zoom {
  top: .5em;
  left: .5em;
}
.ol-rotate {
  top: .5em;
  right: .5em;
  transition: opacity .25s linear, visibility 0s linear;
}
.ol-rotate.ol-hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity .25s linear, visibility 0s linear .25s;
}
.ol-zoom-extent {
  top: 4.643em;
  left: .5em;
}
.ol-full-screen {
  right: .5em;
  top: .5em;
}

.ol-control button {
  display: block;
  margin: 1px;
  padding: 0;
  color: white;
  font-size: 1.14em;
  font-weight: bold;
  text-decoration: none;
  text-align: center;
  height: 1.375em;
  width: 1.375em;
  line-height: .4em;
  background-color: rgba(0,60,136,0.5);
  border: none;
  border-radius: 2px;
}
.ol-control button::-moz-focus-inner {
  border: none;
  padding: 0;
}
.ol-zoom-extent button {
  line-height: 1.4em;
}
.ol-compass {
  display: block;
  font-weight: normal;
  font-size: 1.2em;
  will-change: transform;
}
.ol-touch .ol-control button {
  font-size: 1.5em;
}
.ol-touch .ol-zoom-extent {
  top: 5.5em;
}
.ol-control button:hover,
.ol-control button:focus {
  text-decoration: none;
  background-color: rgba(0,60,136,0.7);
}
.ol-zoom .ol-zoom-in {
  border-radius: 2px 2px 0 0;
}
.ol-zoom .ol-zoom-out {
  border-radius: 0 0 2px 2px;
}


.ol-attribution {
  text-align: right;
  bottom: .5em;
  right: .5em;
  max-width: calc(100% - 1.3em);
}

.ol-attribution ul {
  margin: 0;
  padding: 0 .5em;
  color: #000;
  text-shadow: 0 0 2px #fff;
}
.ol-attribution li {
  display: inline;
  list-style: none;
}
.ol-attribution li:not(:last-child):after {
  content: " ";
}
.ol-attribution img {
  max-height: 2em;
  max-width: inherit;
  vertical-align: middle;
}
.ol-attribution ul, .ol-attribution button {
  display: inline-block;
}
.ol-attribution.ol-collapsed ul {
  display: none;
}
.ol-attribution:not(.ol-collapsed) {
  background: rgba(255,255,255,0.8);
}
.ol-attribution.ol-uncollapsible {
  bottom: 0;
  right: 0;
  border-radius: 4px 0 0;
}
.ol-attribution.ol-uncollapsible img {
  margin-top: -.2em;
  max-height: 1.6em;
}
.ol-attribution.ol-uncollapsible button {
  display: none;
}

.ol-zoomslider {
  top: 4.5em;
  left: .5em;
  height: 200px;
}
.ol-zoomslider button {
  position: relative;
  height: 10px;
}

.ol-touch .ol-zoomslider {
  top: 5.5em;
}

.ol-overviewmap {
  left: 0.5em;
  bottom: 0.5em;
}
.ol-overviewmap.ol-uncollapsible {
  bottom: 0;
  left: 0;
  border-radius: 0 4px 0 0;
}
.ol-overviewmap .ol-overviewmap-map,
.ol-overviewmap button {
  display: inline-block;
}
.ol-overviewmap .ol-overviewmap-map {
  border: 1px solid #7b98bc;
  height: 150px;
  margin: 2px;
  width: 150px;
}
.ol-overviewmap:not(.ol-collapsed) button{
  bottom: 1px;
  left: 2px;
  position: absolute;
}
.ol-overviewmap.ol-collapsed .ol-overviewmap-map,
.ol-overviewmap.ol-uncollapsible button {
  display: none;
}
.ol-overviewmap:not(.ol-collapsed) {
  background: rgba(255,255,255,0.8);
}
.ol-overviewmap-box {
  border: 2px dotted rgba(0,60,136,0.7);
}

.ol-overviewmap .ol-overviewmap-box:hover {
  cursor: move;
}
