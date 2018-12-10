---
title: (공사중) Shadertoy 기본 쉐이더 분석
date: 2018-12-10
tags:
- shader
- shadertoy
interactive: true
threejs: true
---

![](<../images/shadertoy_start_0.jpg>)
<small>["Canyon" by iq](<https://www.shadertoy.com/view/MdBGzG>)</small>

&nbsp;

## 도입

[Shader](<https://en.wikipedia.org/wiki/Shader>) 는 컴퓨터 그래픽의 렌더링 효과, 주로 빛과 그림자를 표현하는 데에 쓰이는 언어입니다. 하드웨어, 특히 GPU 의 발전으로 Shader 로 예전에는 성능상의 문제로 표현할 수 없었던 많은 것들이 이제 표현 가능해졌습니다.

[Shadertoy](<https://www.shadertoy.com>) 는 이 분야의 선구자 중 한 명인 [Inigo Quilez](<https://www.linkedin.com/in/inigo-quilez-8161a46/>) 가 제작에 참여한 온라인 쉐이더 코드 공유 플랫폼입니다. WebGL 기술을 이용해서 웹 브라우저에서도 Shader 코드가 작동할 수 있도록 만든 최초의 플랫폼으로, 몇 줄의 코드만으로 눈이 번쩍 뜨이게 하는 엄청난 결과물을 만들 수 있다는 것을 보여주고 있습니다.

그런데 이 곳의 코드들을 살펴보다보면 난이도가 주로 매우 쉬움과 매우 어려움의 두 가지로 나뉩니다. 아무래도 학습에 허들이 큰 분야이다보니 생기는 문제인 것 같습니다. 저도 [The Book of Shaders](<https://thebookofshaders.com/>) 나 Udacity 의 [Interactive 3D Graphics](<https://www.udacity.com/course/interactive-3d-graphics--cs291>) 같은 강좌도 들어보고, Inigo Quilez 의 유튜브도 몇 개 봤지만 이해도를 높이기에는 한계가 있었습니다. 아마 저와 비슷한 심정을 느끼신 분들이 있을 것이라고 생각해서, 이런 글을 쓰게 되었습니다.

이제부터 시작할 일련의 글들은 Shadertoy 에 올라온 Shader 코드 중 난이도가 낮고 구조가 쉬운 코드를 중심으로 interactive 하게 직접 값을 바꾸는 창을 띄워서 분석해보려고 합니다. [육각형으로 구성된 맵 만들기](<https://greentec.github.io/hexagonal-map/>)에서처럼 말입니다. 다만 여기서는 Three.js 를 활용해서 Fragment Shader[^1] 를 작성해보는 것을 주 목적으로 하려고 합니다. Shadertoy 도 Fragment Shader 만 바꾸고 있습니다.

[^1]: Pixel Shader 라고도 합니다. 화면의 각 픽셀이 어떻게 그려질지 결정합니다. 밑에서 다시 다루겠습니다.

&nbsp;

## 실전!

지금 바로 코드로 들어가보겠습니다. 
