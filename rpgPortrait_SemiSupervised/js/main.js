var layer_defs, net;
var n_z = 800;
var n_y = 18;
var input_w;
var input_y;
var step = 6;
var copyR;
var stream = new Random(parseInt(Math.random() * Math.pow(2, 31)));
var buffer_z = [];

var controls = new function() {
  this.scale = 2;
  this.gender = 'male';
  this.hairColor = 'red';
  this.skinColor = 'white';
  this.beard = false;
  this.smile = false;
  this.hood = false;

  this.getRandomFeature = function() {
    var rand;

    rand = Math.random();
    if (rand < 0.5) {
      this.gender = 'male';
    }
    else {
      this.gender = 'female';
    }

    rand = Math.random();
    if (rand < 1/7) {
      this.hairColor = 'black';
    }
    else if (rand < 2/7) {
      this.hairColor = 'brown';
    }
    else if (rand < 3/7) {
      this.hairColor = 'red';
    }
    else if (rand < 4/7) {
      this.hairColor = 'yellow';
    }
    else if (rand < 5/7) {
      this.hairColor = 'green';
    }
    else if (rand < 6/7) {
      this.hairColor = 'blue';
    }
    else {
      this.hairColor = 'white';
    }

    rand = Math.random();
    if (rand < 1/3) {
      this.skinColor = 'white';
    }
    else if (rand < 2/3) {
      this.skinColor = 'brown';
    }
    else {
      this.skinColor = 'black';
    }

    rand = Math.random();
    if (rand < 0.5) {
      this.beard = true;
    }
    else {
      this.beard = false;
    }

    rand = Math.random();
    if (rand < 0.5) {
      this.smile = true;
    }
    else {
      this.smile = false;
    }

    // rand = Math.random();
    // if (rand < 0.5) {
    //   this.hood = true;
    // }
    // else {
      this.hood = false;
    // }

    this.setFeature();
  }

  this.getRandomNoise = function() {
    getRandom();
    drawNoise();
  }

  this.getMean = function() {
    getZero();
    drawNoise();
  }

  this.setFeature = function() {
    input_y = [];
    for (var i = 0; i < n_y; i += 1) {
      input_y.push(0.0);
    }

    var color;
    switch(controls.gender) {
      case 'male':
        input_y[0] = 1.0;
        break;
      case 'female':
        input_y[1] = 1.0;
        break;
    }
    switch(controls.hairColor) {
      case 'black':
        input_y[2] = 1.0;
        break;
      case 'brown':
        input_y[3] = 1.0;
        break;
      case 'red':
        input_y[4] = 1.0;
        break;
      case 'yellow':
        input_y[5] = 1.0;
        break;
      case 'green':
        input_y[6] = 1.0;
        break;
      case 'blue':
        input_y[7] = 1.0;
        break;
      case 'white':
        input_y[8] = 1.0;
        break;
    }
    switch(controls.skinColor) {
      case 'white':
        input_y[9] = 1.0;
        break;
      case 'brown':
        input_y[10] = 1.0;
        break;
      case 'black':
        input_y[11] = 1.0;
        break;
    }
    if (controls.beard == false) {
      input_y[12] = 1.0;
    }
    else {
      input_y[13] = 1.0;
    }
    if (controls.smile == false) {
      input_y[14] = 1.0;
    }
    else {
      input_y[15] = 1.0;
    }
    if (controls.hood == false) {
      input_y[16] = 1.0;
    }
    else {
      input_y[17] = 1.0;
    }

    drawFeature();
  }

  this.getImage = function() {
    var canvas = document.getElementById('imageCanvas');
    drawToCanvas(canvas, controls.scale, true, 0, 0, true, input_w, input_y);
  }

  this.getSample = function() {

    sampleCount = 0;
    buffer_z = [];
    buffer_y = [];
    sampleGenLoop();
  }
}

