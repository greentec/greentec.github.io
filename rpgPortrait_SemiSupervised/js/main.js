var layer_defs, net;
var n_z = 800;
var n_y = 18;
var input_w;
var input_y;
var step = 6;
var r;


var controls = new function() {
  this.scale = 2;
  this.gender = 'male';
  this.hairColor = 'black';
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

    rand = Math.random();
    if (rand < 0.5) {
      this.hood = true;
    }
    else {
      this.hood = false;
    }

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
    drawToCanvas(true);
  }
}

function drawToCanvas(calc=true) {
  var scale = controls.scale;
  var canvas = document.getElementById('imageCanvas');
  canvas.width = canvas.width;
  var ctx = canvas.getContext('2d');

  var input = new convnetjs.Vol(1, 1, 818, 0.0);

  // input.w = JSON.parse(JSON.stringify(input_w));
  for (var i = 0; i < n_z; i += 1) {
    input.w[i] = input_w[i];
  }
  for (var i = 0; i < n_y; i += 1) {
    input.w[i + n_z] = input_y[i];
  }

  var dimension = 64 * 64 * 3;

  result = [];
  for (var i = 0; i < dimension; i += 1) {
    result.push(0.0);
  }

  if (calc) {
    r = net.forward(input);
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

  ctx.putImageData(g, 0, 0);
}

var gui = new dat.GUI();
gui.add(controls, 'scale', [1, 2, 3, 4]).onChange(function() {
  drawToCanvas(false);
}).listen();
var featureFolder = gui.addFolder('Feature(Y)');
featureFolder.add(controls, 'gender', ['male', 'female']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'hairColor', ['black', 'brown', 'red', 'yellow', 'green', 'blue', 'white']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'skinColor', ['white', 'brown', 'black']).onChange(controls.setFeature).listen();
featureFolder.add(controls, 'beard').onChange(controls.setFeature).listen();
featureFolder.add(controls, 'smile').onChange(controls.setFeature).listen();
featureFolder.add(controls, 'hood').onChange(controls.setFeature).listen();
gui.add(controls, 'getRandomFeature');
gui.add(controls, 'getRandomNoise');
gui.add(controls, 'getMean');
gui.add(controls, 'getImage');


function getRandom() {
  input_w = [];
  for (var i = 0; i < n_z; i += 1) {
    input_w[i] = rnd2();
  }

}

function getZero() {
  input_w = [];
  for (var i = 0; i < n_z; i += 1) {
    input_w[i] = 1e-5;
  }
}

function rnd2() {
  return ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3;
}

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
});
