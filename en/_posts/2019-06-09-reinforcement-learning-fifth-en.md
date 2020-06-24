---
title: Learn Reinforcement Learning (5) - Solving problems with a door and a key
date: 2019-06-09
lang: en
ref: reinforcement-learning-fifth
tags:
- reinforcement-learning
interactive: true
gridworld: true
chartjs: true
---

In the [previous article](<https://greentec.github.io/reinforcement-learning-fourth-en/>), we looked at the Actor-Critic, A2C, and A3C algorithms for solving the `ball-find-3` problem in Grid World and did an action visualization to see how the agent interpreted the environment. A3C was a high-performance algorithm with a simple idea of using multiple agents instead of a single agent. This time, let's try the A3C algorithm to solve other problems out of `ball-find-3` that we have been solving so far.

&nbsp;
## `two-room` problem

The `ball-find-3` problem from the second to the fourth article in this series was basically an issue where agents had to find three balls in an empty 8x8 Grid. Empty means that there are no constraints on agent behavior. At the end of the environment it can no longer move, but if it is not, it can move freely anywhere.

This `two-room` problem divides the 8x8 Grid into horizontally or vertically extending walls, so there are two rooms in the environment. Because the wall contains one space, the agent can use this passage to move between the two rooms. There is one ball in the environment, and this ball is placed in a room other than the room with the agent. Therefore, the agent must be able to move to the room where the ball is located in order to acquire the ball. If the ball is acquired, the episode ends, the ball's reward is +3, and the global reward is -0.1 to facilitate learning.

![](<../images/rl5_0.png>)
<small>Figure 1. Agent and ball are placed in different rooms. The agent should learn how to pass through the aisle as little as possible against the wall.</small>

Like `ball-find-3`, the agent only has visibility for a limited space of 7x7 around itself. When the agent moves toward the wall, the agent's behavior is invalidated. It is the same as if it did not move in place. Therefore, the agent must acquire the target ball within the minimum time to get the global reward of -0.1 to the minimum, and it is necessary to learn how to pass through the passage as little as possible against the wall.

Random actions will be very inefficient especially within these wall constraints. Recent challenges in Reinforcement Learning present a difficult problem where agents with random actions rarely score.[^1] Montezuma's Revenge, rated as the hardest game in the Atari game, is difficult to score even with a DQN.[^2]

[^1]: One of the [CoG 2019](<http://ieee-cog.org/>) [competitions](<http://ieee-cog.org/competitions_conference/>), [Bot Bowl I](<https://bot-bowl.com/>), is based on the Warhammer franchise's [Blood Bowl](<https://store.steampowered.com/app/236690/Blood_Bowl_2/>), an interpretation of football as a turn-based game. They've played 350,000 games with a random action agent, but it's a tough one to score. [Paper Link](<https://njustesen.github.io/njustesen/publications/justesen2018blood.pdf>)

![](<../images/rl5_1.gif>)
<small>Figure 2. If you try to play Montezuma's multiplayer game as a random agent, you will not get enough points. [Source Link](<https://openai.com/blog/learning-montezumas-revenge-from-a-single-demonstration/>)</small>

[^2]: Deepmind and OpenAI announced several new ways to unlock Montezuma's multiplayer game in 2018 ([Single Demonstration](<https://openai.com/blog/learning-montezumas-revenge-from-a-single-demonstration/>), [RND](<https://openai.com/blog/reinforcement-learning-with-prediction-based-rewards/>), [watching Youtube](<https://arxiv.org/abs/1805.11592v1>)).

Here we will use the A2C algorithm, which has performed well in `ball-find-3`, to learn the agent.


<div>
<textarea class='codeeditor canvas hidden'>
let global_step = 0;
let canvas = document.getElementById('editor_canvas_0');
canvas.width = 410;
canvas.height = 310;
removeClass(canvas, 'previewOutside');
addClass(canvas, 'previewOutside_410');
let ctx = canvas.getContext('2d');
let env = new Env(8, canvas);
env.maxEpisodes = 2000;
const title = 'A2C';
ctx.beginPath();
ctx.fillStyle = 'lightcyan';
ctx.font = '11px monospace';
ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
ctx.closePath();
let agent = new ActorCriticAgent(env, Math.floor(Math.random() * env.grid_W), Math.floor(Math.random() * env.grid_W), canvas);
agent.ball_count = 1;
agent.vision = true;
env.setEntityWithWall(agent, {'ball': 1});
env.draw();
agent.draw();
let ball_get_count = 0;

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 410 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Learn(A2C)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 410 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Run(A2C)';
button2.disabled = true;
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

let epsilon = 1.0;
let epsilon_min = 0.01;
let epsilon_multiply = 0.9999;

button.onclick = function() {
    if (is_running) return;
    is_running = true;
    iterate(true);
}

button2.onclick = function() {
    if (is_running) {
        // PAUSE
        is_running = false;

        button2.innerHTML = 'Run(A2C)';
    }
    else {
        is_running = true;
        env.maxEpisodes += 1;

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;

        // env.episodes += 1;
        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1}) !== null) {
                break;
            }
        }

        run();

        button2.innerHTML = 'PAUSE';
    }
}

