---
title: Shadertoy 기본 쉐이더 분석
date: 2018-12-10
tags:
- shader
- shadertoy
- threejs
interactive: true
threejs: true
shader: true
---

![](<../images/shadertoy_start_0.jpg>)
<small>["Canyon" by iq](<https://www.shadertoy.com/view/MdBGzG>)</small>

&nbsp;

## 도입

[Shader](<https://en.wikipedia.org/wiki/Shader>) 는 컴퓨터 그래픽의 렌더링 효과, 주로 빛과 그림자를 표현하는 데에 쓰이는 언어입니다. 하드웨어, 특히 GPU 의 발전으로 Shader 로 예전에는 성능상의 문제로 표현할 수 없었던 많은 것들이 이제 표현 가능해졌습니다.

[Shadertoy](<https://www.shadertoy.com>) 는 이 분야의 선구자 중 한 명인 [Inigo](<https://www.iquilezles.org/>) [Quilez](<https://www.linkedin.com/in/inigo-quilez-8161a46/>) 가 제작에 참여한 온라인 쉐이더 코드 공유 플랫폼입니다. WebGL 기술을 이용해서 웹 브라우저에서도 Shader 코드가 작동할 수 있도록 만든 최초의 플랫폼으로, 몇 줄의 코드만으로 눈이 번쩍 뜨이게 하는 엄청난 결과물을 만들 수 있다는 것을 보여주고 있습니다.

그런데 이 곳의 코드들을 살펴보다보면 난이도가 주로 매우 쉬움과 매우 어려움의 두 가지로 나뉩니다. 아무래도 학습에 허들이 큰 분야이다보니 생기는 문제인 것 같습니다. 저도 [The Book of Shaders](<https://thebookofshaders.com/>) 나 Udacity 의 [Interactive 3D Graphics](<https://www.udacity.com/course/interactive-3d-graphics--cs291>) 같은 강좌도 들어보고, [Inigo Quilez 의 유튜브](<https://www.youtube.com/channel/UCdmAhiG8HQDlz8uyekw4ENw>)도 몇 개 봤지만 이해도를 높이기에는 한계가 있었습니다. 아마 저와 비슷한 심정을 느끼신 분들이 있을 것이라고 생각해서, 그리고 저 스스로도 부족한 부분을 채우기 위해 이런 글을 쓰게 되었습니다.

이제부터 시작할 일련의 글들은 Shadertoy 에 올라온 Shader 코드 중 난이도가 낮고 구조가 쉬운 코드를 중심으로 interactive 하게 직접 값을 바꾸는 창을 띄워서 분석해보려고 합니다. [육각형으로 구성된 맵 만들기](<https://greentec.github.io/hexagonal-map/>)에서처럼 말입니다. 다만 여기서는 Three.js 를 활용해서 Fragment Shader[^1] 를 작성해보는 것을 주 목적으로 하려고 합니다. Shadertoy 도 Fragment Shader 만 바꾸고 있습니다.

[^1]: Pixel Shader 라고도 합니다. 화면의 각 픽셀이 어떻게 그려질지 결정합니다.

&nbsp;

## 실전!

![](<../images/shadertoy_start_1.png>)

지금 바로 코드로 들어가보겠습니다. 오늘의 코드는 Shadertoy 에서 New 를 눌러서 처음 코드를 생성할 때 나오는 기본 쉐이더입니다. 처음이니까 쉬운 코드로 하겠습니다.

그리고 Shadertoy 의 코드를 three.js 에서 그대로 가져올 수는 없어서 약간 변형하면서 가져와야 합니다. 이 부분은 [hackernoon 에 올라온 이 글](<https://hackernoon.com/converting-shaders-from-shadertoy-to-threejs-fe17480ed5c6>)에도 잘 설명되어 있습니다. 여기서는 `fragColor` 를 `gl_FragColor` 로, `fragCoord` 를 `gl_FragCoord` 로, `iResoultion` 을 `resolution` 으로, `iTime` 을 `time` 으로 썼습니다.

<textarea id='shader_text_0' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(vec3(0.5), 1.0);
    // gl_FragColor = vec4(1.0);
}</textarea>
<iframe id='shader_preview_0' class='previewOutside'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_0">
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
</script>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_0'), {
            mode: 'x-shader/x-fragment',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai'
        });
        let stats;
        let camera, scene, renderer;
        let material, mesh;
        let uniforms;
        let VERTEX = `void main() { gl_Position = vec4( position, 1.0 ); }`;
        init();
        animate();

        function init() {
            camera = new THREE.Camera();
            camera.position.z = 1;
            scene = new THREE.Scene();
            var geometry = new THREE.PlaneBufferGeometry(2, 2);
            uniforms = {
                time: {
                    type: "f",
                    value: 1.0
                },
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2()
                }
            };
            material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: VERTEX,
                fragmentShader: document.getElementById('shader_frag_0').textContent
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            let previewFrame = document.getElementById('shader_preview_0');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            preview.body.style.margin = 0;
            preview.body.appendChild(renderer.domElement);
            stats = new Stats();
            preview.body.appendChild(stats.dom);
            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);
        }

        function onWindowResize(event) {
            let previewFrame = document.getElementById('shader_preview_0');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;

            renderer.setSize(preview.body.offsetWidth, preview.body.offsetHeight);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }

        function render() {
            uniforms.time.value += 0.02;
            renderer.render(scene, camera);
        }

        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('shader_preview_0');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;
            let button;
            let p;

            document.getElementById('shader_text_0').textContent = editor.getValue();
            material = new THREE.ShaderMaterial({
                uniforms: material.uniforms,
                vertexShader: material.vertexShader,
                fragmentShader: document.getElementById('shader_text_0').textContent
            });
            mesh.material = material;
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
위 코드의 Fragment Shader 는 화면 전체를 빨간색으로 그려줍니다. 4행의 `gl_FragColor` 는 각 픽셀의 Color 를 정의합니다. 0~255 의 `integer` 로 나타내는 RGB 값과는 다르게, Shader 에서는 0.0~1.0 의 `float` 으로 나타냅니다. 여기서는 R, G, B, A 의 순서로 color 를 지정합니다. `vec4` 는 길이가 4인 벡터를 나타냅니다.

5행의 주석을 해제(주석 표시인 // 를 지우면 됩니다)하면 오른쪽 화면의 색이 회색으로 바뀝니다. `vec3` 은 길이가 3인 벡터입니다. 5행은 `vec4(0.5, 0.5, 0.5, 1.0)` 과 같은 값을 가집니다.

6행의 주석을 해제하면 화면이 흰색으로 바뀝니다. R, G, B, A 에 모두 1.0 을 넣었기 때문입니다. 그 외에 다른 값으로 바꿔보면서 화면의 색이 바뀌는 것을 테스트해볼 수 있습니다.

그럼 이제 좀 더 심화된 버전의 코드를 작성해 보겠습니다. Shadertoy 의 기본 쉐이더 4행에는 다음과 같은 코드가 있습니다.

`vec2 uv = fragCoord/iResolution.xy;`

`fragCoord` 는 픽셀의 실제 좌표를 나타내는 2차원 벡터 값입니다. x 좌표와 y 좌표는 각각 0.5 에서 resolution - 0.5 사이의 값을 가지는데, 여기서 resolution 이란 스크린의 x, y의 크기를 말합니다. Shadertoy 에서는 스크린의 크기를 iResoultion 이라는 값으로 참조할 수 있습니다. `iResolution.xy` 에서 뒤의 `xy` 는 벡터 중 처음의 2개, x 크기와 y 크기만 가져오겠다는 뜻입니다.

그럼 `uv`는 어떤 값이 될까요? 스크린이 가질 수 있는 최대값으로 각 좌표를 나누기 때문에, `uv` 의 xy 는 각각 0.0~1.0 사이의 값이 됩니다. 이렇게 계산하면 스크린의 크기가 변해도 픽셀의 값은 일정하게 유지됩니다. 이 코드는 Shadertoy 에서 가장 많이 쓰이는 boilerplate code[^2] 중 하나입니다.

[^2]: 프로그램의 여러 곳에서 반복적으로 재사용되는 코드입니다. ([상용구 코드](<https://ko.wikipedia.org/wiki/%EC%83%81%EC%9A%A9%EA%B5%AC_%EC%BD%94%EB%93%9C>))

0.0~1.0 이 익숙하지 않으신가요? 위에서 color 에도 같은 범위 의 값을 썼습니다. 그럼 여기서 이 값을 그대로 color 에 넣어보면 어떻게 될까요?

<textarea id='shader_text_1' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = vec4(vec2(uv), 0.0, 1.0);
    // gl_FragColor = vec4(1.0, vec2(uv), 1.0);
    // gl_FragColor = vec4(uv.x, 0.0, uv.y, 1.0);
}</textarea>
<iframe id='shader_preview_1' class='previewOutside'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_1">
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
</script>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_1'), {
            mode: 'x-shader/x-fragment',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai'
        });
        let stats;
        let camera, scene, renderer;
        let material, mesh;
        let uniforms;
        let VERTEX = `void main() { gl_Position = vec4( position, 1.0 ); }`;
        init();
        animate();

        function init() {
            camera = new THREE.Camera();
            camera.position.z = 1;
            scene = new THREE.Scene();
            var geometry = new THREE.PlaneBufferGeometry(2, 2);
            uniforms = {
                time: {
                    type: "f",
                    value: 1.0
                },
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2()
                }
            };
            material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: VERTEX,
                fragmentShader: document.getElementById('shader_frag_1').textContent
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            let previewFrame = document.getElementById('shader_preview_1');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            preview.body.style.margin = 0;
            preview.body.appendChild(renderer.domElement);
            stats = new Stats();
            preview.body.appendChild(stats.dom);
            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);
        }

        function onWindowResize(event) {
            let previewFrame = document.getElementById('shader_preview_1');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;

            renderer.setSize(preview.body.offsetWidth, preview.body.offsetHeight);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }

        function render() {
            uniforms.time.value += 0.02;
            renderer.render(scene, camera);
        }

        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('shader_preview_1');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;
            let button;
            let p;

            document.getElementById('shader_text_1').textContent = editor.getValue();
            material = new THREE.ShaderMaterial({
                uniforms: material.uniforms,
                vertexShader: material.vertexShader,
                fragmentShader: document.getElementById('shader_text_1').textContent
            });
            mesh.material = material;
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
화면의 왼쪽 아래는 `x=0.0, y=0.0` 이기 때문에 검정색이고, 오른쪽 위는 `x=1.0, y=1.0` 이기 때문에 노란색이 된 것을 확인할 수 있습니다. 이렇게 단 두 줄의 Fragment Shader 코드로 color gradient 를 만들 수 있습니다. 이 외에도 6, 7 행의 주석을 해제하고 값을 바꿔가며 자유롭게 실험해볼 수 있습니다.

