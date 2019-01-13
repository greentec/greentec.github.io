---
title: Create a hexagonal map
date: 2018-12-09
lang: en
ref: hexagonal-map
tags:
- procedural
- algorithm
- hexagonal
interactive: true
---

![](<../images/hexagonal_map_intro.png>)
<small>[image link](<https://www.honeycolony.com/article/against-flow-hive/>)</small>

&nbsp;

## Introduction

It is now a technology that should not be used because of the risk of hacking because of security vulnerabilities, but about 10 to 15 years ago [Flash](<https://en.wikipedia.org/wiki/Adobe_Flash>) created the best web contents. JavaScript has not yet set the right standards, so the code you need to write for browsers such as Explorer, Chrome, and Opera has changed a bit. To increase productivity, we needed a tool that would produce the same results on all browsers, and that was Adobe's Flash.

A lot of games are made in Flash, and I would like to draw [Dice wars](<https://www.gamedesign.jp/games/dicewars/>) as one of the masterpieces. This game is a great game that combines neat vector graphics, clear strategy, and simple yet convincing game rules. If you are interested, I suggest you try it. Fortunately, the author has created a version that also runs on html5. Today, I try to reproduce the part of the game that makes the battleground random map.

![](<../images/hexagonal_map_0.png>)

&nbsp;

## Hexagonal grid

The random map of Dice wars consists of small hexagons. To create a hexagonal map, I have to explain the hexagonal grid. Amit Patel of Red Blob Games wrote a very detailed [Resources on the Responsive Web](<https://www.redblobgames.com/grids/hexagons/>) about this subject. This blog is one of the pages at the top of my favorites because it is full of other useful content.

Amit Patel has done a lot of research on hexagonal grids and then put together a simple way to implement a grid. First, the hexagonal grid can be classified into two broad categories: the flat top of the cell (flat topped) and the pointed top (pointy topped). Depending on how you define the coordinates, you can classify them into four types: Offset, Doubled, Axial, and Cube. Each coordinate system can be converted to another.

I mainly use the Cube coordinate system. The Cube coordinate system is a representation of a two-dimensional hexagonal grid with three axes, `X`, `Y`, and `Z`. In this coordinate system, it is easy to rotate and vectorize, and symmetry around the origin `(0, 0, 0)` can be easily obtained.

The following code creates the hexagon as a class using the javascript function. [Javascript Ninja](<https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=38913750>) written by John Resig who create [jQuery](<https://jquery.com/>) separates the function from the constructor as follows:

> Functions and methods are generally named starting with a **verb** that describes what they do (skulk(), creep(), sneak(), doSomethingWonderful(), and so on) and start with a **lowercase** letter. Constructors, on the other hand, are usually named as a **noun** that describes the object that’s being constructed and start with an **uppercase** character; Ninja(), Samurai(), Ronin(), KungFuPanda(), and so on. - 「Javascript Ninja」, 54p.

<div>
<textarea id='hex_0' height='10' style='display:none;'>
function HexCell(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
}

// Create a HexCell at x=1, y=2, z=3.
let hexCell = new HexCell(1, 2, 3);</textarea>
</div>
<script>
    (function() {
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_0'), {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'monokai',
            readOnly: true
        });
    })();
</script>
&nbsp;
After defining HexCell in this way, you can create a HexGrid consisting of HexCell.

<div>
<textarea id='hex_1' style='display:none;'>
let hexGrid = initGrid(5);
drawGrid(hexGrid);

function HexCell(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
}

function initGrid(mapSize) {
    mapSize = Math.max(1, mapSize);
    let gridArray = [];
    let cnt = 0;

    for (let i = -mapSize; i < mapSize + 1; i += 1) {
        for (let j = -mapSize; j < mapSize + 1; j += 1) {
            for (let k = -mapSize; k < mapSize + 1; k += 1) {
                if (i + j + k == 0) {
                    gridArray.push(new HexCell(i, j, k));
                    cnt += 1;
                }
            }
        }
    }

    return gridArray;
}

function drawGrid(gridArray) {
    let edgeLength = 13;
    let edgeW = edgeLength * 3 / 2;
    let edgeH = edgeLength * Math.sqrt(3) / 2;

    let previewFrame = document.getElementById('hex_1_preview');
    let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
    let canvas = preview.getElementById('hex_1_canvas');
    canvas.width = canvas.width;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'lightgray';
    let x, y, z;
    let posX, posY;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    for (let i = 0; i < gridArray.length; i++) {
        [x, y, z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
        posX = x * edgeW + centerX;
        posY = (-y + z) * edgeH + centerY;

        ctx.moveTo(posX + Math.cos(0) * edgeLength,
                   posY + Math.sin(0) * edgeLength);
        for (let j = 1; j <= 6; j++) {
            ctx.lineTo(posX + Math.cos(j / 6 * (Math.PI * 2)) * edgeLength,
                       posY + Math.sin(j / 6 * (Math.PI * 2)) * edgeLength);
        }
        ctx.fill();
        ctx.stroke();
    }
}
</textarea>
<iframe id='hex_1_preview' class='previewOutside'>
</iframe>
</div>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_1'), {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai',
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        editor.foldCode(CodeMirror.Pos(9, 0));
        editor.foldCode(CodeMirror.Pos(28, 0));
        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('hex_1_preview');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;

            if (preview.getElementById('hex_1_canvas')) {
                canvas = preview.getElementById('hex_1_canvas');
            }
            else {
                canvas = document.createElement('canvas');
                canvas.id = 'hex_1_canvas';
                preview.body.appendChild(canvas);
                canvas.width = preview.body.offsetWidth;
                canvas.height = preview.body.offsetHeight;
            }

            eval(editor.getValue());
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
In line 1 of `initGrid(5)`, `5` is the unit of measure that represents the radius of the HexGrid. In other words, `5` is the distance from the center `(0,0,0)` to the HexCell farthest from the center. If you change `5` to a different number, you can see that the HexGrid is changing.

&nbsp;
## Create a region

Returning to the map of Dice wars, you can see that one map is divided into several regions. And this area is composed of several HexCells each. If so, you may need an array or object that holds each HexCell non-overlapping. We will use object here.

But how do you organize these areas? If we think of a simple procedural method, we can randomly assign 0 to N-1 IDs to all HexCells, then use the **Schelling Segregation Model** to get the same cells to be contiguous.

Thomas Schelling is an American economist who won the Nobel Prize in economics. He established theory on how segregation of settlements occurs through game theory. This theory is simply a mathematical model of the phenomenon of minority races finding and migrating to similar races when different races live together. This is called the Schelling Segregation Model.

Here are some links you can see: [here](<http://nifty.stanford.edu/2014/mccown-schelling-model-segregation/>), and [my previously created program](<https://greentec.github.io/playground/html/Segregation.html>). However, my program is a Flash version because it was created a long time ago.

The two links above cover the segregation model on a rectangular grid. It will also be possible on the hexagonal grid. First, add a race in HexCell.

<div>
<textarea id='hex_2' height='10' style='display:none;'>
function HexCell(x, y, z, race) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._race = race;
}</textarea>
</div>
<script>
    (function() {
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_2'), {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'monokai',
            styleSelectedText: true
        });
        editor.markText({line:4, ch:4}, {line:4, ch:22}, {className: "styled-background"});
    })();
</script>
&nbsp;
The next step is to actually change the color of each HexCell depending on the race.

<div>
<textarea id='hex_3' style='display:none;'>
let raceCount = 5;
let hexGrid = initGrid(5);
drawGrid(hexGrid);

function HexCell(x, y, z, race) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._race = race;
}

function initGrid(mapSize) {
    mapSize = Math.max(1, mapSize);
    let gridArray = [];
    let cnt = 0;

    for (let i = -mapSize; i < mapSize + 1; i += 1) {
        for (let j = -mapSize; j < mapSize + 1; j += 1) {
            for (let k = -mapSize; k < mapSize + 1; k += 1) {
                if (i + j + k == 0) {
                    gridArray.push(new HexCell(i, j, k, Math.floor(Math.random() * raceCount)));
                    cnt += 1;
                }
            }
        }
    }

    return gridArray;
}

function drawGrid(gridArray) {
    let edgeLength = 13;
    let edgeW = edgeLength * 3 / 2;
    let edgeH = edgeLength * Math.sqrt(3) / 2;

    let previewFrame = document.getElementById('hex_3_preview');
    let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
    let canvas = preview.getElementById('hex_3_canvas');
    canvas.width = canvas.width;
    let ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'lightgray';
    let x, y, z;
    let posX, posY;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    for (let i = 0; i < gridArray.length; i++) {
        [x, y, z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
        posX = x * edgeW + centerX;
        posY = (-y + z) * edgeH + centerY;

        ctx.beginPath();
        if (gridArray[i]._race === 0) {
            ctx.fillStyle = 'lightgray';
        }
        else {
            ctx.fillStyle = `hsl(${Math.floor((gridArray[i]._race - 1) / raceCount * 320)}, 100%, 50%)`;
        }
        ctx.moveTo(posX + Math.cos(0) * edgeLength,
                   posY + Math.sin(0) * edgeLength);
        for (let j = 1; j <= 6; j++) {
            ctx.lineTo(posX + Math.cos(j / 6 * (Math.PI * 2)) * edgeLength,
                       posY + Math.sin(j / 6 * (Math.PI * 2)) * edgeLength);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}
</textarea>
<iframe id='hex_3_preview' class='previewOutside'>
</iframe>
</div>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_3'), {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai',
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        editor.foldCode(CodeMirror.Pos(11, 0));
        editor.foldCode(CodeMirror.Pos(30, 0));
        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('hex_3_preview');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;

            if (preview.getElementById('hex_3_canvas')) {
                canvas = preview.getElementById('hex_3_canvas');
            }
            else {
                canvas = document.createElement('canvas');
                canvas.id = 'hex_3_canvas';
                preview.body.appendChild(canvas);
                canvas.width = preview.body.offsetWidth;
                canvas.height = preview.body.offsetHeight;
            }

            eval(editor.getValue());
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
Changing line 1's `raceCount` changes the type of race each cell can have.

Now let's apply the Schelling Segregation Model. Simply count the number of neighbors in each cell, and if there are too few neighbors with the same race, move to any empty cell. Repeat this process until all the cells are satisfied.

`let happyNeighborCount = [0, 1, 1, 2, 2, 2, 3];`

`happyNeighborCount` defines the minimum number of identical race neighbors needed to be satisfied when the number of neighbors in the cell is 0 to 6. If the number of cells in the same race is less than `happyNeighborCount`, it becomes unsatisfactory and moves to the empty cell.

<div>
<textarea id='hex_4' style='display:none;'>
let happyNeighborCount = [0, 1, 1, 2, 2, 2, 3];
let neighbors = [[+1, -1, 0], [0, -1, +1], [-1, 0, +1], [-1, +1, 0], [0, +1, -1], [+1, 0, -1]];
let raceCount = 10;
let hexGrid, hexDict;
[hexGrid, hexDict] = initGrid(8);
drawGrid(hexGrid);
initEventListener();

function initEventListener() {
    let previewFrame = document.getElementById('hex_4_preview');
    let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
    let button = preview.getElementById('segregationButton');
    button.addEventListener('click', () => {
        doSegregation();
        drawGrid(hexGrid);
    });
    // button.setAttribute('onClick', 'javascript: doSegregation();');
}

function doSegregation() {
    let neighborCount;
    let sameNeighborCount;
    let satisfied, total;
    let dx, dy, dz;
    let x, y, z;
    let cellString;
    let hexCell;
    let neighborCell;

    let moveCandidate = [];
    let emptyCandidate = [];

    satisfied = 0;
    total = 0;

    for (let i = 0; i < hexGrid.length; i++) {
        hexCell = hexGrid[i];
        if (hexCell._race === 0) {
            emptyCandidate.push(i);
            continue;
        }
        [x, y, z] = [hexCell._x, hexCell._y, hexCell._z];
        neighborCount = 0;
        sameNeighborCount = 0;

        for (let j = 0; j < neighbors.length; j++) {
            dx = x + neighbors[j][0];
            dy = y + neighbors[j][1];
            dz = z + neighbors[j][2];

            cellString = [dx, dy, dz].join('#');
            if (hexDict.hasOwnProperty(cellString)) {
                neighborCell = hexGrid[hexDict[cellString]];

                // do not count empty cell
                if (neighborCell._race !== 0) {
                    neighborCount += 1;

                    if (neighborCell._race === hexCell._race) {
                        sameNeighborCount += 1;
                    }
                }
            }
        }

        if (happyNeighborCount[neighborCount] > sameNeighborCount) {
            moveCandidate.push(i);
        }
        else {
            satisfied += 1;
        }

        total += 1;
    }

    // shuffle
    shuffleArray(moveCandidate);
    shuffleArray(emptyCandidate);

    // move
    for (let i = 0; i < moveCandidate.length; i++) {
        if (emptyCandidate.length === 0) {
            break;
        }

        hexCell = hexGrid[moveCandidate[i]];
        neighborCell = hexGrid[emptyCandidate.pop()];

        neighborCell._race = hexCell._race;
        hexCell._race = 0;
    }

    let previewFrame = document.getElementById('hex_4_preview');
    let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
    let p = preview.getElementById('segregationP');
    p.innerHTML = `satisfaction : ${Math.floor(satisfied / total * 10000) / 100} %`;
}

function shuffleArray(array) {
    // from https://stackoverflow.com/a/12646864/2689257
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function HexCell(x, y, z, race) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._race = race;
}

function initGrid(mapSize) {
    mapSize = Math.max(1, mapSize);
    let gridArray = [];
    let gridDict = {};
    let cellString;
    let cnt = 0;

    for (let i = -mapSize; i < mapSize + 1; i += 1) {
        for (let j = -mapSize; j < mapSize + 1; j += 1) {
            for (let k = -mapSize; k < mapSize + 1; k += 1) {
                if (i + j + k == 0) {
                    gridArray.push(new HexCell(i, j, k, Math.floor(Math.random() * raceCount)));
                    cellString = [i, j, k].join('#');
                    gridDict[cellString] = cnt;
                    cnt += 1;
                }
            }
        }
    }

    return [gridArray, gridDict];
}

function drawGrid(gridArray) {
    let edgeLength = 9;
    let edgeW = edgeLength * 3 / 2;
    let edgeH = edgeLength * Math.sqrt(3) / 2;

    let previewFrame = document.getElementById('hex_4_preview');
    let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
    let canvas = preview.getElementById('hex_4_canvas');
    canvas.width = canvas.width;
    let ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'lightgray';
    let x, y, z;
    let posX, posY;
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    for (let i = 0; i < gridArray.length; i++) {
        [x, y, z] = [gridArray[i]._x, gridArray[i]._y, gridArray[i]._z];
        posX = x * edgeW + centerX;
        posY = (-y + z) * edgeH + centerY;

        ctx.beginPath();
        if (gridArray[i]._race === 0) {
            ctx.fillStyle = 'lightgray';
        }
        else {
            ctx.fillStyle = `hsl(${Math.floor((gridArray[i]._race - 1) / raceCount * 320)}, 100%, 50%)`;
        }
        ctx.moveTo(posX + Math.cos(0) * edgeLength,
                   posY + Math.sin(0) * edgeLength);
        for (let j = 1; j <= 6; j++) {
            ctx.lineTo(posX + Math.cos(j / 6 * (Math.PI * 2)) * edgeLength,
                       posY + Math.sin(j / 6 * (Math.PI * 2)) * edgeLength);
        }
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}
</textarea>
<iframe id='hex_4_preview' class='previewOutside'>
</iframe>
</div>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_4'), {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai',
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        editor.foldCode(CodeMirror.Pos(8, 0));
        editor.foldCode(CodeMirror.Pos(19, 0));
        editor.foldCode(CodeMirror.Pos(98, 0));
        editor.foldCode(CodeMirror.Pos(113, 0));
        editor.foldCode(CodeMirror.Pos(136, 0));
        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('hex_4_preview');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;
            let button;
            let p;

            if (preview.getElementById('hex_4_canvas')) {
                canvas = preview.getElementById('hex_4_canvas');
            }
            else {
                canvas = document.createElement('canvas');
                canvas.id = 'hex_4_canvas';
                preview.body.appendChild(canvas);
                canvas.width = preview.body.offsetWidth;
                canvas.height = preview.body.offsetHeight;

                button = document.createElement('button');
                button.style.position = 'absolute';
                button.style.left = '0px';
                button.style.top = '0px';
                button.id = 'segregationButton';
                button.innerHTML = '1 Step Segregation';
                preview.body.appendChild(button);

                p = document.createElement('p');
                p.style.position = 'absolute';
                p.style.left = '0px';
                p.style.top = '15px';
                p.id = 'segregationP';
                preview.body.appendChild(p);
            }

            eval(editor.getValue());
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
If you keep pressing the "1 Step Segregation" button, the satisfaction will converge to 100%. When we combine the same colors, it looks similar to the area we saw in Dice wars.

![](<../images/hexagonal_map_1.png>)

This way, the map of Dice wars can be created in an iterative way using the Schelling Segregation Model. But the creator of Dice wars seems to have used a different method. If you are interested, you can refer to the `make_map()` function section of [Open source](<https://www.gamedesign.jp/games/dicewars/game.js>).

Now it's the second post, and writing the markdown seems to be a pretty tough job. Furthermore, I tried to write an interactive element that could not be done in egloos. It seems to be a rewarding thing though. Later, if I have some time to spare, I'll be blogging about implementing the interactive code in the jekyll blog. It took too long to implement because there were not enough resources. Thank you for reading the long article.

&nbsp;