function getAction(agent, input) {
    // if (Math.random() < epsilon) {
    //     return Math.floor(Math.random() * 4);
    // }
    return tf.tidy(() => {
        let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]);
        const logits = agent.actor.predict(inputTensor);
        const actions = tf.multinomial(logits, 1, null, true);
        return actions.dataSync()[0];
    });
}

function getVision(agent) {
    let top, left;
    left = agent.x - agent.visionForward;
    top = agent.y - agent.visionForward;
    let s = [];

    for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
        for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
            if (x >= 0 && x < env.width &&
                y >= 0 && y < env.height) {
                if (env.grid[y][x].length > 0) {
                    s.push(object_to_idx[env.grid[y][x][0].type]);
                }
                else {
                    s.push(object_to_idx['empty']);
                }
            }
            else {
                s.push(object_to_idx['unseen']);
            }
        }
    }

    return s;
}

function run(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

async function iterate(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));
    const next_state = getVision(agent);
    await agent.train_model(state, action, reward, next_state, done);

    // epsilon_decay
    if (epsilon > epsilon_min) {
        epsilon = epsilon * epsilon_multiply;
        epsilon = Math.floor(epsilon * 10000) / 10000;
    }

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        env.episodes += 1;
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            if (agent.ball_count === 0) {
                ball_get_count += 1;
            }

            ctx.beginPath();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText(`ball: ${ball_get_count}/${env.episodes} (${Math.floor(ball_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.font = '14px monospace';
            ctx.fillText(`epsilon: ${epsilon}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 40);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;


        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1}) !== null) {
                break;
            }
        }
    }
    if (is_running && is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
    else {
        button.disabled = true;
        button2.disabled = false;
        is_running = false;
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

Press the Learn (A2C) button to learn the agent. If you go up to 2,000 episodes, the average reward is around `-8` to `-12`. If you go further, you get a high reward of `-2` to `-4`.

I also showed how many episodes were completed before reaching the maxStep of 200, the number of times the ball was acquired, and the success rate for all trials. At the beginning, it is almost impossible to complete, but if you go up to 2,000 episodes, you'll get about 40-50%. If you go up to 10,000 episodes, you'll see a success rate of about 70%.

Now, if you continue reading this series, you expect that performance will be better than A2C if you run A3C in the same environment. Attached below are the results of A2C and A3C.

![](<../images/rl5_2.png>)
<small>Figure 3. Comparison of A2C and A3C performance for `two-room` problems</small>

Since the agent learns based on uncertain information, the average reward graph on the left has a large fluctuation. In the average reward, the difference between A2C and A3C is not big, but the success rate[^3] on the right side is higher than that of A3C.

[^3]: (Number of episodes that acquired the ball before passing maxStep) / (total number of episodes) * 100


&nbsp;
## A3C's `two-room` action visualization

In a `two-room` problem, we can try to visualize the action to see how the agent interprets the environment. The A3C algorithm using 16 agents in the local environment was learned for 50,000 episodes.

<div>
<textarea class='codeeditor canvas hidden'>
let global_step = 0;
let canvas = document.getElementById('editor_canvas_1');
canvas.width = 410;
canvas.height = 330;
removeClass(canvas, 'previewOutside');
addClass(canvas, 'previewOutside_410_330');
let ctx = canvas.getContext('2d');
let env = new Env(8, canvas);
env.maxEpisodes = 2000;
const title = 'A3C (16 agents)';
ctx.beginPath();
ctx.fillStyle = 'lightcyan';
ctx.font = '11px monospace';
ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
ctx.closePath();
let agent = new ActorCriticAgent(env, Math.floor(Math.random() * env.grid_W), Math.floor(Math.random() * env.grid_W), canvas);
agent.ball_count = 1;
agent.vision = true;
env.setEntityWithWall(agent, {'ball': 1});
env.draw();
agent.draw();
let ball_get_count = 0;

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 410 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Load Model(A3C)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 410 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Run(A3C)';
button2.disabled = true;
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

let epsilon = 0.3;
let epsilon_min = 0.0;
let epsilon_multiply = 0.99;

const prob_arrow_string = ['→','↓','←','↑'];

button.onclick = async function() {
    // if (is_running) return;
    // is_running = true;
    // iterate(true);
    const actor_model = await tf.loadModel(
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_grid_8_ball_1_50000_a3c_agent_16_actor/model.json',
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_grid_8_ball_1_50000_a3c_agent_16_actor/weights.bin'
    );
    agent.actor = actor_model;
    console.log('actor model is loaded.');

    const critic_model = await tf.loadModel(
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_grid_8_ball_1_50000_a3c_agent_16_critic/model.json',
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_grid_8_ball_1_50000_a3c_agent_16_critic/weights.bin'
    );
    agent.critic = critic_model;
    console.log('critic model is loaded.');

    button.disabled = true;
    button2.disabled = false;
}

button2.onclick = function() {
    if (is_running) {
        // PAUSE
        is_running = false;

        button2.innerHTML = 'Run(A3C)';
    }
    else {
        is_running = true;

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;

        // env.episodes += 1;
        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1}) !== null) {
                break;
            }
        }

        run();

        button2.innerHTML = 'PAUSE';
    }
}

