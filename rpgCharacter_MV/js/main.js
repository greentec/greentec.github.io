var layer_defs, net;
var n_z = 800;
var nowSelectedFrame = 1;
var input_w1, input_w2, input_w3;
var firstSelectedIndex = -1;
var secondSelectedIndex = -1;
var thirdSelectedIndex = -1;
var mean_z = [];

function calcMeanVector() {
  var charLen = parseInt(5000 / 9);
  var temp;
  var sum;
  var idx;

  for (var i = 0; i < 9; i += 1) {
    temp = [];

    for (var k = 0; k < n_z; k += 1) {
      sum = 0.0;

      for (var j = 0; j < charLen; j += 1) {
        idx = (i + j * 9 + 1).toString();
        sum += mean[idx][k];
      }

      sum /= charLen;
      temp.push(sum);
    }

    mean_z.push(temp);
  }

  var canvas;
  for (var i = 0; i < 9; i += 1) {
    canvas = document.getElementById('z_mean_canvas' + (i+1).toString());
    canvas.width = canvas.width;

    drawToCanvas(canvas, mean_z[i], 8, 8, 1);
  }

  document.getElementById('meanInput').value = '-3+5';

}

function getRandom() {
  var canvas;
  canvas = document.getElementById('z_canvas' + nowSelectedFrame.toString());
  canvas.width = canvas.width;

  var input_w;
  switch (nowSelectedFrame) {
    case 1:
      for (var i = 0; i < 800; i += 1) {
        input_w1[i] = rnd2();
      }
      drawToCanvas(canvas, input_w1, 8, 8, 1);
      break;

    case 2:
      for (var i = 0; i < 800; i += 1) {
        input_w2[i] = rnd2();
      }
      drawToCanvas(canvas, input_w2, 8, 8, 1);
      break;

    case 3:
      for (var i = 0; i < 800; i += 1) {
        input_w3[i] = rnd2();
      }
      drawToCanvas(canvas, input_w3, 8, 8, 1);
      break;
  }
}

function getZero() {
  var canvas;
  canvas = document.getElementById('z_canvas' + nowSelectedFrame.toString());
  canvas.width = canvas.width;

  var input_w;
  switch (nowSelectedFrame) {
    case 1:
      for (var i = 0; i < 800; i += 1) {
        input_w1[i] = 1e-5;
      }
      drawToCanvas(canvas, input_w1, 8, 8, 1);
      break;

    case 2:
      for (var i = 0; i < 800; i += 1) {
        input_w2[i] = 1e-5;
      }
      drawToCanvas(canvas, input_w2, 8, 8, 1);
      break;

    case 3:
      for (var i = 0; i < 800; i += 1) {
        input_w3[i] = 1e-5;
      }
      drawToCanvas(canvas, input_w3, 8, 8, 1);
      break;
  }
}

function getLerp() {
  var temp;
  var canvas = document.getElementById('lerpCanvas');
  canvas.width = canvas.width;

  drawToCanvas(canvas, input_w1, 0, 0);
  drawToCanvas(canvas, input_w2, 64 * 8, 0);

  for (var i = 0; i < 7; i += 1) {
    var t = 0.125 * (i+1);
    temp = lerp(input_w1, input_w2, t);
    drawToCanvas(canvas, temp, 64 * (i+1), 0);
  }
}

function getSlerp() {
  var temp;
  var canvas = document.getElementById('slerpCanvas');
  canvas.width = canvas.width;

  drawToCanvas(canvas, input_w1, 0, 0);
  drawToCanvas(canvas, input_w2, 64 * 8, 0);

  for (var i = 0; i < 7; i += 1) {
    var t = 0.125 * (i+1);
    temp = slerp(input_w1, input_w2, t);
    drawToCanvas(canvas, temp, 64 * (i+1), 0);
  }
}

function getJDiagram() {
  var temp;
  var canvas = document.getElementById('jDiagramCanvas');
  canvas.width = canvas.width;

  drawToCanvas(canvas, input_w1, 0, 0);
  drawToCanvas(canvas, input_w2, 384, 0);
  drawToCanvas(canvas, input_w3, 0, 256);

  var firstRow = [];
  for (var i = 0; i < 5; i += 1) {
    var t = 0.1 + 0.2 * i;
    temp = slerp(input_w1, input_w2, t);
    drawToCanvas(canvas, temp, 64 * (i+1), 0);

    firstRow.push(temp);
  }

  //get this first! (w2 + w3) - w1
  var rightBottom = [];
  for (var i = 0; i < n_z; i += 1) {
    rightBottom.push(input_w2[i] + input_w3[i] - input_w1[i]);
  }
  drawToCanvas(canvas, rightBottom, 64 * 5, 64 * 4);

  var lastRow = [];
  for (var i = 0; i < 4; i += 1) {
    var t = 0.2 * (i+1);
    temp = slerp(input_w3, rightBottom, t);
    drawToCanvas(canvas, temp, 64 * (i+1), 64 * 4);

    lastRow.push(temp);
  }
  lastRow.push(rightBottom);

  for (var i = 0; i < 5; i += 1) {
    for (var j = 0; j < 3; j += 1) {
      var t = (j+1) * 0.25;
      temp = slerp(firstRow[i], lastRow[i], t);
      drawToCanvas(canvas, temp, 64 * (i+1), 64 * (j+1));
    }
  }

}

