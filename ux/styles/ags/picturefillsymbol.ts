/*
the width and height of esri json is always in points but the construct uses pixels
A point is 1/72th of an inch where as a pixels dimensions vary but window.devicePixelRatio can help

One technique for getting the DPI of a device:

<div id='testdiv' style='height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;'></div>
<script type='text/javascript'>
  var devicePixelRatio = window.devicePixelRatio || 1;
  dpi_x = document.getElementById('testdiv').offsetWidth * devicePixelRatio;
  dpi_y = document.getElementById('testdiv').offsetHeight * devicePixelRatio;
</script>
*/

export =
    [{
        "color": [
            0,
            0,
            0,
            255
        ],
        "type": "esriPFS",
        "url": "http://www.free.designquery.com/01/bg0245.jpg",
        "width": 112.5,
        "height": 112.5,
        "xoffset": 0,
        "yoffset": 0,
        "xscale": 1,
        "yscale": 1
    }];