function getAction(agent, input) {
    // if (Math.random() < epsilon) {
    //     return Math.floor(Math.random() * 4);
    // }
    return tf.tidy(() => {
        let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]);
        const logits = agent.actor.predict(inputTensor);
        const actions = tf.multinomial(logits, 1, null, true);
        return actions.dataSync()[0];
    });
}

function getVision(agent) {
    let top, left;
    left = agent.x - agent.visionForward;
    top = agent.y - agent.visionForward;
    let s = [];

    for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
        for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
            if (x >= 0 && x < env.width &&
                y >= 0 && y < env.height) {
                if (env.grid[y][x].length > 0) {
                    s.push(object_to_idx[env.grid[y][x][0].type]);
                }
                else {
                    s.push(object_to_idx['empty']);
                }
            }
            else {
                s.push(object_to_idx['unseen']);
            }
        }
    }

    return s;
}

function run(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

async function iterate(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));
    const next_state = getVision(agent);
    // await agent.train_model(state, action, reward, next_state, done);

    let logits = null;
    tf.tidy(() => {
        const inputTensor = tf.tensor4d(next_state, [1, 7, 7, 1]);
        const logits_tensor = agent.actor.predict(inputTensor);
        logits = logits_tensor.dataSync();
    });

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    // draw action
    // console.log(logits);
    let prob_string = '';
    for (let i = 0; i < logits.length; i += 1) {
        // arrow
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(0,255,0)';
        ctx.moveTo((agent.x + 0.5) * env.grid_width, (agent.y + 0.5) * env.grid_width);
        ctx.lineTo(
            (agent.x + 0.5) * env.grid_width + logits[i] * dirs[i][0] * env.grid_width * 0.8,
            (agent.y + 0.5) * env.grid_width + logits[i] * dirs[i][1] * env.grid_width * 0.8
        );
        ctx.stroke();
        ctx.closePath();

        prob_string += prob_arrow_string[i] + `${Math.floor(logits[i] * 1000) / 10}%` + ' ';
    }

    // prob text
    ctx.beginPath();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.fillText(
        prob_string,
        10,
        env.grid_W * env.grid_width + 80
    );    
    ctx.closePath();

    ctx.lineWidth = 1;

    if (done || env.steps >= env.maxSteps) {
        env.episodes += 1;

        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            if (agent.ball_count === 0) {
                ball_get_count += 1;
            }

            ctx.beginPath();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText(`ball: ${ball_get_count}/${env.episodes} (${Math.floor(ball_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 20);
            ctx.closePath();

            // ctx.beginPath();
            // ctx.fillStyle = 'white';
            // ctx.font = '14px monospace';
            // ctx.fillText(`epsilon: ${epsilon}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 40);
            // ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;

        env.steps = 0;
        env.reset();

        // epsilon_decay
        // if (epsilon > epsilon_min) {
        //     epsilon = epsilon * epsilon_multiply;
        //     epsilon = Math.floor(epsilon * 10000) / 10000;
        // }

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1}) !== null) {
                break;
            }
        }
    }
    if (is_running && is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
    else {
        button.disabled = true;
        button2.disabled = false;
        is_running = false;
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

The network had a cumulative success rate of 79.1% when running up to 50,000 episodes. Press the Load Model (A3C) button to load the network weights, and press the RUN (A3C) button to move the agent. When you run 2,000 episodes, the success rate is 80% to 85%.

![](<../images/rl5_4.png>)
<small>Figure 4. The probability that the agent chooses to move the pathway is very high (94.4%) when it is necessary to acquire the ball in another room through the passage.</small>

![](<../images/rl5_5.png>)
<small>Figure 5. Even if there is no ball in the agent's field of view, it can be seen that when the wall enters the field of view, there is a high probability of moving to pass through the passage.</small>

![](<../images/rl5_6.png>)
<small>Figure 6. If the path is in the opposite direction to the ball while the agent's field of view is limited, the search may fail due to the tendency to approach the ball.</small>

Agents will succeed if they are over 80%, but they will also fail if the path and ball are too far away or in the opposite direction. As I mentioned last time, this section will be improved by adding memory to the agent to remember past information.


&nbsp;
## `two-room-door-key` problem

Think about the `two-room-door-key` problem that added slightly more difficult conditions to the `two-room` problem that was solved above.

In the `two-room-door-key problem`, two rooms are connected by a firmly closed door instead of an empty space, the door is only opened by a key, and the key is in the same room as the agent. When agent get the key, agent get reward +1, when agent open the door with the key, agent get reward +1, when agent get the ball, agent get reward +1. The condition that the target ball is in a different room from the agent and -0.1 given by the global reward are the same.

![](<../images/rl5_3.gif>)
<small>Figure 7. Without the key, the agent can not pass through the door.<small>

The first thing an agent needs to do is find a key. You must move to the next door, open the door, move to the other room, find the ball and acquire it, the episode ends successfully. Because two conditions are added at once, the difficulty level of the problem is expected to increase. Again, let's test the performance with A2C.


<div>
<textarea class='codeeditor canvas hidden'>
let global_step = 0;
let canvas = document.getElementById('editor_canvas_2');
canvas.width = 410;
canvas.height = 310;
removeClass(canvas, 'previewOutside');
addClass(canvas, 'previewOutside_410');
let ctx = canvas.getContext('2d');
let env = new Env(8, canvas);
env.maxEpisodes = 2000;
const title = 'A2C';
ctx.beginPath();
ctx.fillStyle = 'lightcyan';
ctx.font = '11px monospace';
ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
ctx.closePath();
let agent = new ActorCriticAgent(env, Math.floor(Math.random() * env.grid_W), Math.floor(Math.random() * env.grid_W), canvas);
agent.ball_count = 1;
agent.door_count = 1;
agent.vision = true;
agent.key = false;
env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1});
env.draw();
agent.draw();
let ball_get_count = 0;
let door_get_count = 0;
let key_get_count = 0;

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 410 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Learn(A2C)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 410 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Run(A2C)';
button2.disabled = true;
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

