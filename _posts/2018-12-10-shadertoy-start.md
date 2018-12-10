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

[Shadertoy](<https://www.shadertoy.com>) 는 이 분야의 선구자 중 한 명인 [Inigo](<https://www.iquilezles.org/>) [Quilez](<https://www.linkedin.com/in/inigo-quilez-8161a46/>) 가 제작에 참여한 온라인 쉐이더 코드 공유 플랫폼입니다. WebGL 기술을 이용해서 웹 브라우저에서도 Shader 코드가 작동할 수 있도록 만든 최초의 플랫폼으로, 몇 줄의 코드만으로 눈이 번쩍 뜨이게 하는 엄청난 결과물을 만들 수 있다는 것을 보여주고 있습니다.

그런데 이 곳의 코드들을 살펴보다보면 난이도가 주로 매우 쉬움과 매우 어려움의 두 가지로 나뉩니다. 아무래도 학습에 허들이 큰 분야이다보니 생기는 문제인 것 같습니다. 저도 [The Book of Shaders](<https://thebookofshaders.com/>) 나 Udacity 의 [Interactive 3D Graphics](<https://www.udacity.com/course/interactive-3d-graphics--cs291>) 같은 강좌도 들어보고, Inigo Quilez 의 유튜브도 몇 개 봤지만 이해도를 높이기에는 한계가 있었습니다. 아마 저와 비슷한 심정을 느끼신 분들이 있을 것이라고 생각해서, 이런 글을 쓰게 되었습니다.

이제부터 시작할 일련의 글들은 Shadertoy 에 올라온 Shader 코드 중 난이도가 낮고 구조가 쉬운 코드를 중심으로 interactive 하게 직접 값을 바꾸는 창을 띄워서 분석해보려고 합니다. [육각형으로 구성된 맵 만들기](<https://greentec.github.io/hexagonal-map/>)에서처럼 말입니다. 다만 여기서는 Three.js 를 활용해서 Fragment Shader[^1] 를 작성해보는 것을 주 목적으로 하려고 합니다. Shadertoy 도 Fragment Shader 만 바꾸고 있습니다.

[^1]: Pixel Shader 라고도 합니다. 화면의 각 픽셀이 어떻게 그려질지 결정합니다.

&nbsp;

## 실전!

![](<../images/shadertoy_start_1.png>)

지금 바로 코드로 들어가보겠습니다. 오늘의 코드는 Shadertoy 에서 New 를 눌러서 처음 코드를 생성할 때 나오는 기본 쉐이더입니다. 처음이니까 쉬운 코드로 하겠습니다.

<textarea id='shader_text_0' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = vec4(vec3(0.5), 1.0));
    // gl_FragColor = vec4(1.0);
}</textarea>
<iframe id='shader_preview_0'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_0">
    uniform vec2 resolution;
    uniform float time;
    void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // gl_FragColor = vec4(vec3(0.5), 1.0));
        // gl_FragColor = vec4(1.0);
    }
</script>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_0'), {
            mode: 'javascript',
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
          uniforms.time.value += 0.05;
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
            // eval(threejscode);
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
위 코드의 Fragment Shader 는 화면 전체를 빨간색으로 그려줍니다. `gl_FragColor` 는 각 픽셀의 Color 를 정의합니다. 0~255 의 `integer` 로 나타내는 RGB 값과는 다르게, Shader 에서는 0.0~1.0 의 `float` 으로 나타냅니다. 여기서는 R, G, B, A 의 순서로 color 를 지정합니다. `vec4` 는 길이가 4인 벡터를 나타냅니다.

6행의 주석을 해제(주석 표시인 // 를 지우면 됩니다)하면 오른쪽 화면의 색이 회색으로 바뀝니다. `vec3` 은 길이가 3인 벡터입니다. 6행은 `vec4(0.5, 0.5, 0.5, 1.0)` 과 같은 값을 가집니다.

7행의 주석을 해제하면 화면이 흰색으로 바뀝니다. R, G, B, A 에 모두 1.0 을 넣었기 때문입니다. 그 외에 다른 값으로 바꿔보면서 색이 바뀌는 것을 테스트해볼 수 있습니다.

그럼 이제 좀 더 심화된 버전의 코드를 작성해 보겠습니다.


&nbsp;