그리고 마지막으로 Shadertoy 에서 기본 쉐이더를 켜놓고 조금 있으면 시간에 따라 값이 변하는 것을 확인할 수 있습니다. 이것은 시간 변수를 Fragment Shader 에서 사용해서 픽셀의 색을 변화시키는 데에 사용하기 때문입니다.

`vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));`

이 부분을 간단히 분석해보자면, 처음의 0.5 는 화면의 전반적인 색이 너무 어두워지지 않도록 기본적으로 더해주는 값이라고 할 수 있습니다. 그 다음의 0.5 에 곱해지는 `cos` 는 삼각함수의 cos 값입니다. cos 값은 -1 에서 1 사이의 값을 가지기 때문에, 0.5 를 곱하면 -0.5 에서 0.5, 거기에 0.5 를 더하면 0.0 에서 1.0 사이의 값이 될 것이라고 짐작할 수 있습니다.

`iTime` 은 시간값입니다. 시간값은 당연히 점점 증가하기 때문에 `cos` 에 주어지는 `iTime` 값은 `cos` 값을 서서히 변하게 할 것입니다. `uv.xyx` 는 uv 의 x, y, x 를 사용해서 길이가 3인 벡터를 만든 것입니다. 여기에 각 값이 동일하게 변하지 않도록 하기 위해서 offset 으로 x,y,z 에 각각 `vec3(0,2,4)` 를 더해줍니다. 즉 col 은 서로 연관관계를 가지면서 부드럽게 변하는 0.0~1.0 사이의 `float` 값 3개가 될 것이라고 결론을 내릴 수 있습니다.