let epsilon = 1.0;
let epsilon_min = 0.01;
let epsilon_multiply = 0.9999;

button.onclick = function() {
    if (is_running) return;
    is_running = true;
    iterate(true);
}

button2.onclick = function() {
    if (is_running) {
        // PAUSE
        is_running = false;

        button2.innerHTML = 'Run(A2C)';
    }
    else {
        is_running = true;
        env.maxEpisodes += 1;

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;

        // env.episodes += 1;
        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }

        run();

        button2.innerHTML = 'PAUSE';
    }
}

function getAction(agent, input) {
    // if (Math.random() < epsilon) {
    //     return Math.floor(Math.random() * 4);
    // }
    return tf.tidy(() => {
        let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]);
        const logits = agent.actor.predict(inputTensor);
        const actions = tf.multinomial(logits, 1, null, true);
        return actions.dataSync()[0];
    });
}

function getVision(agent) {
    let top, left;
    left = agent.x - agent.visionForward;
    top = agent.y - agent.visionForward;
    let s = [];

    for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
        for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
            if (x >= 0 && x < env.width &&
                y >= 0 && y < env.height) {
                if (env.grid[y][x].length > 0) {
                    s.push(object_to_idx[env.grid[y][x][0].type]);
                }
                else {
                    s.push(object_to_idx['empty']);
                }
            }
            else {
                s.push(object_to_idx['unseen']);
            }
        }
    }

    return s;
}

