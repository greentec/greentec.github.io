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

도입
----

지금은 보안 취약점으로 인한 해킹의 위험 때문에 점점 쓰면 안되는 기술이 되고 있지만, 약 10년~15년 전에는 [플래시](<https://en.wikipedia.org/wiki/Adobe_Flash>)가 최고의 웹 컨텐츠 제작 도구였습니다. 아직 자바스크립트는 정확한 표준을 정하지 못하고 있었기 때문에 익스플로러, 크롬, 오페라 등의 브라우저마다 작성해야 할 코드가 조금씩 달라졌습니다. 생산성을 높이기 위해서는 모든 브라우저에서 동일하게 동작하는 결과물이 나오는 도구가 필요했고, 그것이 바로 Adobe 사의 플래시였습니다.

플래시로는 수많은 게임들도 제작되었는데, 그 중 명작의 반열에 드는 것 중 하나로 [Dice wars](<https://www.gamedesign.jp/games/dicewars/>) 를 뽑고 싶습니다. 이 게임은 깔끔한 벡터 그래픽, 명확한 전략성, 단순하면서도 설득력 있는 게임 규칙이 어우러진 훌륭한 게임입니다. 관심이 있으시면 한번 해보셔도 좋을 것 같습니다. 다행히 제작자가 html5 에서도 돌아가는 버전을 만들어 놓았네요. 오늘은 이 게임의 구성요소 중에서 전장이 되는 랜덤맵을 만드는 부분을 재현해보려고 합니다.

![](<../images/hexagonal_map_0.png>)

&nbsp;

육각형 그리드
------------

Dice wars 의 랜덤맵은 작은 육각형들로 구성되어 있습니다. 육각형으로 구성된 맵을 만들기 위해서는 육각형 그리드에 대한 설명을 하지 않을 수 없습니다. 이에 대한 자료는 Red Blob Games 의 Amit Patel 이 아주 상세하게 [반응형 웹에 정리해 놓은 자료](<https://www.redblobgames.com/grids/hexagons/>)가 있습니다. 이 블로그에는 이 외에도 유익한 내용이 가득 들어있기 때문에 제 즐겨찾기 최상단에 위치한 페이지 중 하나입니다.

Amit Patel 은 육각형 그리드에 대해서 많은 자료 조사를 한 후에 그리드를 구현하는 방법을 간단하게 정리했습니다. 먼저 육각형 그리드는 셀의 평평한 부분이 위쪽에 오는 것(flat topped), 뾰족한 부분이 위쪽에 오는 것(pointy topped)으로 크게 2가지로 분류할 수 있습니다. 또 좌표계(coordinates)를 어떻게 정하느냐에 따라서 Offset, Doubled, Axial, Cube 의 4가지로 분류할 수 있습니다. 각 좌표계는 서로 변환이 가능하기 때문에 사실상 하나의 육각형 그리드를 나타낸다고 할 수 있습니다.

저는 Cube 좌표계를 주로 사용합니다. Cube 좌표계는 x, y, z 의 3개 축으로 2차원 평면의 육각형 그리드를 나타내는 표현 방법입니다. 이 좌표계에서는 회전 변환, 벡터 연산이 쉽고 원점(0, 0, 0)을 중심으로 한 대칭성도 쉽게 얻을 수 있기 때문에 여러 가지로 편리한 점이 많습니다.

<textarea id='hex_0' style='display:none;'>
function HexCell(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
}
</textarea>
<script>
    let myCodeMirror = CodeMirror.fromTextArea(document.getElementById('hex_0'), {
        mode: 'javascript',
        lineNumbers: true,
        theme: 'monokai'
    });
</script>



물론 별도의 클래스로 육각형 그리드를 구현해야 합니다.