function getMeanCalc() {
  var v = document.getElementById('meanInput').value;
  var temp = [];
  var mag = 1;

  for (var i = 0; i < n_z; i += 1) {
    temp.push(input_w1[i]);
  }

  var len = v.length;
  var char;
  var mul = 1;
  var idx;
  for (var i = 0; i < len; i += 1) {
    char = v[i];
    if (char == '+') {
      mul = 1;
    }
    else if (char == '-') {
      mul = -1;
    }
    else if ($.isNumeric(char) == false) {
      console.log('NaN Error. with ' + char);
      return;
    }
    else { //number
      idx = parseInt(char) - 1;
      if (idx > 8) {
        console.log('out of index Error. with ' + char);
        return;
      }
      for (var j = 0; j < n_z; j += 1) {
        temp[j] += mean_z[idx][j] * mul * mag;
      }
    }
  }

  var canvas = document.getElementById('meanCalcCanvas');
  canvas.width = canvas.width;
  drawToCanvas(canvas, temp, 0, 0);
}

function drawToCanvas(canvas, input_w, tx, ty, scale=2) {
  var ctx = canvas.getContext('2d');

  var input = new convnetjs.Vol(1, 1, 800);
  input.w = input_w;

  var dimension = 64 * 64 * 3;

  result = [];
  for (var i = 0; i < dimension; i += 1) {
    result.push(0.0);
  }

  var r;
  // no need to iterate. just multiply!
  // for (var m = 0; m < step; m += 1) {
  //   r = net.forward(input);
  //
  //   for (var i = 0; i < 64 * 64; i += 1) {
  //     result[i] += r.w[i];
  //   }
  // }

  r = net.forward(input);
  for (var i = 0; i < dimension; i += 1) {
    result[i] += r.w[i] * step;
  }

  for (var i = 0; i < dimension; i += 1) {
    // sigmoid
    result[i] = 1.0/(1.0+Math.exp(-result[i]));
  }

  var index;
  var imageIndex;
  var color;
  var g = ctx.createImageData(64 * scale, 64 * scale);

  for (var i = 0; i < 64; i += 1) {
    for (var j = 0; j < 64; j += 1) {
      imageIndex = i + j * 64;
      for (var m = 0; m < scale; m += 1) {
        for (var n = 0; n < scale; n += 1) {
          index = ((i*scale + m) + (j*scale + n) * 64 * scale);

          g.data[index*4+0] = Math.floor(255 * result[imageIndex*3+0]);
          g.data[index*4+1] = Math.floor(255 * result[imageIndex*3+1]);
          g.data[index*4+2] = Math.floor(255 * result[imageIndex*3+2]);
          g.data[index*4+3] = 255; //alpha
        }
      }

    }
  }

  ctx.putImageData(g, tx * scale, ty * scale);
}


function rnd2() {
    return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}

var result;
var step = 6;

