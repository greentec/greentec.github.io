(function() {
    window.onload = init();

    function init() {
        if (document.readyState === 'complete') {
            console.log('code editor initialized');

            // find textarea with 'codeeditor' class
            let text_area_array = document.getElementsByClassName('codeeditor');
            let len = text_area_array.length;
            console.log(len);

            for (let i = 0; i < len; i++) {
                let text_area = text_area_array[i];

                let initial_option = {
                    'mode': 'javascript',
                    'lineNumbers': true,
                    'lineWrapping': true,
                    'theme': 'monokai'
                };

                if (hasClass(text_area, 'readonly')) {
                    initial_option['readOnly'] = true;
                }

                if (hasClass(text_area, 'fragment') || hasClass(text_area, 'fragment-graph')) {
                    initial_option['mode'] = 'x-shader/x-fragment';
                }

                if (hasClass(text_area, 'fold')) {
                    initial_option['foldGutter'] = true;
                    initial_option['gutters'] = ["CodeMirror-linenumbers", "CodeMirror-foldgutter"];
                }

                if (hasClass(text_area, 'mark')) {
                    initial_option['styleSelectedText'] = true;
                }

                // @TODO: add option variation
                let editor = CodeMirror.fromTextArea(text_area, initial_option);

                // if (hasClass(text_area, 'console')) {
                //     let delay;
                //
                //     editor.on("change", function() {
                //         clearTimeout(delay);
                //         delay = setTimeout(updatePreview(editor), 300);
                //     });
                //
                //     let messages = [];
                //     // from https://stackoverflow.com/questions/19846078/how-to-read-from-chromes-console-in-javascript.
                //     // but got RangeError: Maximum call stack size exceeded
                //     console.defaultLog = console.log.bind(console);
                //     console.log = function(){
                //         // default &  console.log()
                //         console.defaultLog.apply(console, arguments);
                //         // new & array data
                //         messages.push(Array.from(arguments));
                //     }
                //
                //     let updatePreview = function(editor) {
                //         let console_output;
                //
                //         if (document.getElementById('editor_console_output_' + i.toString())) {
                //             console_output = document.getElementById('editor_console_output_' + i.toString());
                //         }
                //         else {
                //             console_output = document.createElement('div');
                //             console_output.id = 'editor_console_output_' + i.toString();
                //             editor.display.wrapper.parentNode.appendChild(console_output);
                //             addClass(console_output, 'consoleoutput');
                //             console_output.innerHTML = ' ';
                //         }
                //
                //         try {
                //             messages = [];
                //             eval(editor.getValue());
                //         }
                //         catch (e) {
                //             messages.push(e);
                //         }
                //
                //         console_output.innerHTML = messages;
                //     }
                //     setTimeout(updatePreview(editor), 300);
                // }
                if (hasClass(text_area, 'canvas') || hasClass(text_area, 'chartjs')) {
                    let delay;

                    editor.on("change", function() {
                        clearTimeout(delay);
                        delay = setTimeout(updatePreview(editor), 300);
                    });

                    let updatePreview = function(editor) {
                        let canvas;

                        if (document.getElementById('editor_canvas_' + i.toString())) {
                            canvas = document.getElementById('editor_canvas_' + i.toString());
                        }
                        else {
                            canvas = document.createElement('canvas');
                            canvas.id = 'editor_canvas_' + i.toString();
                            canvas.width = 360;
                            canvas.height = 280;
                            editor.display.wrapper.parentNode.appendChild(canvas);

                            if (hasClass(text_area, 'outside')) {
                                addClass(canvas, 'previewOutside');
                            }
                            else if (hasClass(text_area, 'outsideLeft')) {
                                addClass(canvas, 'previewOutsideLeft');
                            }
                            else if (hasClass(text_area, 'inside')) {
                                addClass(canvas, 'previewInside');
                            }
                            else {
                                addClass(canvas, 'previewOutside');
                            }

                            if (hasClass(text_area, 'chartjs')) {
                                canvas.width = 720;
                                addClass(canvas, 'chart');
                            }
                        }

                        eval(editor.getValue());
                    }
                    setTimeout(updatePreview(editor), 300);
                }
                else if (hasClass(text_area, 'fragment')) {
                    let delay;
                    let camera, scene, renderer;
                    let material, mesh;
                    let uniforms;
                    let mouse = new THREE.Vector2();
                    let VERTEX = `void main() { gl_Position = vec4( position, 1.0 ); }`;

                    init_3d();
                    animate();

                    function init_3d() {
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
                            },
                            mouse: {
                                type: "v2",
                                value: new THREE.Vector2()
                            }
                        };

                        // texture check
                        if (hasClass(text_area, 'texture')) {
                            for (let i = 0; i < 8; i++) {
                                let texture = 'texture' + (i).toString();
                                if (text_area.dataset[texture]) {
                                    uniforms[texture] = {
                                        type: 't',
                                        value: new THREE.TextureLoader().load(text_area.dataset[texture])
                                    }
                                }
                            }
                        }

                        material = new THREE.ShaderMaterial({
                            uniforms: uniforms,
                            vertexShader: VERTEX,
                            fragmentShader: text_area.textContent
                        });
                        mesh = new THREE.Mesh(geometry, material);
                        scene.add(mesh);
                        let canvas = document.createElement('canvas');
                        canvas.id = 'editor_canvas_' + i.toString();
                        canvas.width = 360;
                        canvas.height = 280;
                        renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
                        renderer.setPixelRatio(window.devicePixelRatio);
                        editor.display.wrapper.parentNode.appendChild(renderer.domElement);
                        uniforms.resolution.value.x = renderer.domElement.width;
                        uniforms.resolution.value.y = renderer.domElement.height;

                        if (hasClass(text_area, 'outside')) {
                            addClass(renderer.domElement, 'previewOutside');
                        }
                        else if (hasClass(text_area, 'outsideLeft')) {
                            addClass(renderer.domElement, 'previewOutsideLeft');
                        }
                        else if (hasClass(text_area, 'inside')) {
                            addClass(renderer.domElement, 'previewInside');
                        }
                        else {
                            addClass(renderer.domElement, 'previewInside');
                        }

                        onWindowResize();
                        window.addEventListener('resize', onWindowResize, false);
                        window.addEventListener('mousemove', function(event) {
                            const elem_pos = findPos(renderer.domElement);
                            let mouseX = Math.min(Math.max(event.pageX - elem_pos.left, 0), renderer.domElement.width);
                            let mouseY = Math.min(Math.max(event.pageY - elem_pos.top, 0), renderer.domElement.height);
                            mouse.x = (mouseX / renderer.domElement.width) * 2 - 1;
                            mouse.y = -(mouseY / renderer.domElement.height) * 2 + 1;
                        }, false);

                        let fullscreen_button = document.createElement('input');
                        fullscreen_button.type = 'button';
                        fullscreen_button.value = '🔎';
                        fullscreen_button.id = 'editor_canvas_fullscreen_button_' + i.toString();
                        addClass(fullscreen_button, 'fullscreen_button');
                        editor.display.wrapper.parentNode.appendChild(fullscreen_button);

                        fullscreen_button.addEventListener('click', function(event) {
                            if (isInFullScreen()) {
                                exitFullScreen();
                            }
                            else {
                                const idx = fullscreen_button.id.split('_').pop();
                                const canvas = document.getElementById('editor_canvas_' + idx);
                                enterFullScreen(canvas);
                            }
                        });
                    }

                    function onWindowResize(event) {
                        // let previewFrame = document.getElementById('shader_preview_1');
                        // let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
                        //
                        // renderer.setSize(preview.body.offsetWidth, preview.body.offsetHeight);
                        uniforms.resolution.value.x = renderer.domElement.width;
                        uniforms.resolution.value.y = renderer.domElement.height;
                    }

                    function animate() {
                        requestAnimationFrame(animate);
                        render();
                    }

                    function render() {
                        uniforms.time.value += 0.02;
                        uniforms.mouse.value.copy(mouse);
                        renderer.render(scene, camera);
                    }

                    editor.on("change", function() {
                        clearTimeout(delay);
                        delay = setTimeout(updatePreview(editor), 300);
                    });

                    let updatePreview = function(editor) {
                        material = new THREE.ShaderMaterial({
                            uniforms: material.uniforms,
                            vertexShader: material.vertexShader,
                            fragmentShader: editor.getValue()
                        });
                        mesh.material = material;
                    }
                    setTimeout(updatePreview(editor), 300);
                }
                else if (hasClass(text_area, 'fragment-graph')) {
                    let delay;
                    let camera, scene, renderer;
                    let material, mesh;
                    let uniforms;
                    let VERTEX = `void main() { gl_Position = vec4( position, 1.0 ); }`;
                    let PRE_GRAPH_FRAGMENT = `uniform vec2 resolution;
uniform float time;

float lineJitter = 0.5;
float lineWidth = 7.0;
float gridWidth = 1.7;
float scale = 0.0013;
float zoom = 4.;
vec2 offset = vec2(0.5);

float function(in float x) {
  float y = 0.0;`;
        let POST_GRAPH_FRAGMENT = `\n  return y;
}

float rand (in float _x) {
    return fract(sin(_x)*1e4);
}

float rand (in vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}

float noise (in float _x) {
    float i = floor(_x);
    float f = fract(_x);
    float u = f * f * (3.0 - 2.0 * f);
    return mix(rand(i), rand(i + 1.0), u);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    // Four corners in 2D of a tile
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec3 plot2D(in vec2 _st, in float _width ) {
    const float samples = 3.0;

    vec2 steping = _width*vec2(scale)/samples;

    float count = 0.0;
    float mySamples = 0.0;
    for (float i = 0.0; i < samples; i++) {
        for (float j = 0.0;j < samples; j++) {
            if (i*i+j*j>samples*samples)
                continue;
            mySamples++;
            float ii = i + lineJitter*rand(vec2(_st.x+ i*steping.x,_st.y+ j*steping.y));
            float jj = j + lineJitter*rand(vec2(_st.y + i*steping.x,_st.x+ j*steping.y));
            float f = function(_st.x+ ii*steping.x)-(_st.y+ jj*steping.y);
            count += (f>0.) ? 1.0 : -1.0;
        }
    }
    vec3 color = vec3(1.0);
    if (abs(count)!=mySamples)
        color = vec3(abs(float(count))/float(mySamples));
    return color;
}

vec3 grid2D( in vec2 _st, in float _width ) {
    float axisDetail = _width*scale;
    if (abs(_st.x)<axisDetail || abs(_st.y)<axisDetail)
        return 1.0-vec3(0.65,0.65,1.0);
    if (abs(mod(_st.x,1.0))<axisDetail || abs(mod(_st.y,1.0))<axisDetail)
        return 1.0-vec3(0.80,0.80,1.0);
    if (abs(mod(_st.x,0.25))<axisDetail || abs(mod(_st.y,0.25))<axisDetail)
        return 1.0-vec3(0.95,0.95,1.0);
    return vec3(0.0);
}

void main(){
    vec2 st = (gl_FragCoord.xy/resolution.xy)-offset;
    st.x *= resolution.x/resolution.y;

    scale *= zoom;
    st *= zoom;

    vec3 color = plot2D(st,lineWidth);
    color -= grid2D(st,gridWidth);

    gl_FragColor = vec4(color,1.0);
}`;
                    init_3d();
                    animate();

                    function init_3d() {
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
                            fragmentShader: PRE_GRAPH_FRAGMENT + text_area.textContent + POST_GRAPH_FRAGMENT
                        });
                        mesh = new THREE.Mesh(geometry, material);
                        scene.add(mesh);
                        let canvas = document.createElement('canvas');
                        canvas.id = 'editor_canvas_' + i.toString();
                        canvas.width = 360;
                        canvas.height = 280;
                        renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});
                        renderer.setPixelRatio(window.devicePixelRatio);
                        editor.display.wrapper.parentNode.appendChild(renderer.domElement);
                        uniforms.resolution.value.x = renderer.domElement.width;
                        uniforms.resolution.value.y = renderer.domElement.height;

                        if (hasClass(text_area, 'outside')) {
                            addClass(renderer.domElement, 'previewOutside');
                        }
                        else if (hasClass(text_area, 'outsideLeft')) {
                            addClass(renderer.domElement, 'previewOutsideLeft');
                        }
                        else if (hasClass(text_area, 'inside')) {
                            addClass(renderer.domElement, 'previewInside');
                        }
                        else {
                            addClass(renderer.domElement, 'previewInside');
                        }

                        onWindowResize();
                        window.addEventListener('resize', onWindowResize, false);
                    }

                    function onWindowResize(event) {
                        // let previewFrame = document.getElementById('shader_preview_1');
                        // let preview = previewFrame.contentDocument ||  previewFrame.contentWindow.document;
                        //
                        // renderer.setSize(preview.body.offsetWidth, preview.body.offsetHeight);
                        uniforms.resolution.value.x = renderer.domElement.width;
                        uniforms.resolution.value.y = renderer.domElement.height;
                    }

                    function animate() {
                        requestAnimationFrame(animate);
                        render();
                    }

                    function render() {
                        uniforms.time.value += 0.02;
                        renderer.render(scene, camera);
                    }

                    editor.on("change", function() {
                        clearTimeout(delay);
                        delay = setTimeout(updatePreview(editor), 300);
                    });

                    let updatePreview = function(editor) {
                        material = new THREE.ShaderMaterial({
                            uniforms: material.uniforms,
                            vertexShader: material.vertexShader,
                            fragmentShader: PRE_GRAPH_FRAGMENT + editor.getValue() + POST_GRAPH_FRAGMENT
                        });
                        mesh.material = material;
                    }
                    setTimeout(updatePreview(editor), 300);
                }

                // fold
                if (hasClass(text_area, 'fold')) {
                    let lines = text_area.dataset.foldlines.split('#');
                    for (let j = 0; j < lines.length; j++) {
                        editor.foldCode(CodeMirror.Pos(parseInt(lines[j]), 0));
                    }
                }

                // mark
                if (hasClass(text_area, 'mark')) {
                    let lines = text_area.dataset.marklines.split('#');
                    for (let j = 0; j < lines.length; j++) {
                        let arr = lines[j].split('_');
                        editor.markText({line:parseInt(arr[0]), ch:parseInt(arr[1])},
                                        {line:parseInt(arr[2]), ch:parseInt(arr[3])},
                                        {className: "styled-background"});
                    }
                }

                // hidden
                if (hasClass(text_area, 'hidden')) {
                    editor.getWrapperElement().style.display = 'none';
                }

            }
        }
        else {
            window.requestAnimationFrame(init);
        }
    }

    function hasClass(el, className) {
        if (el.classList)
            return el.classList.contains(className)
        else
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
    }

    function addClass(el, className) {
        if (el.classList)
            el.classList.add(className)
        else if (!hasClass(el, className)) el.className += " " + className
    }

    function removeClass(el, className) {
        if (el.classList)
            el.classList.remove(className)
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
            el.className=el.className.replace(reg, ' ')
        }
    }

    function isInFullScreen() {
        return (document.fullscreenElement && document.fullscreenElement !== null) ||
                (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
                (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
                (document.msFullscreenElement && document.msFullscreenElement !== null);
    }

    // Enter fullscreen
    function enterFullScreen(canvas){
        if (canvas.RequestFullScreen) {
            canvas.RequestFullScreen();
        }
        else if (canvas.webkitRequestFullScreen) {
            canvas.webkitRequestFullScreen();
        }
        else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        }
        else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
        else {
            alert("This browser doesn't supporter fullscreen");
        }
    }

    // Exit fullscreen
    function exitFullScreen(){
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        else {
            alert("Exit fullscreen doesn't work");
        }
    }
})();
