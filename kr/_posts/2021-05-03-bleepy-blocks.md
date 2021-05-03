---
title: Shadertoy 'Bleepy blocks' 분석
date: 2021-05-03
lang: kr
ref: bleepy-blocks
tags:
- shader
- shadertoy
interactive: true
threejs: true
shader: true
---

![](<../images/shadertoy_blocks_0.png>)
<small>["Bleepy blocks" by Daedelus](<https://www.shadertoy.com/view/MsXSzM>)</small>

&nbsp;
## 도입

거의 2년 반 만에 Shadertoy 관련 포스팅을 하게 되었습니다. 그동안 많은 일이 있었지만 다행히 creative coding의 세계에 돌아오게 되어 기쁩니다. 지금은 간단히 손을 풀어보는 의미에서 약간 짧은 코드를 살펴보도록 하겠습니다. 분석할 코드는 ['Bleepy blocks'](<https://www.shadertoy.com/view/MsXSzM>)입니다. 이 코드는 [Three.js 기초 튜토리얼](<https://threejsfundamentals.org/threejs/lessons/kr/>)의 [쉐이더토이(Shadertoy) 활용하기](<https://threejsfundamentals.org/threejs/lessons/kr/threejs-shadertoy.html>)에도 사용될 만큼 유명한 코드입니다. 그럼 시작해보도록 하겠습니다.


&nbsp;
## Texture 입력

예전에 [Shadertoy 빗방울 효과 분석](<https://greentec.github.io/rain-drops/>)에서 사용했던 것처럼 이 코드에서도 텍스처를 사용합니다. 사용되는 텍스처는 8x8 픽셀 크기의 작은 랜덤 노이즈입니다. 참고로 [Shadertoy 빗방울 효과 분석](<https://greentec.github.io/rain-drops/>)에서는 256x256 크기의 랜덤 노이즈 이미지가 사용되었습니다. 우리가 사용할 8x8 픽셀 이미지의 이름은 베이어(bayer)로, 카메라의 이미지 센서에 배치되는 격자무늬 패턴의 이름입니다.

![](<../images/shadertoy_blocks_1.png>)
<small>Shadertoy에서 사용되는 8x8 픽셀 크기의 베이어 패턴</small>

먼저 패턴 이미지를 불러오겠습니다. 이 코드에서는 `texture0`이라는 이름으로 이미지를 불러오도록 지정했습니다(Shadertoy에서는 `iChannel0`이라는 이름으로 첫번째 텍스처를 불러옵니다).

<div>
<textarea class='codeeditor fragment texture' data-texture0='../images/shadertoy_bayer.png' data-texture0_filter='nearest'>
uniform sampler2D texture0;
uniform vec2 resolution;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;
    gl_FragColor = texture2D(texture0, uv);
    //gl_FragColor = texture2D(texture0, floor(uv * 8.0)/8.0);
}




</textarea>
</div>

위 코드의 결과로 베이어 패턴 이미지가 화면에 표시됩니다. `uv`는 좌표계 계산을 거쳐서 텍스쳐를 1:1 비율로 표시되도록 합니다. 5행을 주석처리 해보면 이미지가 화면에 꽉 차도록, 약간 깨진 비율로 표시되는 것을 확인할 수 있습니다.

6행 대신 7행의 주석처리를 해제해도 결과에는 변화가 없습니다. 이것은 텍스쳐를 `nearest` 필터로 불러오고 있기 때문입니다. 이와 반대되는 필터링 방법으로는 `linear` 필터가 있습니다. `nearest` 필터는 가운데가 텍스쳐 좌표에 가장 가까운 픽셀을 선택하고, `linear` 필터는 인접한 픽셀의 컬러들이 거리에 비례해서 혼합된 색상을 얻게 됩니다.[^1]

[^1]: [Learn OpenGL 번역 2-6. 시작하기 - Textures](<https://heinleinsgame.tistory.com/9>)

7행 대신 6행을 써도 상관이 없기 때문에, `floor` 함수를 사용하지 않고 `uv` 만 사용하겠습니다. 다음은 `p` 라는 값을 화면에 표시해보는 코드입니다.


<div>
<textarea class='codeeditor fragment texture' data-texture0='../images/shadertoy_bayer.png' data-texture0_filter='nearest'>
uniform sampler2D texture0;
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;

    vec4 noise = texture2D(texture0, uv);
    float p = 1.0 - mod(noise.r + noise.g + noise.b + time * 0.25, 1.0);
    //float p = 1.0 - mod(noise.r + time * 0.25, 1.0);
  	//float p = mod(noise.r + noise.g + noise.b + time * 0.25, 1.0);
    gl_FragColor = vec4(p, p, p, 1.0);
}

</textarea>
</div>

먼저 8행에서는 텍스쳐 값을 `noise` 라는 변수에 저장합니다. 텍스쳐는 흑백이기 때문에 r, g, b 모두 같은 값을 가지고 있습니다. 그 다음에 `p` 라는 값은 시간 값인 `time` 이 더해지고 `noise` 의 r, g, b 값을 모두 더합니다. `mod` 함수는 나머지를 반환하는데, 두번째 인수가 나누는 수를 나타냅니다. 1.0으로 나누기 때문에 여기서 `mod` 함수의 반환값은 0.0~1.0 사이입니다. 결과적으로 화면에 나오는 값은 검정색(0.0)과 흰색(1.0) 사이에서 표현됩니다.

표현상의 차이를 좀 더 알아보기 위해 9행을 주석처리하고 10행의 주석을 해제해 보면 차이를 느낄 수 있습니다. 9행은 10행보다 값의 차이를 강조합니다.

9행 주석처리하고 11행의 주석을 해제하면, 9행의 동작과는 반대로 불이 점점 밝아지는 듯한 효과를 확인할 수 있습니다.


<div>
<textarea class='codeeditor fragment texture' data-texture0='../images/shadertoy_bayer.png' data-texture0_filter='nearest'>
uniform sampler2D texture0;
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;

    vec4 noise = texture2D(texture0, uv);
    float p = 1.0 - mod(noise.r + noise.g + noise.b + time * 0.25, 1.0);
    p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
    gl_FragColor = vec4(p, p, p, 1.0);
}

</textarea>
</div>

10행에서 `p` 값에 min, max 함수를 더해주면 값이 천천히 변하던 모습에서 좀 더 자연스럽게 전구의 불이 들어왔다가 꺼지는 것 같은 효과를 줍니다. 이 `p` 값이 구체적으로 어떻게 변하는지를 그래프로 확인해 보겠습니다.


<div>
<textarea class='codeeditor fragment-graph inside'>
float p = 1.0 - mod(x, 1.0);
y = min(max(p * 3.0 - 1.8, 0.1), 2.0);
//y = p;









</textarea>
</div>

그래프로 값을 확인해보니 3행에 비해 2행의 그래프는 좀 더 뾰족하고 좁은 모양입니다. 2행의 그래프에서 `p` 값은 0에 머몰러 있는 시간, 즉 꺼져 있는 시간이 원래 그래프보다 훨씬 깁니다. 모든 불이 동시에 켜지지 않고 있기 때문에 베이어 패턴이 좀 더 뚜렷하게 보이게 됩니다.

마지막으로 각 도트의 엣지를 둥글게 깎아주고 색을 입혀주는 부분이 남았습니다.


<div>
<textarea class='codeeditor fragment texture' data-texture0='../images/shadertoy_bayer.png' data-texture0_filter='nearest'>
uniform sampler2D texture0;
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;

    vec4 noise = texture2D(texture0, uv);
    float p = 1.0 - mod(noise.r + noise.g + noise.b + time * 0.25, 1.0);
    p = min(max(p * 3.0 - 1.8, 0.1), 2.0);

    vec2 r = mod(uv * 8.0, 1.0);
    r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    gl_FragColor = vec4(r, 0.0, 1.0);
    p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
    //gl_FragColor = vec4(1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0));
    //gl_FragColor = vec4(p, p, p, 1.0);
    //gl_FragColor = vec4(0.7, 1.6, 2.8, 1.0) * p;
}
</textarea>
</div>

