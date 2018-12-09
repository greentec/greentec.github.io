---
title: (공사중) 육각형으로 구성된 맵 만들기 (dice wars)
tags:
- procedural
- algorithm
- hexagonal
---

![](<../images/hexagonal_map_intro.png>)
<small>[image link](<https://www.honeycolony.com/article/against-flow-hive/>)</small>

&nbsp;

## 도입

지금은 보안 취약점으로 인한 해킹의 위험 때문에 점점 쓰면 안되는 기술이 되고 있지만, 약 10년~15년 전에는 [플래시](<https://en.wikipedia.org/wiki/Adobe_Flash>)가 최고의 웹 컨텐츠 제작 도구였습니다. 아직 자바스크립트는 정확한 표준을 정하지 못하고 있었기 때문에 익스플로러, 크롬, 오페라 등의 브라우저마다 작성해야 할 코드가 조금씩 달라졌습니다. 생산성을 높이기 위해서는 모든 브라우저에서 동일하게 동작하는 결과물이 나오는 도구가 필요했고, 그것이 바로 Adobe 사의 플래시였습니다.

플래시로는 수많은 게임들도 제작되었는데, 그 중 명작의 반열에 드는 것 중 하나로 [Dice wars](<https://www.gamedesign.jp/games/dicewars/>) 를 뽑고 싶습니다. 이 게임은 깔끔한 벡터 그래픽, 명확한 전략성, 단순하면서도 설득력 있는 게임 규칙이 어우러진 훌륭한 게임입니다. 관심이 있으시면 한번 해보셔도 좋을 것 같습니다. 다행히 제작자가 html5 에서도 돌아가는 버전을 만들어 놓았네요. 오늘은 이 게임의 구성요소 중에서 전장이 되는 랜덤맵을 만드는 부분을 재현해보려고 합니다.

![](<../images/hexagonal_map_0.png>)

&nbsp;

## 육각형 그리드

Dice wars 의 랜덤맵은 작은 육각형들로 구성되어 있습니다. 육각형으로 구성된 맵을 만들기 위해서는 육각형 그리드에 대한 설명을 하지 않을 수 없습니다. 이에 대한 자료는 Red Blob Games 의 Amit Patel 이 아주 상세하게 [반응형 웹에 정리해 놓은 자료](<https://www.redblobgames.com/grids/hexagons/>)가 있습니다. 이 블로그에는 이 외에도 유익한 내용이 가득 들어있기 때문에 제 즐겨찾기 최상단에 위치한 페이지 중 하나입니다.

Amit Patel 은 육각형 그리드에 대해서 많은 자료 조사를 한 후에 그리드를 구현하는 방법을 간단하게 정리했습니다. 먼저 육각형 그리드는 셀의 평평한 부분이 위쪽에 오는 것(flat topped), 뾰족한 부분이 위쪽에 오는 것(pointy topped)으로 크게 2가지로 분류할 수 있습니다. 또 좌표계(coordinates)를 어떻게 정하느냐에 따라서 Offset, Doubled, Axial, Cube 의 4가지로 분류할 수 있습니다. 각 좌표계는 서로 변환이 가능하기 때문에 사실상 하나의 육각형 그리드를 나타낸다고 할 수 있습니다.

저는 Cube 좌표계를 주로 사용합니다. Cube 좌표계는 x, y, z 의 3개 축으로 2차원 평면의 육각형 그리드를 나타내는 표현 방법입니다. 이 좌표계에서는 회전 변환, 벡터 연산이 쉽고 원점(0, 0, 0)을 중심으로 한 대칭성도 쉽게 얻을 수 있기 때문에 여러 가지로 편리한 점이 많습니다.

아래 코드는 육각형을 javascript 의 function 을 이용해서 클래스처럼 만든 것입니다. [jQuery](<https://jquery.com/>) 를 만든 존 레식이 쓴 [자바스크립트 닌자 비급](<https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=38913750>)에서는 다음과 같이 함수와 생성자를 분리하고 있습니다.
> 함수와 메서드의 이름은 보통 그들이 하는 것을 설명하는 동사(skulk(), creep(), sneak(), doSomethingWonderful() 기타 등등)로 시작한다. 그리고 첫 글자는 소문자이다. 반면, 생성자의 이름은 보통 생성할 객체가 무엇인지를 설명하는 명사이고 대문자로 시작한다. (Ninja(), Samurai(), Ronin(), KungFuPanda() 기타 등등)  - 「자바스트립트 닌자 비급」, 68p.

<div>
<textarea id='hex_0' height='10' style='display:none;'>
function HexCell(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
}

// x=1, y=2, z=3 좌표를 가지는 HexCell 을 생성합니다.
let hexCell = new HexCell(1, 2, 3);</textarea>
</div>
<script>
    (function() {
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_0'), {
            mode: 'javascript',
            lineNumbers: true,
            theme: 'monokai'
        });
    })();
</script>
&nbsp;
이렇게 HexCell 을 정의한 뒤에 HexCell 로 구성되는 HexGrid 를 만들 수 있습니다.

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
<iframe id='hex_1_preview'>
</iframe>
</div>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('hex_1'), {
            mode: 'javascript',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai'
        });
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
1행의 initGrid(5) 에서 5는 hexGrid 의 반지름을 나타내는 크기 단위입니다. 즉 중심(0,0,0) 에서 가장 멀리 떨어진 hexCell 까지의 거리가 됩니다. 5를 다른 숫자로 바꿔보면, hexGrid 가 변하는 것을 확인할 수 있습니다.


## 지역 만들기

dice wars 의 맵으로 돌아가보면 하나의 맵은 여러 개의 지역으로 나눠져 있는 것을 확인할 수 있습니다. 그리고 이 지역은 각각 여러 개의 hexCell 로 구성되어 있습니다. 그렇다면 각 hexCell 을 중복되지 않게 들고 있는 배열 또는 object가 필요할 것 같습니다. 여기서는 object 를 써보겠습니다.