function run(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

async function iterate(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));
    const next_state = getVision(agent);
    await agent.train_model(state, action, reward, next_state, done);

    // epsilon_decay
    if (epsilon > epsilon_min) {
        epsilon = epsilon * epsilon_multiply;
        epsilon = Math.floor(epsilon * 10000) / 10000;
    }

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        env.episodes += 1;
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            if (agent.ball_count === 0) {
                ball_get_count += 1;
            }
            if (agent.door_count === 0) {
                door_get_count += 1;
            }
            if (agent.key === true) {
                key_get_count += 1;
            }

            ctx.beginPath();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText(`ball: ${ball_get_count}/${env.episodes} (${Math.floor(ball_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width - 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`door: ${door_get_count}/${env.episodes} (${Math.floor(door_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`key: ${key_get_count}/${env.episodes} (${Math.floor(key_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.font = '14px monospace';
            ctx.fillText(`epsilon: ${epsilon}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 40);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;


        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        agent.door_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }
    }
    if (is_running && is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
    else {
        button.disabled = true;
        button2.disabled = false;
        is_running = false;
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

You can also learn the agent by pressing the Learn (A2C) button. However, I thought it was a difficult problem compared to the `two-room`, but if you study up to 2,000 episodes, you can see that the probability of acquiring a ball is higher.

This is probably due to the fact that the agents in this issue have more clues to make judgments in the context of basing decisions based on uncertain information. Learning to reward the action of having to go to the door if there is a door rather than just having a wall and empty space seems to help agent win the ball in the other room as a result.

Here again, let's compare the A2C with the performance using the A3C algorithm.

![](<../images/rl5_13.png>)
<small>Figure 8. Comparison of A2C and A3C performance for `two-room-door-key` problem</small>

Compared to the `two-room` problem, A3C's average reward and success rate are better than A2C. With 10,000 episodes, the A3C algorithm will exceed 70% success rate. I have experimented locally and found that the success rate is steadily rising even when learning up to 50,000 episodes.


&nbsp;
## A3C's `two-room-door-key` action visualization

You can do action visualization to see how the agent interprets the environment in a `two-room-door-key` problem. In the local environment, the A3C algorithm using 16 agents was learned for 36,500 episodes.

<div>
<textarea class='codeeditor canvas hidden'>
let global_step = 0;
let canvas = document.getElementById('editor_canvas_3');
canvas.width = 410;
canvas.height = 330;
removeClass(canvas, 'previewOutside');
addClass(canvas, 'previewOutside_410_330');
let ctx = canvas.getContext('2d');
let env = new Env(8, canvas);
env.maxEpisodes = 2000;
const title = 'A3C (16 agents)';
ctx.beginPath();
ctx.fillStyle = 'lightcyan';
ctx.font = '11px monospace';
ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
ctx.closePath();
let agent = new ActorCriticAgent(env, Math.floor(Math.random() * env.grid_W), Math.floor(Math.random() * env.grid_W), canvas);
agent.ball_count = 1;
agent.door_count = 1;
agent.vision = true;
agent.key = false;
env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1});
env.draw();
agent.draw();
let ball_get_count = 0;
let door_get_count = 0;
let key_get_count = 0;

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 410 - env.grid_W * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Load Model(A3C)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 410 - env.grid_W * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Run(A3C)';
button2.disabled = true;
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

let epsilon = 0.3;
let epsilon_min = 0.0;
let epsilon_multiply = 0.99;

const prob_arrow_string = ['→','↓','←','↑'];

button.onclick = async function() {
    // if (is_running) return;
    // is_running = true;
    // iterate(true);
    const actor_model = await tf.loadModel(
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_doorkey_grid_8_ball_1_36500_agent_16_actor/model.json',
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_doorkey_grid_8_ball_1_36500_agent_16_actor/weights.bin'
    );
    agent.actor = actor_model;
    console.log('actor model is loaded.');

    const critic_model = await tf.loadModel(
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_doorkey_grid_8_ball_1_36500_agent_16_critic/model.json',
        'https://raw.githubusercontent.com/greentec/greentec.github.io/master/public/other/weights/tworoom_doorkey_grid_8_ball_1_36500_agent_16_critic/weights.bin'
    );
    agent.critic = critic_model;
    console.log('critic model is loaded.');

    button.disabled = true;
    button2.disabled = false;
}

button2.onclick = function() {
    if (is_running) {
        // PAUSE
        is_running = false;

        button2.innerHTML = 'Run(A3C)';
    }
    else {
        is_running = true;

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;

        // env.episodes += 1;
        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }

        run();

        button2.innerHTML = 'PAUSE';
    }
}

function getAction(agent, input) {
    // if (Math.random() < epsilon) {
    //     return Math.floor(Math.random() * 4);
    // }
    return tf.tidy(() => {
        let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]);
        const logits = agent.actor.predict(inputTensor);
        const actions = tf.multinomial(logits, 1, null, true);
        return actions.dataSync()[0];
    });
}

function getVision(agent) {
    let top, left;
    left = agent.x - agent.visionForward;
    top = agent.y - agent.visionForward;
    let s = [];

    for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
        for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
            if (x >= 0 && x < env.width &&
                y >= 0 && y < env.height) {
                if (env.grid[y][x].length > 0) {
                    s.push(object_to_idx[env.grid[y][x][0].type]);
                }
                else {
                    s.push(object_to_idx['empty']);
                }
            }
            else {
                s.push(object_to_idx['unseen']);
            }
        }
    }

    return s;
}

