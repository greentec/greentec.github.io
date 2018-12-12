---
title: (공사중) Shadertoy 메타볼 분석
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

&nbsp;
## 좌표 관련 기본 코드

본격적인 내용에 앞서서 여기에도 좌표 관련 기본 코드가 추가로 나오고 있어서 짚고 넘어가도록 하겠습니다.

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
5행의 주석에 `uv -= .5;` 가 추가되어 있습니다. 주석을 해제하면 화면이 전반적으로 어두워지는 것을 확인할 수 있습니다. 화면 전반적으로 `0.0~1.0` 범위에 있던 uv.x, uv.y 값에서 0.5 를 뺐기 때문에, 그 범위는 `-0.5~0.5` 가 된다는 것을 짐작할 수 있습니다.

![](<../images/shadertoy_start_3.png>)

shader 의 컬러 값은 0.0~1.0 만 유효한 값으로 인정하고, 나머지는 clip 됩니다. 즉 음수는 0.0 으로, 1.0 을 초과하는 양수는 1.0 으로 계산됩니다. 따라서 음수가 많아졌기 때문에 화면에 검은색의 비율이 높아지고 전반적으로 어두워진 것입니다.

화면 중앙의 좌표가 `(0.5, 0.5)` 에서 **`(0, 0)`** 이 된 것을 주목해주십시오. 이렇게 되면 화면 중앙을 중심으로 원 등의 도형을 그리기가 수월해집니다. 중학교 1학년 때부터 배우는 좌표평면을 생각하시면 이해가 쉬울 것 같습니다.

그럼 15행의 `uv.x *= iResolution.x / iResolution.y;`은 무엇일까요?