![](<../images/shadertoy_start_2.png>)
<small>[그래프 drawing 사이트](<https://www.desmos.com/>)</small>

그럼 코드로 확인해보겠습니다.

<textarea id='shader_text_2' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 col = 0.5 + 0.5*cos(time+uv.xyx+vec3(0,2,4));
    gl_FragColor = vec4(vec3(col), 1.0);
}</textarea>
<iframe id='shader_preview_2' class='previewOutside'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_2">
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
</script>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_2'), {
            mode: 'x-shader/x-fragment',
            lineNumbers: true,
            lineWrapping: true,
            theme: 'monokai'
        });
        let stats;
        let camera, scene, renderer;
        let material, mesh;
        let uniforms;
        let VERTEX = `void main() { gl_Position = vec4( position, 1.0 ); }`;
        init();
        animate();

        function init() {
            camera = new THREE.Camera();
            camera.position.z = 1;
            scene = new THREE.Scene();
            var geometry = new THREE.PlaneBufferGeometry(2, 2);
            uniforms = {
                time: {
                    type: "f",
                    value: 1.0
                },
                resolution: {
                    type: "v2",
                    value: new THREE.Vector2()
                }
            };
            material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: VERTEX,
                fragmentShader: document.getElementById('shader_frag_2').textContent
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            let previewFrame = document.getElementById('shader_preview_2');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            preview.body.style.margin = 0;
            preview.body.appendChild(renderer.domElement);
            stats = new Stats();
            preview.body.appendChild(stats.dom);
            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);
        }

        function onWindowResize(event) {
            let previewFrame = document.getElementById('shader_preview_2');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;

            renderer.setSize(preview.body.offsetWidth, preview.body.offsetHeight);
            uniforms.resolution.value.x = renderer.domElement.width;
            uniforms.resolution.value.y = renderer.domElement.height;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
            stats.update();
        }

        function render() {
            uniforms.time.value += 0.02;
            renderer.render(scene, camera);
        }

        editor.on("change", function() {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, 300);
        });
        function updatePreview() {
            let previewFrame = document.getElementById('shader_preview_2');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;
            let button;
            let p;

            document.getElementById('shader_text_2').textContent = editor.getValue();
            material = new THREE.ShaderMaterial({
                uniforms: material.uniforms,
                vertexShader: material.vertexShader,
                fragmentShader: document.getElementById('shader_text_2').textContent
            });
            mesh.material = material;
        }
        setTimeout(updatePreview, 300);
    })();
</script>

&nbsp;
Shadertoy 의 기본 쉐이더와 같은 형태로 색이 변하는 것을 확인할 수 있습니다. 색이 변하는 속도를 느리게 또는 빠르게 하고 싶다면 `time` 에 0.5 나 2 등의 상수를 곱해주면 됩니다. `cos` 바깥쪽의 숫자의 크기를 조절해볼 수도 있습니다. 이외에도 여러 가지 변화를 쉐이더 코드에 주면서 변화를 확인해볼 수 있습니다.

오늘은 Shadertoy 의 기본 쉐이더를 분석해보았습니다. 다음에는 이것보다는 조금 더 발전했지만 그렇게 어렵지는 않은 쉐이더를 들고 찾아오겠습니다. 너무 어려우면 제가 해석을 못해서 그렇습니다. 긴 글 읽어주셔서 감사합니다.

&nbsp;