function run(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

async function iterate(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));
    const next_state = getVision(agent);
    // await agent.train_model(state, action, reward, next_state, done);

    let logits = null;
    tf.tidy(() => {
        const inputTensor = tf.tensor4d(next_state, [1, 7, 7, 1]);
        const logits_tensor = agent.actor.predict(inputTensor);
        logits = logits_tensor.dataSync();
    });

    ctx.clearRect(0, 0, env.grid_W * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    // draw action
    // console.log(logits);
    let prob_string = '';
    for (let i = 0; i < logits.length; i += 1) {
        // arrow
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(0,255,0)';
        ctx.moveTo((agent.x + 0.5) * env.grid_width, (agent.y + 0.5) * env.grid_width);
        ctx.lineTo(
            (agent.x + 0.5) * env.grid_width + logits[i] * dirs[i][0] * env.grid_width * 0.8,
            (agent.y + 0.5) * env.grid_width + logits[i] * dirs[i][1] * env.grid_width * 0.8
        );
        ctx.stroke();
        ctx.closePath();

        prob_string += prob_arrow_string[i] + `${Math.floor(logits[i] * 1000) / 10}%` + ' ';
    }

    // prob text
    ctx.beginPath();
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.fillText(
        prob_string,
        10,
        env.grid_W * env.grid_width + 80
    );    
    ctx.closePath();

    ctx.lineWidth = 1;

    if (done || env.steps >= env.maxSteps) {
        env.episodes += 1;

        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W * env.grid_width + 10, 10);
            ctx.closePath();

            if (agent.ball_count === 0) {
                ball_get_count += 1;
            }
            if (agent.door_count === 0) {
                door_get_count += 1;
            }
            if (agent.key === true) {
                key_get_count += 1;
            }

            ctx.beginPath();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText(`ball: ${ball_get_count}/${env.episodes} (${Math.floor(ball_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width - 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`door: ${door_get_count}/${env.episodes} (${Math.floor(door_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`key: ${key_get_count}/${env.episodes} (${Math.floor(key_get_count/env.episodes*1000)/10}%)`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 20);
            ctx.closePath();

            // ctx.beginPath();
            // ctx.fillStyle = 'white';
            // ctx.font = '14px monospace';
            // ctx.fillText(`epsilon: ${epsilon}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 40);
            // ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W * env.grid_width + 20, env.grid_W * env.grid_width + 60);
            ctx.closePath();
        }

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;

        env.steps = 0;
        env.reset();

        // epsilon_decay
        // if (epsilon > epsilon_min) {
        //     epsilon = epsilon * epsilon_multiply;
        //     epsilon = Math.floor(epsilon * 10000) / 10000;
        // }

        agent.ball_count = 1;
        agent.door_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }
    }
    if (is_running && is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
    else {
        button.disabled = true;
        button2.disabled = false;
        is_running = false;
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

The network reached a cumulative success rate of 73% when running up to 36,500 episodes. The probability of passing the door was 88.7%, and the probability of obtaining the key was 94.2%.

The learned agent successfully completes the episode in the order of key acquisition → door traversal → ball acquisition, but in the situation where the key has not yet been acquired as shown in Figure 10, it can be confirmed that the agent tends to point toward the door unconditionally. This is because the agent does not store the key acquisition into memory or input. It is expected to be improved if you add key acquisition status of the agent to the input or store the information of the previous step in memory.

![](<../images/rl5_6_1.png>)
<small>Figure 9. The agent has a tendency to acquire the key first if it is close to the key.</small>

![](<../images/rl5_7.png>)
<small>Figure 10. Since key acquisition is not stored in memory or input, an error is generated to the door without key.</small>


&nbsp;
## Curriculum Learning

Curriculum Learning is based on a [paper](<https://dl.acm.org/citation.cfm?id=1553380>) published in 2009 by Professor Yoshua Bengio and co-recipient of the [2018 Turing Prize](<https://awards.acm.org/about/2018-turing>). It is argued that the efficiency of learning increases when the samples necessary for learning are presented in order of difficulty. Experimental results such as geometric shape recognition and language modeling have shown that this method of learning can be generalized.

Recently, deep learning and reinforcement learning have attracted attention, and curriculum learning, which improves general learning methods, is attracting attention as well. Curriculum learning is also available for Grid World, which is a common practice.

![](<../images/rl5_12.png>)
<small>Figure 11. It presents easy problems first so that agent do not get to see a lot of difficult problems when your network is not ready.</small>

The agent has to solve `two-room-door-key`, and the learning environment is randomly presented from 6x6 to the existing 8x8 grid. As learning progresses, larger environments are presented frequently. The larger the environment, the smaller the area the agent can see at one time than the entire environment, which makes the agent difficult to unravel.

Since A3C's online learning takes a long time, I will try learning with A2C here. The percentage of environments presented at each learning stage is shown in Figure 12.

![](<../images/rl5_8.png>)
<small>Figure 12. A2C Percentage of environment presented in the learning phase</small>


<div>
<textarea class='codeeditor canvas hidden'>
let global_step = 0;
let canvas = document.getElementById('editor_canvas_4');
canvas.width = 410;
canvas.height = 310;
removeClass(canvas, 'previewOutside');
addClass(canvas, 'previewOutside_410');
let ctx = canvas.getContext('2d');
let env = new Env(6, canvas);
env.maxEpisodes = 2000;
const title = 'A2C, Curriculum Learning';
ctx.beginPath();
ctx.fillStyle = 'lightcyan';
ctx.font = '11px monospace';
ctx.fillText(title, env.grid_W_max * env.grid_width + 10, 10);
ctx.closePath();
let agent = new ActorCriticAgent(env, Math.floor(Math.random() * env.grid_W), Math.floor(Math.random() * env.grid_W), canvas);
agent.ball_count = 1;
agent.door_count = 1;
agent.vision = true;
agent.key = false;
env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1});
env.draw();
agent.draw();
let ball_get_count = 0;
let ball_get_count_8 = 0;
let ball_get_count_7 = 0;
let ball_get_count_6 = 0;
let total_episode_8 = 0;
let total_episode_7 = 0;
let total_episode_6 = 0;
let door_get_count = 0;
let key_get_count = 0;
let grid_prob = {
    'early':[6,6,6,6,6,6,7,7,7,8],
    'middle':[6,6,6,7,7,7,7,7,8,8],
    'late':[6,7,7,7,8,8,8,8,8,8]
}

const post = document.getElementsByClassName('post')[0];
let button = document.createElement('button');
button.style.position = 'absolute';
button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
button.width = 410 - env.grid_W_max * env.grid_width - 30;
button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 20).toString() + 'px';
button.innerHTML = 'Learn(A2C)';
canvas.parentNode.appendChild(button);

let button2 = document.createElement('button');
button2.style.position = 'absolute';
button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
button2.width = 410 - env.grid_W_max * env.grid_width - 30;
button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 20).toString() + 'px';
button2.innerHTML = 'Run(A2C)';
button2.disabled = true;
canvas.parentNode.appendChild(button2);