<textarea id='shader_text_1' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv, vec2 pos) {
    return 0.05/distance(uv, pos);
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    // uv.x *= resolution.x / resolution.y;
    float c = circle(uv, vec2(0.,0.));
    gl_FragColor = vec4(c, 0, 0, 1.0);
}</textarea>
<iframe id='shader_preview_1'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_1">
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv, vec2 pos) {
    return 0.05/distance(uv, pos);
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    // uv.x *= resolution.x / resolution.y;
    float c = circle(uv, vec2(0.,0.));
    gl_FragColor = vec4(c, 0, 0, 1.0);
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
일단 `circle` 함수가 추가되었는데 이 부분은 바로 뒤에 설명드리도록 하겠습니다. 먼저 10행의 주석을 해제하며 차이를 직접 확인해보시기 바랍니다. 원의 너비가 달라지는 것이 느껴지시나요?

`uv.x *= resolution.x / resolution.y;` 를 뜯어보면 이 식은 `uv.x` 에 (screen 의 x 크기 / screen 의 y 크기)를 곱해줍니다. 보통 모니터는 가로가 세로보다 넓은 스크린이 많기 때문에, 가로/세로를 같은 비율로 표현한다면 원래 예제의 원처럼 찌그러진 상태로 표현될 것입니다. 이 식은 그에 대해 비율을 정규화시켜서 가로/세로 비율이 1:1 로 보이도록 하는 효과를 갖습니다.

![](<../images/shadertoy_start_4.png>)

그럼 이제 circle 함수에 대한 이야기를 할 때가 온 것 같습니다.

&nbsp;
## Circle 함수

Circle 이라고 하면 아무래도 중학교때 배우는 원의 방정식을 기억하시는 분이 많으실 것 같습니다.

$$
x^2+y^2=1
$$

이 식을 shader 로 표현하면 이렇게 볼 수 있습니다.

<textarea id='shader_text_2' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv) {
    // return step(0.2, distance(uv, vec2(0.,0.)));
    return distance(uv, vec2(0.,0.));
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x / resolution.y;
    float c = circle(uv);
    gl_FragColor = vec4(c, 0, 0, 1.0);
    // gl_FragColor = vec4(c, c * c / 3., 0, 1.0);
}</textarea>
<iframe id='shader_preview_2'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_2">
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv) {
    // return step(0.2, distance(uv, vec2(0.,0.)));
    return distance(uv, vec2(0.,0.));
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x / resolution.y;
    float c = circle(uv);
    gl_FragColor = vec4(c, 0, 0, 1.0);
    // gl_FragColor = vec4(c, c * c / 3., 0, 1.0);
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
`circle` 함수를 먼저 뜯어보면, `circle` 함수의 인수는 `uv` 하나입니다. 그리고 `distance` 는 shader 에서 쓰는 inline function 입니다. 이름 그대로 벡터와 벡터 사이의 거리를 구할 수 있습니다. 자세한 내용은 The book of shaders 의 [`distance`](<https://thebookofshaders.com/glossary/?search=distance>)에 예제와 함께 설명이 되어 있습니다.

스크린의 중심이 `(0., 0.)` 이기 때문에 이 점과 모든 점의 거리를 구하면 자연스럽게 원의 영역이 만들어집니다. 원의 정의는 _한 점에서 거리가 같은 모든 점의 집합_이기 때문입니다.

여기서는 거리 정보를 `gl_FragColor` 의 R 채널에 넣었습니다. 그 결과 거리가 멀어질수록 빨간색이 진해집니다. 원의 영역을 뚜렷하게 구분하고 싶으면 `step` function 을 사용합니다. 이 함수는 두번째 인수가 첫번째 인수보다 작으면 `0.0` 을, 그렇지 않으면 `1.0` 을 반환합니다. The book of shaders 의 [`step`](<https://thebookofshaders.com/glossary/?search=step>) 페이지에서는 첫번째 인수를 edge 라고 명명하고 있습니다. `step` 함수를 쓴 결과를 알아보기 위해 5행의 주석을 해제합니다. 경계선이 뚜렷한 원이 생긴 것을 보실 수 있습니다. `0.2` 보다 작은 값은 모두 `0.0` 이 되고, 그렇지 않으면 모두 `1.0` 이 되기 때문입니다.

눈치채신 분도 있겠지만 `vec(0., 0.)`은 원의 중심 역할을 합니다. 즉 이 값을 바꾸면 원의 중심이 바뀌어서 평행이동을 시킬 수 있습니다. 이것을 따로 `pos` 라는 인수로 빼서 사용한 것이 이 글의 두번째 예제에 나왔던 `circle` 함수입니다.

그런데 우리는 보통 원을 그릴 때 바깥쪽 영역보다 안쪽 영역이 궁금한 경우가 많습니다. 즉 안쪽을 색칠해서 원으로 쓰고, 나머지 빈 공간은 무시하는 경우를 말합니다. 이렇게 하기 위해서는 어떻게 해야 할까요? 앞의 원의 방정식에서 $$x^2+y^2$$ 로 양변을 각각 나누면 아래와 같은 식이 됩니다.

$$
1 = \frac{1}{x^2+y^2}
$$

이 식에 `pos` 인수를 결합하면 두번째 예제에서 보셨던 `circle` 함수가 됩니다. 이 식의 분자에 해당하는 부분은 원의 반지름의 제곱입니다. 두번째 예제에서는 `0.05` 를 사용했습니다.

<div>
<textarea id='shader_text_3' height='10' style='display:none;'>
float circle(vec2 uv, vec2 pos) {
    return 0.05/distance(uv, pos);
}</textarea>
</div>
<script>
    (function() {
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_3'), {
            mode: 'x-shader/x-fragment',
            lineNumbers: true,
            theme: 'monokai',
            readOnly: true
        });
    })();
</script>

아래 코드에서는 G 채널에도 값이 들어가서, 원래 shadertoy code 인 [Metaballs - kinda yellow](<https://www.shadertoy.com/view/4dVfWK>)와 같은 색조합을 볼 수 있습니다.

<textarea id='shader_text_4' width='400' height='400' style='display:none;'>
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv, vec2 pos) {
    return 0.05/distance(uv, pos);
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x / resolution.y;
    float c = circle(uv, vec2(0., 0.));
    // gl_FragColor = vec4(c, 0, 0, 1.0);
    gl_FragColor = vec4(c, c * c / 3., 0, 1.0);
}</textarea>
<iframe id='shader_preview_4'>
</iframe>
<script type="x-shader/x-fragment" id="shader_frag_4">
uniform vec2 resolution;
uniform float time;

float circle(vec2 uv, vec2 pos) {
    return 0.05/distance(uv, pos);
}
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x / resolution.y;
    float c = circle(uv, vec2(0., 0.));
    // gl_FragColor = vec4(c, 0, 0, 1.0);
    gl_FragColor = vec4(c, c * c / 3., 0, 1.0);
}
</script>
<script>
    (function() {
        let delay;
        let editor = CodeMirror.fromTextArea(document.getElementById('shader_text_4'), {
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
                fragmentShader: document.getElementById('shader_frag_4').textContent
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            let previewFrame = document.getElementById('shader_preview_4');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            preview.body.style.margin = 0;
            preview.body.appendChild(renderer.domElement);
            stats = new Stats();
            preview.body.appendChild(stats.dom);
            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);
        }

        function onWindowResize(event) {
            let previewFrame = document.getElementById('shader_preview_4');
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
            let previewFrame = document.getElementById('shader_preview_4');
            let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            let canvas;
            let button;
            let p;

            document.getElementById('shader_text_4').textContent = editor.getValue();
            material = new THREE.ShaderMaterial({
                uniforms: material.uniforms,
                vertexShader: material.vertexShader,
                fragmentShader: document.getElementById('shader_text_4').textContent
            });
            mesh.material = material;
        }
        setTimeout(updatePreview, 300);
    })();
</script>


&nbsp;
## 여러 개의 도형 더하기

한 개의 원을 그렸는데, 2개 이상의 원은 어떻게 표현해야 할까요? shader 에서는 엄청나게 쉽습니다. 바로 색깔을 **더해주면** 됩니다.



&nbsp;
## 메타볼
