---
title: (공사중) 강화학습 알아보기(1) - 가치 함수
date: 2019-02-10
lang: kr
ref: reinforcement-learning-first
tags:
- reinforcement-learning
interactive: true
gridworld: true
---

> ⚠️ 작성중인 글입니다. 최종 버전이 나올 때까지 내용이 계속 바뀔 수 있습니다.

&nbsp;
## 강화학습이란?

2016년에 있었던 [딥마인드의 알파고(AlphaGo)와 이세돌 9단의 대국](<https://deepmind.com/research/alphago/match-archive/alphago-games-korean/>)은 인공지능이 세계 최초로 프로 최고수급의 인간을 바둑에서 이긴 사건으로 화제가 되었습니다. 2018년에는 5대 5로 팀을 나눠 싸우는 협동 게임인 DOTA2 에서 [OpenAI 의 연구진이 정해진 영웅 조합으로 프로에 근접한 아마추어 팀을 이겼고](<https://blog.openai.com/openai-five/>), 2019년에는 딥마인드의 알파스타(AlphaStar)가 [스타크래프트2에서 같은 종족전(Protoss)으로 프로 최고수를 이기는 경기](<https://deepmind.com/blog/alphastar-mastering-real-time-strategy-game-starcraft-ii/>)를 선보였습니다. 이 놀라운 성과들은 인공지능의 한 갈래인 강화학습이 뒷받침하고 있습니다.

강화학습은 에이전트(agent)가 정해진 환경(environment) 속에서 현재의 상태(state)를 인식하고, 행동(action)을 통해 보상(reward)을 최대화하는 방향으로 학습하는 알고리즘입니다. 보상이 커지도록 하는 행동은 더 자주 하고, 보상을 줄이는 행동은 덜하게 됩니다.

이 과정에서 강화학습은 여러 번의 시도를 통해 실수를 하고, 그 실수를 교정하면서 점차 원하는 답을 찾아가게 됩니다. 단순화시켜서 말하면 _일단 해보고, 점차 고쳐나가는_ 방법이라고 할 수 있습니다.

![](<../images/rl_1.png>)
<small>[Sokoban Tileset by Kenney](<https://www.kenney.nl/assets/sokoban>)</small>

&nbsp;
## 이론적 배경

강화학습은 인간과 동물의 학습 방식에 큰 영향을 받았습니다.

20세기 초 미국의 심리학자인 에드워드 손다이크(Edward Thorndike)는 고양이를 이용한 실험을 통해서 효과 법칙(Law of effect)이라는 것을 주장했습니다. 고양이를 상자 안에 넣은 다음 바깥에 생선을 놓고, 레버를 터치해야만 상자에서 빠져나갈 수 있게 하자, 갇히는 횟수가 반복될수록 고양이가 레버를 점점 빠르게 터치해서 상자에서 빨리 빠져나가게 되었습니다. 효과 법칙은 이렇게 만족(생선)을 주는 행동(레버 터치)이 강화(reinforce)된다는 이론입니다.

![](<../images/rl_2.jpg>)
[이미지 링크](<https://en.wikipedia.org/wiki/Law_of_effect#/media/File:Puzzle_box.jpg>)

{% include youtubePlayer.html id='fanm--WyQJo' %}


딥마인드를 설립한 데미스 허사비스(Demis Hassabis)는 영국의 UCL 에서 인지신경과학 박사학위를 받았습니다. 인지신경과학은 인간의 뇌에서 일어나는 기억과 의사결정에 대한 학문으로, 인간의 행동을 이해하기 위한 학문입니다. 그는 2012년에 [앨런 튜링 탄생 100주년을 맞아 Nature에 실린 특별 기고문](<http://www.gatsby.ucl.ac.uk/~demis/TuringSpecialIssue%28Nature2012%29.pdf>)에서 블랙박스로 간주되어 동작원리를 알 필요가 없었던 것으로 간주되었던 인간의 뇌의 동작 원리를 알고리즘 수준까지 이해해야 더 발전된 인공지능을 만들 수 있을 것이라고 주장했습니다.

강화학습의 선구자인 리차드 서튼(Richard Sutton)과 앤드류 바르토(Andrew Barto)는 강화학습의 초기부터 효과적인 모델이었던 [시간차 학습 모델(Temporal difference model)을 동물의 학습 이론을 통해 설명](<https://www.cs.cmu.edu/afs/cs/academic/class/15883-f15/readings/sutton-1990.pdf>)했습니다. 시간차 학습 모델은 몬테카를로 모델과 더불어 가장 중요한 강화학습의 개념입니다. 이 두 가지에 대해서는 다음 글에서 차차 설명드리도록 하겠습니다.


&nbsp;
## Grid World

강화학습을 비롯한 인공지능에서는 오래 전부터 실제의 세계를 단순화시킨 Grid World 에서 문제를 풀어왔습니다. Grid World 는 2차원의 한정된 공간으로 격자(Grid) 위에 에이전트와 목표, 보상 등을 배치하고 다양한 알고리즘으로 문제를 풀어볼 수 있습니다.

<div>
<textarea class='codeeditor canvas hidden'>
let canvas = document.getElementById('editor_canvas_0');
let ctx = canvas.getContext('2d');
let env = new Env(6, canvas);
let agent = new Agent(env, 0, 0, canvas);
env.setEntity(agent, {'ball': 1}, [[5, 5]]);
env.draw();
agent.draw();

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 350 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Step(random action)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 350 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Loop(random action)';
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

button.onclick = function() {
    if (is_running) return;
    iterate(false);
}

button2.onclick = function() {
    if (is_running) return;
    is_running = true;
    iterate(true);
}

function iterate(is_loop = true) {
    let action = Math.floor(Math.random() * 4);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();


    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array, 195, 60);
        }

        agent.x = 0;
        agent.y = 0;
        agent.reward = 0;
        agent.dir = 3;

        env.episodes += 1;
        env.steps = 0;
        env.reset();

        while (true) {
            if (env.setEntity(agent, {'ball': 1}, [[5, 5]]) !== null) {
                break;
            }
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

여기에 Grid World 의 간단한 예시가 있습니다.[^n] 붉은색 세모(🔺)는 에이전트를 나타내며, 파란색 원(🔵)은 에이전트가 도달해야 하는 목표를 나타냅니다.

[^n]: Grid World 의 스타일은 [Maxime Chevalier-Boisvert 의 gym-minigrid](<https://github.com/maximecb/gym-minigrid>) 를 참고했습니다.

여기서는 에이전트가 주어진 시간(step) 내에 목표와 같은 격자에 도달하면 성공으로, 한 번의 실행(episode)이 끝나고 다음 실행이 시작됩니다. 목표에 도달하기 위해서 에이전트는 매 step 마다 현재 위치와 맞닿아 있는 4개의 격자(상하좌우)중 하나로 이동하는 행동(action)을 할 수 있습니다. 격자의 끝에서는 움직임이 제한됩니다(격자가 없는 곳으로 이동불가).

목표에 도달하면 +1 의 보상을 주고, 빠르게 보상을 찾는 행동에 인센티브를 부여하기 위해서 매 step 마다 -0.1 의 보상(페널티)을 줍니다. 강화학습의 에이전트는 보상을 최대화하는 쪽으로 행동하고 반대되는 행동은 덜하려고 하기 때문에 이런 세팅이 필요한 것입니다.

일단 Step(random action) 버튼을 누르면 에이전트가 한번의 행동을 수행하고, Loop(random action) 버튼을 누르면 전체 Episode 가 100 이 될 때까지 자동으로 행동을 수행합니다. 매 step 마다 에이전트는 가능한 행동 중 하나를 랜덤하게 선택합니다. 아직은 강화학습이 아닙니다. 에이전트는 공기 중의 분자처럼 무작위로 움직일 뿐입니다. 그러다 운이 좋으면 목표에 도달하기도 하지만, 그렇지 못하고 동떨어진 곳에서 episode 가 끝날 때도 많습니다.

에이전트가 목표를 잘 찾게 하려면 먼저 목표가 어디에 있는지 알아야 합니다. 즉 환경에 대한 상태(state) 정보를 알아야 합니다. 현재 Grid World 는 6x6, 총 36 개의 격자로 구성되어 있습니다. 초기 상태(initial state)에서 첫번째 칸(x=0, y=0)에는 에이전트가 위치하고, 마지막 칸(x=5, y=5)에는 목표가 위치합니다. 여기서 아래쪽으로 이동하는 행동을 한다면, 에이전트의 위치는 (x=0, y=1) 이 될 것입니다.

![](<../images/rl_3.png>)


&nbsp;
## 가치 함수

각 상태에 대한 가치 함수(value function)을 구해서 가장 가치가 높은 상태로 움직이는 방식으로 이 문제를 풀 수 있습니다. 가치 함수란 말 그대로 상태의 가치를 숫자로 표현한 것입니다. 아래 그림에서 Tic-tac-toe 게임 같은 경우 게임판에 아무 것도 놓이지 않은 상태에서는 가운데 칸의 가치가 0.7 로 가장 높다는 것을 알 수 있습니다.

![](<../images/rl_3_1.png>)
<small>[이미지 출처 링크](<https://medium.com/@carsten.friedrich/part-3-tabular-q-learning-a-tic-tac-toe-player-that-gets-better-and-better-fa4da4b0892a>)</small>

일단 문제를 거꾸로 생각해보겠습니다. 목표에 도달하기 바로 전인 (x=4, y=5) 에 에이전트가 위치할 때, 에이전트는 A, B, C 중 어디로 움직여야 할까요? 당연히 C 로 움직이는 것이 최적의 선택이 될 것입니다. C 로 움직이면 보상은 +1, A 나 B 로 움직이면 보상은 -0.1 이기 때문입니다.

![](<../images/rl_4.png>)
<small>그림 1</small>

이때 C 의 가치(value)는 A, B 보다 높을 수밖에 없습니다. 그럼 여기서 한 칸 떨어져 있는 위치에서는 어떨까요? 여기서도 당연히 C 가 제일 최적의 선택일 것입니다. 당장 다음 step 에서 받는 보상은 A, B, C 모두 -0.1 로 동일합니다. 그럼에도 C 를 선택하는 이유는 목표에 제일 가까운 위치이기 때문입니다. 즉 C 를 선택하면 다음에 얻을 수 있는 보상이 A 와 B 를 선택했을 때보다 훨씬 클 가능성이 있기 때문입니다.

![](<../images/rl_5.png>)
<small>그림 2</small>

그런데 그림 1의 C 와 그림 2의 C 는 같은 가치를 가지고 있을까요? 이런 경우는 어떨까요?

![](<../images/rl_6.png>)
<small>그림 3</small>

그림 3의 C 는 위의 그림 1, 2의 C 와 동일하게 높은 가치를 가지고 있을까요? 모든 것이 안정된 지금 예시의 Grid World 라면 그렇다고 말할 수도 있겠습니다. 하지만 step 을 진행할 때마다 일정 확률로 폭탄이 터진다면 어떨까요? 목표로 가는 길에 닿으면 -100 의 보상을 주는 방해 요소가 나타난다면? 그럼에도 C 로 가는 것이 일단 최적의 선택이기는 하지만, 바로 눈앞에 한 걸음만 내딛으면 보상이 있는 경우보다는 가치가 높다고 말할 수 없을 것 같습니다.

이런 경우를 설명하기 위해 감가율(discount rate)이 도입됩니다. 감가율이란 현재 받을 수 있는 보상이 미래에 받는 보상보다 가치가 높다는, 반대의 경우 **미래의 보상은 현재의 보상보다 가치가 낮다** 는 것을 의미하는 개념입니다. `0.0~1.0` 의 숫자로 표현되며, 보통 `0.95`, `0.99` 등의 값이 쓰입니다. 수학식에서는 $$\gamma$$(감마) 라는 기호로 표현합니다.

그럼 이 $$\gamma$$ 를 사용해서 가치 함수를 계산해보도록 하겠습니다. $$\gamma=0.9$$ 를 사용하겠습니다.

모든 상태에 대해서 가치 함수를 처음에는 0 으로 넣습니다. 다만 목표 격자는 도달하면 Episode 가 종료되는 상태이기 때문에 가치 함수를 보상과 같은 값으로 고정시켜서 넣습니다. 즉 목표 격자의 가치는 +1 이 됩니다.

<div>
<textarea class='codeeditor canvas hidden'>
let canvas = document.getElementById('editor_canvas_1');
let ctx = canvas.getContext('2d');
let env = new Env(6, canvas);
let agent = new Agent(env, 0, 0, canvas);
env.setEntity(agent, {'ball': 1}, [[5, 5]]);
env.draw();

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 350 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Get Value';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 350 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Get Value x10';
canvas.parentNode.appendChild(button2);

let button3 = document.createElement('button');
button3.style.position = 'absolute';
button3.style.top = (canvas.parentNode.offsetTop + 60).toString() + 'px';
button3.width = 350 - env.grid_W * env.grid_width - 30;
button3.style.left = (post.offsetLeft + post.offsetWidth - button3.width - 20).toString() + 'px';
button3.innerHTML = 'Loop(Value)';
canvas.parentNode.appendChild(button3);

let value_array = new Array(env.grid_W * env.grid_W).fill(0);
value_array[value_array.length - 1] = 1;
const gamma = 0.9;

drawValue();

function drawValue() {
    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    let x, y;
    for (let i = 0; i < value_array.length; i += 1) {
        ctx.beginPath();
        ctx.fillStyle = `rgb(0, ${Math.floor(value_array[i] * 255)}, 0)`;
        x = i % env.grid_W;
        y = Math.floor(i / env.grid_W);
        ctx.fillRect(x * env.grid_width, y * env.grid_width, env.grid_width, env.grid_width);
        ctx.closePath();
    }

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.font = '11px monospace';
    for (let i = 0; i < value_array.length; i += 1) {
        x = i % env.grid_W;
        y = Math.floor(i / env.grid_W);
        ctx.fillText(value_array[i], (x+0.1) * env.grid_width, (y+0.5) * env.grid_width);
    }
    ctx.closePath();

    env.drawOutline();
}

function value_iterate() {
    let new_value_array = value_array.slice();
    let x, y;
    let nx, ny;
    let new_value;
    for (let i = 0; i < value_array.length - 1; i += 1) {
        x = i % env.grid_W;
        y = Math.floor(i / env.grid_W);
        new_value = -Number.MAX_VALUE;
        for (let j = 0; j < dirs.length; j += 1) {
            nx = x + dirs[j][0];
            ny = y + dirs[j][1];
            if (nx >= 0 && nx < env.width &&
                ny >= 0 && ny < env.height) {
                new_value = Math.max(new_value, value_array[nx + ny * env.grid_W] * gamma);
            }
        }

        new_value_array[i] = new_value;
        new_value_array[i] = Math.max(0, new_value_array[i]);
        new_value_array[i] = Math.floor(new_value_array[i] * 100) / 100;
    }
    value_array = new_value_array;
}

button.onclick = function() {
    value_iterate();
    drawValue();
}

button2.onclick = function() {
    for (let i = 0; i < 10; i += 1) {
        value_iterate();
    }
    drawValue();
}

let is_running = false;
let rewards_array = [];

button3.onclick = function() {
    if (is_running) return;
    is_running = true;
    iterate(true);
}

function iterate(is_loop = true) {
    let values = [];
    let x, y, idx;
    for (let i = 0; i < dirs.length; i += 1) {
        x = agent.x + dirs[i][0];
        y = agent.y + dirs[i][1];
        if (x >= 0 && x < env.width &&
            y >= 0 && y < env.height) {
            idx = x + y * env.grid_W;
            values.push(value_array[idx]);
        }
        else {
            values.push(-Number.MAX_VALUE);
        }
    }

    // find max values
    const m = Math.max(...values);
    values = values.map((c,i) => c == m ? i : -1).filter(c => c >= 0);
    let action = values[Math.floor(Math.random() * values.length)];
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    drawValue();
    env.draw();
    agent.draw();


    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array, 195, 80);
        }

        agent.x = 0;
        agent.y = 0;
        agent.reward = 0;
        agent.dir = 3;

        env.episodes += 1;
        env.steps = 0;
        env.reset();

        while (true) {
            if (env.setEntity(agent, {'ball': 1}, [[5, 5]]) !== null) {
                break;
            }
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';

    button3.style.top = (canvas.parentNode.offsetTop + 60).toString() + 'px';
    button3.style.left = (post.offsetLeft + post.offsetWidth - button3.width - 50).toString() + 'px';
});</textarea>
</div>

이때 어떤 격자의 가치는 다음과 같은 수식으로 계산할 수 있습니다.

$$
V_{격자} = max(\gamma \times V_{이웃 격자})
$$

오른쪽의 Get Value 버튼을 누르면 가치를 한번 계산해서 값을 업데이트합니다. 목표 주변의 2개 격자에서 가치가 새로 계산된 것을 확인할 수 있습니다. Get Value 를 여러 번 누르면 시작지점까지 연쇄적으로 가치가 업데이트됩니다.

Loop(Value) 버튼을 누르면 에이전트는 현재 위치한 격자의 이웃 격자의 가치값을 비교해서 높은 값을 가진 격자로 움직입니다. 만약 모든 격자의 값이 같다면 랜덤한 위치로 이동합니다. Grid World 전체의 가치 함수가 계산된 상태라면 에이전트는 즉시 최적의 경로를 찾아냅니다.

![](<../images/rl_7.png>)
<small>가치가 계산된 초록색 영역에서 에이전트는 즉시 최적 경로를 찾아냅니다.</small>






Grid World 의 초기 상태를 아래처럼 36개의 문자열을 포함한 배열로 나타낼 수 있습니다.

```
['agent', 'empty', 'empty', 'empty', ..., 'empty', 'ball']
```

이대로는 너무 복잡해 보이기 때문에 각 문자열을 숫자로 치환합니다. `empty = 1, ball = 6, agent = 10` 으로 나타내면 아래와 같은 배열이 됩니다.

```
[10, 1, 1, 1, ..., 1, 6]
```

> ⚠️ 작성중인 글입니다. 최종 버전이 나올 때까지 내용이 계속 바뀔 수 있습니다.
