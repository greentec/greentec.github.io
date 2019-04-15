function ActorCriticAgent(_env, _x, _y, _canvas) {
    this.env = _env;
    this.x = _x;
    this.y = _y;
    this.canvas = _canvas;
    this.dir = Math.floor(Math.random() * dirs.length);
    this.vision = false;
    this.visionForward = 3;
    this.action = null;
    this.reward = 0;
    this.ball_count = 0;
    this.learn_step = 10;
    this.batch_size = 64;
    this.gamma = 0.99;

    this.action_size = 4;
    this.actor = createActorNetwork(this);
    this.critic = createCriticNetwork(this);

    function createActorNetwork(agent) {
        const model = tf.sequential();
        model.add(tf.layers.conv2d({
            inputShape: [7, 7, 1],
            kernelSize: 3,
            filters: 8,
            kernelInitializer: 'glorotUniform',
            activation: 'relu'
        }));
        model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 16,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }));
        model.add(tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }));
        model.add(tf.layers.flatten({}));
        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }));
        model.add(tf.layers.dense({
            units: 4,
            activation: 'softmax',
            kernelInitializer: 'glorotUniform'
        }));
        model.summary();

        const optimizer = tf.train.adam(1e-4);
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.softmaxCrossEntropy
        });

        return model;
    }

    function createCriticNetwork(agent) {
        const input_state = tf.input({shape: [7, 7, 1]});
        const conv1 = tf.layers.conv2d({
            inputShape: [7, 7, 1],
            kernelSize: 3,
            filters: 8,
            kernelInitializer: 'glorotUniform',
            activation: 'relu'
        }).apply(input_state);

        const conv2 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 16,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }).apply(conv1);

        const conv3 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }).apply(conv2);

        const flat = tf.layers.flatten({}).apply(conv3);
        const input_action = tf.input({shape: [4]});
        const concat = tf.layers.concatenate().apply([flat, input_action]);
        const dense1 = tf.layers.dense({
            units: 16,
            activation: 'relu',
            kernelInitializer : 'glorotUniform'
        }).apply(concat);

        const output = tf.layers.dense({
            units: 1,
            activation: 'linear',
            kernelInitializer: 'glorotUniform'
        }).apply(dense1);

        const model = tf.model({
            inputs: [input_state, input_action],
            outputs: output
        });
        model.summary();

        const optimizer = tf.train.adam(1e-5);
        model.compile({
            optimizer: optimizer,
            loss: tf.losses.meanSquaredError
        });

        return model;
    }

    this.train_model = async function(state, action, reward, next_state, done) {
        let target = new Array(1).fill(0);
        let advantages = new Array(this.action_size).fill(0);

        const input = tf.tensor4d(state, [1, 7, 7, 1]);
        const next_input = tf.tensor4d(next_state, [1, 7, 7, 1]);
        const next_action = this.actor.predict(next_input);
        const action_tensor = tf.tensor1d([action], 'int32');
        const now_action = tf.oneHot(action_tensor, this.action_size);

        const value = this.critic.predict([input, now_action]);
        const next_value = this.critic.predict([next_input, next_action]);

        let value_v = value.flatten().get(0);
        let next_value_v = next_value.flatten().get(0);

        if (done) {
            advantages[action] = reward - value_v;
            target[0] = reward;
        }
        else {
            advantages[action] = reward + this.gamma * next_value_v - value_v;
            target[0] = reward + this.gamma * next_value_v;
        }

        advantages = tf.tensor2d(advantages, [1, this.action_size], 'float32');
        target = tf.tensor1d(target, 'float32');

        await this.actor.fit(input, advantages, {batchSize: 1, epoch: 1})
            .then(() => {
                tf.dispose(advantages);
            });

        await this.critic.fit([input, now_action], target, {batchSize: 1, epoch: 1})
            .then(() => {
                tf.dispose(input);
                tf.dispose(next_input);
                tf.dispose(next_action);
                tf.dispose(action_tensor);
                tf.dispose(now_action);
                tf.dispose(value);
                tf.dispose(next_value);
                tf.dispose(target);
            });
    }

    this.step = function(action) {
        if (this.x + dirs[action][0] >= 0 && this.x + dirs[action][0] < this.env.width) {
            this.x += dirs[action][0];
        }
        if (this.y + dirs[action][1] >= 0 && this.y + dirs[action][1] < this.env.height) {
            this.y += dirs[action][1];
        }
        this.dir = action;

        let reward = 0;
        let done = false;
        let entity;

        if (this.env.grid[this.y][this.x].length !== 0) {
            for (let i = 0; i < this.env.grid[this.y][this.x].length; i += 1) {
                entity = this.env.grid[this.y][this.x][i];
                reward += entity.reward;

                // if (entity.type === 'goal' || entity.type === 'box') {
                if (entity.type === 'ball') {
                    // done = true;
                    this.ball_count -= 1;
                    this.env.grid[this.y][this.x].pop(); // empty ball

                    if (this.ball_count <= 0) {
                        done = true;
                    }
                }
                else if (entity.type === 'box') {
                    done = true;
                }
            }
        }
        else {
            reward += this.env.globalReward;
        }

        return [reward, done];
    }

    this.draw = function() {
        let ctx = this.canvas.getContext('2d');
        const grid_width = this.env.grid_width;

        if (this.vision) {
            let left, top, w, h;
            left = this.x - this.visionForward;
            top = this.y - this.visionForward;
            left *= grid_width;
            top *= grid_width;

            w = (this.visionForward * 2 + 1) * grid_width;
            if (left + w > this.env.grid_W * grid_width) {
                w = this.env.grid_W * grid_width - left;
            }
            h = (this.visionForward * 2 + 1) * grid_width;
            if (top + h > this.env.grid_W * grid_width) {
                h = this.env.grid_W * grid_width - top;
            }

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(left, top, w, h);
            ctx.closePath();
            ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x * grid_width + grid_width / 2,
                      this.y * grid_width + grid_width / 2);
        ctx.rotate(Math.PI / 2 * this.dir);
        ctx.translate(-this.x * grid_width - grid_width / 2,
                      -this.y * grid_width - grid_width / 2);
        ctx.fillStyle = colors['RED'];
        ctx.moveTo(this.x * grid_width + grid_width * 9 / 10, this.y * grid_width + grid_width / 2);
        ctx.lineTo(this.x * grid_width + grid_width / 10, this.y * grid_width + grid_width / 10);
        ctx.lineTo(this.x * grid_width + grid_width / 10, this.y * grid_width + grid_width * 9 / 10);
        ctx.lineTo(this.x * grid_width + grid_width * 9 / 10, this.y * grid_width + grid_width / 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    // from https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/45556840#45556840
    function sample(population, k){
        /*
            Chooses k unique random elements from a population sequence or set.

            Returns a new list containing elements from the population while
            leaving the original population unchanged.  The resulting list is
            in selection order so that all sub-slices will also be valid random
            samples.  This allows raffle winners (the sample) to be partitioned
            into grand prize and second place winners (the subslices).

            Members of the population need not be hashable or unique.  If the
            population contains repeats, then each occurrence is a possible
            selection in the sample.

            To choose a sample in a range of integers, use range as an argument.
            This is especially fast and space efficient for sampling from a
            large population:   sample(range(10000000), 60)

            Sampling without replacement entails tracking either potential
            selections (the pool) in a list or previous selections in a set.

            When the number of selections is small compared to the
            population, then tracking selections is efficient, requiring
            only a small set and an occasional reselection.  For
            a larger number of selections, the pool tracking method is
            preferred since the list takes less space than the
            set and it doesn't suffer from frequent reselections.
        */

        if (!Array.isArray(population))
            throw new TypeError("Population must be an array.");
        var n = population.length;
        if (k < 0 || k > n)
            throw new RangeError("Sample larger than population or is negative");

        var result = new Array(k);
        var setsize = 21;   // size of a small set minus size of an empty list

        if (k > 5) {
            setsize += Math.pow(4, Math.ceil(Math.log(k * 3, 4)))
        }

        if (n <= setsize) {
            // An n-length list is smaller than a k-length set
            var pool = population.slice();
            for (var i = 0; i < k; i++) {          // invariant:  non-selected at [0,n-i)
                var j = Math.random() * (n - i) | 0;
                result[i] = pool[j];
                pool[j] = pool[n - i - 1];       // move non-selected item into vacancy
            }
        }
        else {
            var selected = new Set();
            for (var i = 0; i < k; i++) {
                var j = Math.random() * (n - i) | 0;
                while (selected.has(j)) {
                    j = Math.random() * (n - i) | 0;
                }
                selected.add(j);
                result[i] = population[j];
            }
        }

        return result;
    }
}
