---
title: Shadertoy 메타볼 분석
date: 2018-12-12
tags:
- shader
- shadertoy
- threejs
interactive: true
threejs: true
shader: true
---

![](<../images/shadertoy_metaball_0.jpg>)
<small>["Metaballs++ " by TheBuoy](<https://www.shadertoy.com/view/XtKfRy>)</small>

&nbsp;

## 도입

[지난 글](<https://greentec.github.io/shadertoy-start/>)에 이어, 이번에는 3D 그래픽스의 가장 기본적인 구현 요소 중 하나인 메타볼에 대해서 알아보겠습니다. 이번 포스팅의 아이디어는 Ryan Geiss 라는 분이 쓴 [이 글](<http://www.geisswerks.com/ryan/BLOBS/blobs.html>)에 많이 의존하고 있다는 점을 미리 밝혀드립니다. 홈페이지를 보니 이 분은 2010년부터 Google 에서 일하고 있네요.

오늘 분석할 Shadertoy 의 코드는 많은 메타볼 구현체 중 어렵게 고른 [Metaballs - kinda yellow](<https://www.shadertoy.com/view/4dVfWK>)입니다. 단순하면서도 비주얼적으로 아름답게 보이는 것을 찾기 위해 노력했습니다. 그럼 시작해보겠습니다.

![](<../images/shadertoy_metaball_1.png>)


## 좌표 관련 기본 코드

지난 글에서 `vec2 uv = fragCoord/iResolution.xy;` 가 스크린의 크기 변화에 관계없이 각 픽셀에 대응하는 `uv.x`, `uv.y` 값을 각각 `0.0~1.0` 사이의 값으로 제한해주는 것이라고 정리했습니다. 이 코드는 shadertoy 에서 가장 많이 쓰이는 boilerplate code 라는 설명도 같이 했습니다. 그런데 shadertoy 코드의 11행과 15행에도 기본 좌표를 변경하는 코드가 있습니다.

11행 : `uv -= .5;`

15행 : `uv.x *= iResolution.x / iResolution.y;`

먼저 11행에 대해서 알아보기 위해 코드를 넣어보겠습니다.

<textarea id='shader_text_0' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    // uv -= .5;
    gl_FragColor = vec4(vec2(uv), 0.0, 1.0);
}</textarea>
<iframe id='shader_preview_0'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_0">
    uniform vec2 resolution;
    uniform float time;
    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        // uv -= .5;
        gl_FragColor = vec4(vec2(uv), 0.0, 1.0);
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