function drawToCanvas(canvas, scale, calc, tx = 0, ty = 0, copy = true, input_w, input_y) {
  // var canvas = document.getElementById('imageCanvas');
  // canvas.width = canvas.width;
  var ctx = canvas.getContext('2d');

  var input = new convnetjs.Vol(1, 1, 818, 0.0);

  // input.w = JSON.parse(JSON.stringify(input_w));
  for (var i = 0; i < n_z; i += 1) {
    input.w[i] += input_w[i];
  }
  for (var i = 0; i < n_y; i += 1) {
    input.w[i + n_z] += input_y[i];
  }

  var dimension = 64 * 64 * 3;

  var result = [];
  for (var i = 0; i < dimension; i += 1) {
    result.push(0.0);
  }

  var r;
  if (calc) {
    r = net.forward(input);
  }
  else {
    r = copyR;
  }

  for (var i = 0; i < dimension; i += 1) {
    // result[i] += r.w[i];
    result[i] += r.w[i] * step;
  }

  for (var i = 0; i < dimension; i += 1) {
    // sigmoid
    result[i] = 1.0 / (1.0 + Math.exp(-result[i]));
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

  ctx.putImageData(g, tx, ty);

  if (copy) {
    copyR = JSON.parse(JSON.stringify(r));
  }
}

var gui = new dat.GUI();
gui.add(controls, 'scale', [1, 2, 3, 4]).onChange(function() {
  var canvas = document.getElementById('imageCanvas');
  canvas.width = canvas.width;
  drawToCanvas(canvas, controls.scale, false, 0, 0, false, input_w, input_y);
}).listen();
var featureFolder = gui.addFolder('Feature(Y)');
featureFolder.add(controls, 'gender', ['male', 'female']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'hairColor', ['black', 'brown', 'red', 'yellow', 'green', 'blue', 'white']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'skinColor', ['white', 'brown', 'black']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'beard').onChange(controls.setFeature).listen();
featureFolder.add(controls, 'smile').onChange(controls.setFeature).listen();
featureFolder.add(controls, 'hood').name('hood (not recommended)').onChange(controls.setFeature).listen();
featureFolder.open();
gui.add(controls, 'getRandomFeature');
gui.add(controls, 'getRandomNoise');
gui.add(controls, 'getMean');
gui.add(controls, 'getImage');
gui.add(controls, 'getSample');


function getRandom() {
  input_w = [];
  for (var i = 0; i < n_z; i += 1) {
    // input_w[i] = rnd2() + rnd2() * rnd2();
    input_w[i] = stream.normal(0, 1);
  }

}

function getZero() {
  input_w = [];
  for (var i = 0; i < n_z; i += 1) {
    input_w[i] = 1e-5;
  }
}

function getMeanData(index) {
  input_w = [];
  for (var i = 0; i < n_z; i += 1) {
    input_w[i] = mean[index][i] + stddev[index][i] * stream.normal(0, 1);
  }

}

// function rnd2() {
//   return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
// }

function drawNoise() {
  var canvas = document.getElementById('noiseCanvas');
  canvas.width = canvas.width;
  canvas = canvas.getContext('2d');

  var color;
  var lineWidth = 40;
  for (var i = 0; i < n_z; i += 1) {
    canvas.beginPath();
    color = Math.floor((input_w[i] + 1) / 2.0 * 255.0);
    color = Math.max(0, color);
    color = Math.min(255, color);
    canvas.fillStyle = 'RGB(' + color + ',' + color + ',' + color + ')';
    canvas.fillRect((i % lineWidth) * 5, Math.floor(i / lineWidth) * 5, 5, 5);
    canvas.fill();
    canvas.closePath();
  }

}

function drawFeature() {
  var canvas = document.getElementById('yCanvas');
  canvas.width = canvas.width;
  canvas = canvas.getContext('2d');

  var color;
  for (var i = 0; i < n_y; i += 1) {
    canvas.beginPath();
    color = Math.floor(input_y[i] * 255.0);
    canvas.fillStyle = 'RGB(' + color + ',' + color + ',' + color + ')';
    canvas.fillRect(0, i * 5, 5, 5);
    canvas.fill();
    canvas.closePath();
  }
}

var sampleCount = 0;
function sampleGenLoop() {

  var canvas = document.getElementById('sampleCanvas');
  var buffer_z_w = [];

  for (var j = 0; j < 2; j += 1) {
    if (sampleCount < 100) {
      for (var i = 0; i < n_z; i += 1) {
        // input_w[i] = rnd2() + rnd2() * rnd2();
        buffer_z_w[i] = stream.normal(0, 1);
      }
    }
    else {
      // getZero();
      getMeanData(sampleCount % 100);
    }

    buffer_z.push(buffer_z_w);
    // input_y = JSON.parse(JSON.stringify(sample_y[sampleCount % 100]));

    var i = sampleCount % 100;
    drawToCanvas(canvas, 1, true, (i % 10) * 64 + Math.floor(sampleCount / 100) * 640, Math.floor(i / 10) * 64, false, buffer_z_w, sample_y[sampleCount % 100]);

    sampleCount += 1;
  }

  if (sampleCount < 200) {
    window.requestAnimationFrame(sampleGenLoop);
  }
}

$(function() {
  layer_defs = [];
  layer_defs.push({type: 'input', sx: 1, sy: 1, out_sx: 1, out_sy:1, out_depth: 818});
  layer_defs.push({type: 'deconv', bn: true, sx: 8, sy: 8, filters: 256, stride: 1, pad: 0, activation: 'relu'});
  layer_defs.push({type: 'deconv', bn: true, stride: 2, pad: 1, sx: 4, sy: 4, out_sx:16, out_sy:16, filters: 128, activation: 'relu'});
  layer_defs.push({type: 'deconv', bn: true, stride: 2, pad: 1, sx: 4, sy: 4, out_sx:32, out_sy:32, filters: 64, activation: 'relu'});
  layer_defs.push({type: 'deconv', stride: 2, pad: 1, sx: 4, sy: 4, out_sx:64, out_sy:64, filters: 3});


  net = new convnetjs.Net();
  net.makeLayers(layer_defs);

  net.layers[1].fromJSON(layer_0);
  net.layers[3].fromJSON(layer_1);
  net.layers[5].fromJSON(layer_2);
  net.layers[7].fromJSON(layer_3);



  controls.getRandomNoise();
  controls.setFeature();

  controls.getImage();


  var canvas = document.getElementById('sampleCanvas');
  canvas.addEventListener('mousedown', function(e) {

    var canvas = document.getElementById('sampleCanvas');
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var index_x = Math.floor(x / 64);
    var index_y = Math.floor(y / 64);
    var index;

    if (index_x < 10) {
      index = index_y * 10 + index_x;
    }
    else {
      index_x -= 10;
      index_y += 10;
      index = index_y * 10 + index_x;
    }

    if (buffer_z.length < index + 1) {
      return;
    }

    input_y = JSON.parse(JSON.stringify(sample_y[index % 100]));
    input_w = JSON.parse(JSON.stringify(buffer_z[index]));

    drawNoise();
    drawFeature();
    controls.getImage();

  })
});