$(function() {

  for (var i = 0; i < 100; i += 1) {
    $('#imageHolder').append("<button type='button' class='button' onclick='setImage(" + (i+1) + ");' id='button" + (i+1).toString() + "'><img src='images/" + imageList[i] + "' /></button>");
  }

  // make net

  layer_defs = [];
  layer_defs.push({type:'input', sx:1, sy:1, out_sx:1, out_sy:1, out_depth:800});
  layer_defs.push({type:'deconv', sx:8, sy:8, filters:256, stride:1, pad:0, activation:'relu'});
  layer_defs.push({type:'deconv', stride:2, pad:1, sx:4, sy:4, out_sx:16, out_sy:16, filters:128, activation:'relu'});
  layer_defs.push({type:'deconv', stride:2, pad:1, sx:4, sy:4, out_sx:32, out_sy:32, filters:64, activation:'relu'});
  layer_defs.push({type:'deconv', stride:2, pad:1, sx:4, sy:4, out_sx:64, out_sy:64, filters:3});

  net = new convnetjs.Net();
  net.makeLayers(layer_defs);


  net.layers[1].fromJSON(layer_0);
  net.layers[3].fromJSON(layer_1);
  net.layers[5].fromJSON(layer_2);
  net.layers[7].fromJSON(layer_3);


  // make image
  input_w1 = mean['3'];
  input_w2 = mean['2'];
  input_w3 = mean['10'];

  var canvas1 = document.getElementById('z_canvas1');
  var canvas2 = document.getElementById('z_canvas2');
  var canvas3 = document.getElementById('z_canvas3');

  var ctx1 = canvas1.getContext('2d');
  var ctx2 = canvas2.getContext('2d');
  var ctx3 = canvas3.getContext('2d');

  ctx1.fillStyle = '#ff0000';
  ctx1.fillRect(0, 0, 80, 80);
  drawToCanvas(canvas1, input_w1, 8, 8, 1);

  ctx2.fillStyle = '#0000ff';
  ctx2.fillRect(0, 0, 80, 80);
  drawToCanvas(canvas2, input_w2, 8, 8, 1);

  ctx3.fillStyle = '#00ff00';
  ctx3.fillRect(0, 0, 80, 80);
  drawToCanvas(canvas3, input_w3, 8, 8, 1);


  firstSelectedIndex = 3;
  $('#button' + firstSelectedIndex.toString()).addClass('red');

  secondSelectedIndex = 2;
  $('#button' + secondSelectedIndex.toString()).addClass('blue');

  thirdSelectedIndex = 10;
  $('#button' + thirdSelectedIndex.toString()).addClass('green');


  calcMeanVector();

});


$( "input" ).on( "click", function() {
  if ($( "input:checked" ).val() == 'firstChange') {
    nowSelectedFrame = 1;
  }
  else if ($( "input:checked" ).val() == 'secondChange'){
    nowSelectedFrame = 2;
  }
  else {
    nowSelectedFrame = 3;
  }
});

function setImage(idx) {
  var canvas;
  var ctx;

  var fillColor;
  var input_w;
  switch (nowSelectedFrame) {
    case 1:
      if (firstSelectedIndex != -1) {
        $('#button' + firstSelectedIndex.toString()).removeClass('red');
      }
      $('#button' + idx.toString()).addClass('red');
      firstSelectedIndex = idx;

      canvas = document.getElementById('z_canvas1');
      input_w = input_w1 = mean[idx.toString()];
      fillColor = '#ff0000';
      break;

    case 2:
      if (secondSelectedIndex != -1) {
        $('#button' + secondSelectedIndex.toString()).removeClass('blue');
      }
      $('#button' + idx.toString()).addClass('blue');
      secondSelectedIndex = idx;

      canvas = document.getElementById('z_canvas2');
      input_w = input_w2 = mean[idx.toString()];
      fillColor = '#0000ff';
      break;

    case 3:
      if (thirdSelectedIndex != -1) {
        $('#button' + thirdSelectedIndex.toString()).removeClass('green');
      }
      $('#button' + idx.toString()).addClass('green');
      thirdSelectedIndex = idx;

      canvas = document.getElementById('z_canvas3');
      input_w = input_w3 = mean[idx.toString()];
      fillColor = '#00ff00';
      break;
  }

  canvas.width = canvas.width;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, 80, 80);
  drawToCanvas(canvas, input_w, 8, 8, 1);
}


function lerp(z1, z2, t) {
  //z1 - 0, z2 - 1
  var z = [];
  var len1 = z1.length;
  var len2 = z2.length;

  if (len1 != len2) {
    return z1;
  }

  for (var i = 0; i < len1; i += 1) {
    z.push(z1[i] + (z2[i] - z1[i]) * t);
  }

  return z;
}

function slerp(z1, z2, t) {
  var len1 = z1.length;
  var len2 = z2.length;
  if (len1 != len2) {
    return z1;
  }

  var mag1 = 0.0;
  var mag2 = 0.0;

  for (var i = 0; i < len1; i += 1) {
    mag1 += z1[i] * z1[i];
  }
  mag1 = Math.sqrt(mag1);

  for (var i = 0; i < len2; i += 1) {
    mag2 += z2[i] * z2[i];
  }
  mag2 = Math.sqrt(mag2);

  var dotp = 0.0;
  for (var i = 0; i < len1; i += 1) {
    dotp += z1[i] / mag1 * z2[i] / mag2;
  }

  if (dotp > 0.9999 || dotp < -0.9999) {
    if (t <= 0.5) {
      return z1;
    }
    return z2;
  }

  var theta = Math.acos(dotp * Math.PI / 180.0);
  var z = [];
  for (var i = 0; i < len1; i += 1) {
    z.push( (z1[i] * Math.sin(1-t) * theta + z2[i] * Math.sin(t * theta)) / Math.sin(theta) );
  }

  return z;

}