let is_running = false;
let rewards_array = [];

let epsilon = 1.0;
let epsilon_min = 0.01;
let epsilon_multiply = 0.9999;

button.onclick = function() {
    if (is_running) return;
    is_running = true;
    iterate(true);
}

button2.onclick = function() {
    if (is_running) {
        // PAUSE
        is_running = false;

        button2.innerHTML = 'Run(A2C)';
    }
    else {
        is_running = true;
        env.maxEpisodes += 1;

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;

        // env.episodes += 1;
        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }

        run();

        button2.innerHTML = 'PAUSE';
    }
}

function getAction(agent, input) {
    // if (Math.random() < epsilon) {
    //     return Math.floor(Math.random() * 4);
    // }
    return tf.tidy(() => {
        let inputTensor = tf.tensor4d(input, [1, 7, 7, 1]);
        const logits = agent.actor.predict(inputTensor);
        const actions = tf.multinomial(logits, 1, null, true);
        return actions.dataSync()[0];
    });
}

function getVision(agent) {
    let top, left;
    left = agent.x - agent.visionForward;
    top = agent.y - agent.visionForward;
    let s = [];

    for (let y = top; y < top + agent.visionForward * 2 + 1; y += 1) {
        for (let x = left; x < left + agent.visionForward * 2 + 1; x += 1) {
            if (x >= 0 && x < env.width &&
                y >= 0 && y < env.height) {
                if (env.grid[y][x].length > 0) {
                    s.push(object_to_idx[env.grid[y][x][0].type]);
                }
                else {
                    s.push(object_to_idx['empty']);
                }
            }
            else {
                s.push(object_to_idx['unseen']);
            }
        }
    }

    return s;
}

function run(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));

    ctx.clearRect(0, 0, env.grid_W_max * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W_max * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W_max * env.grid_width + 10, 10);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width + 60);
            ctx.closePath();
        }
    }
    if (is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
}