여기서 `r` 이라는 값을 화면에 표시해 보면 각 도트의 가장자리에 해당하는 값에만 붉은색과 초록색에 해당하는 x, y 값이 존재하는 것을 확인할 수 있습니다. r 값은 `mod` 계산의 결과이기 때문에 0.0~1.0일 것이고, 여기서 0.5를 빼고 제곱을 해주기 때문에 0.0~0.25 사이의 범위를 가지는 값일 것입니다.

15행은 여기서 r 값을 `dot` 계산(`dot.x * dot.x + dot.y * dot.y`)을 해준 뒤에 12를 곱하고, 1과의 min 값을 찾은 뒤에 그것을 제곱해주고 1에서 뺍니다. 최대값인 0.25는 이 계산을 거치면 0.25 * 0.25 * 12 = 0.75가 되고, 여기에 다시 제곱을 하면 0.5625가 됩니다. 마지막으로 다시 1에서 빼면 0.4375가 될 것입니다. 이 값이 최대값이었고, 최소값인 0은 이 계산을 거치면 1이 됩니다.

말로 표현하면 복잡하지만 16행의 주석을 제거하여 화면으로 표현하면 무척 간단합니다. 14행에서 봤던 값이 부드럽게 역으로 계산되는 것을 확인할 수 있습니다. 도트에 해당하는 부분은 모두 흰 색, 즉 1.0에 가까운 값이 됩니다.


<div>
<textarea class='codeeditor fragment-graph inside'>
float r = mod(x, 1.0);
r = pow(r - 0.5, 2.0);
y = 1.0 - pow(min(1.0, dot(r, r) * 12.0), 2.0);









</textarea>
</div>

위의 그래프에서도 결과값이 부드럽게 깎이는 엣지가 되는 것을 확인할 수 있습니다. 이 값을 `p` 에 곱한 것이 15행의 계산입니다.

17행의 주석을 해제해보면 이 값을 p에 곱했을 때의 결과를 확인할 수 있습니다. 그리고 18행의 주석을 해제하면 여기에 푸른색 계열의 조명을 입힌 결과를 확인할 수 있습니다.

이상으로 코드 분석을 마치겠습니다. 오랜만이라 짧은 코드를 보여드렸는데 다음에는 좀 더 복잡한 코드로 돌아오면 좋겠습니다. 읽어주셔서 감사합니다.