async function iterate(is_loop = true) {
    const state = getVision(agent);
    const action = getAction(agent, state);
    let reward, done;
    [reward, done] = agent.step(action);
    agent.reward += reward;
    agent.reward = parseFloat((agent.reward).toFixed(2));
    const next_state = getVision(agent);
    await agent.train_model(state, action, reward, next_state, done);

    // epsilon_decay
    if (epsilon > epsilon_min) {
        epsilon = epsilon * epsilon_multiply;
        epsilon = Math.floor(epsilon * 10000) / 10000;
    }

    ctx.clearRect(0, 0, env.grid_W_max * env.grid_width + 10, canvas.height);

    env.steps += 1;
    env.draw();
    agent.draw();

    if (done || env.steps >= env.maxSteps) {
        env.episodes += 1;
        if (env.grid_W === 8) {
            total_episode_8 += 1;
        }
        else if (env.grid_W === 7) {
            total_episode_7 += 1;
        }
        else if (env.grid_W === 6) {
            total_episode_6 += 1;
        }

        rewards_array.push(Math.floor(agent.reward * 10) / 10);
        if (rewards_array.length > 1) {
            ctx.clearRect(env.grid_W_max * env.grid_width + 10, 0, canvas.width, canvas.height);
            env.drawRewardGraph(rewards_array.slice(rewards_array.length - 100), 255, 70);

            ctx.beginPath();
            ctx.fillStyle = 'lightcyan';
            ctx.font = '11px monospace';
            ctx.fillText(title, env.grid_W_max * env.grid_width + 10, 10);
            ctx.closePath();

            if (agent.ball_count === 0) {
                if (env.grid_W === 6) {
                    ball_get_count_6 += 1;
                }
                else if (env.grid_W === 7) {
                    ball_get_count_7 += 1;
                }
                else if (env.grid_W === 8) {
                    ball_get_count_8 += 1;
                }
                ball_get_count += 1;
            }
            if (agent.door_count === 0) {
                door_get_count += 1;
            }
            if (agent.key === true) {
                key_get_count += 1;
            }

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`6x6: ${ball_get_count_6}/${total_episode_6} (${Math.floor(ball_get_count_6/total_episode_6*1000)/10}%)`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width - 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#8650c4';
            ctx.font = '14px monospace';
            ctx.fillText(`7x7: ${ball_get_count_7}/${total_episode_7} (${Math.floor(ball_get_count_7/total_episode_7*1000)/10}%)`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText(`8x8: ${ball_get_count_8}/${total_episode_8} (${Math.floor(ball_get_count_8/total_episode_8*1000)/10}%)`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width + 20);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.font = '14px monospace';
            ctx.fillText(`epsilon: ${epsilon}`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width + 40);
            ctx.closePath();

            ctx.beginPath();
            ctx.fillStyle = 'limegreen';
            ctx.font = '14px monospace';
            let avg = rewards_array.reduce((acc, cur) => acc+cur, 0) / rewards_array.length;
            ctx.fillText(`avg. reward: ${Math.floor(avg * 10) / 10}`, env.grid_W_max * env.grid_width + 20, env.grid_W_max * env.grid_width + 60);
            ctx.closePath();
        }


        if (env.episodes < env.maxEpisodes * 0.3) {
            // pass
            let w = grid_prob['early'][Math.floor(Math.random() * grid_prob['early'].length)];
            if (env.grid_W !== w) {
                env.initGrid(w, w);
                agent.env = env;
            }
        }
        else if (env.episodes < env.maxEpisodes * 0.6) {
            let w = grid_prob['middle'][Math.floor(Math.random() * grid_prob['middle'].length)];
            if (env.grid_W !== w) {
                env.initGrid(w, w);
                agent.env = env;
            }
        }
        else {
            let w = grid_prob['late'][Math.floor(Math.random() * grid_prob['late'].length)];
            if (env.grid_W !== w) {
                env.initGrid(w, w);
                agent.env = env;
            }
        }

        agent.x = Math.floor(Math.random() * env.grid_W);
        agent.y = Math.floor(Math.random() * env.grid_W);
        agent.reward = 0;
        agent.dir = 3;
        agent.key = false;


        env.steps = 0;
        env.reset();

        agent.ball_count = 1;
        agent.door_count = 1;
        while (true) {
            if (env.setEntityWithWall(agent, {'ball': 1, 'door': 1, 'key': 1}) !== null) {
                break;
            }
        }
    }
    if (is_running && is_loop && env.episodes < env.maxEpisodes) {
        window.requestAnimationFrame(iterate);
    }
    else {
        button.disabled = true;
        button2.disabled = false;
        is_running = false;
    }
}

window.addEventListener('resize', function() {
    button.style.top = (canvas.parentNode.offsetTop + 10).toString() + 'px';
    button.style.left = (post.offsetLeft + post.offsetWidth - button.width - 30).toString() + 'px';

    button2.style.top = (canvas.parentNode.offsetTop + 35).toString() + 'px';
    button2.style.left = (post.offsetLeft + post.offsetWidth - button2.width - 30).toString() + 'px';
});</textarea>
</div>

When learning up to 2,000 episodes, the success rate of 8x8 Grid is about 65 ~ 68%. The success rate of A2C without curriculum learning is 40 ~ 50%, so this is an improvement.

In order to get better results, I ran A3C with 4 agents for 10,000 episodes. The rate at which the environment emerges at each learning stage is shown in Figure 13. As in Figure 12, but I increased the total episode to 10,000.

![](<../images/rl5_9.png>)
<small>Figure 13. A3C (4 agents) Percentage of environment presented in the learning phase</small>

In the curriculum learning process, the success rate for each environment - 6x6, 7x7, 8x8 Grid - increases at the same time.

![](<../images/rl5_10.png>)
<small>Figure 14. In the `two-room-door-key` problem, when the episode is performed with the A3C (4 agents) algorithm, the success rate</small>

Curriculum learning in the learning process achieved a higher success rate at a faster rate. A3C using curriculum learning in the same episode had a 2 to 5% more success rate when solving 8x8 Grid problems compared to regular A3C.

![](<../images/rl5_11.png>)
<small>Figure 15. Comparison of the success rates of A3C (4 agents) and general A3C (4, 8, 16 agents) using curriculum learning in `two-room-door-key` problem</small>

With this, I intend to conclude a series of five "Learn Reinforcement Learning" series. Although this series did not cover all the details of reinforcement learning, I was able to give those who would like to experience reinforcement learning once and for all to be able to observe reinforcement learning process and agent behavior in an interactive web environment without installing complex programs. I want to make a point. If I have a chance, I'd like to come back with a more interesting topic. Thank you for reading the long article.
