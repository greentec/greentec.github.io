function DuelingDQNAgent(_env, _x, _y, _canvas, kernelInitializer='randomNormal') {
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
    this.train_start = 1000;
    this.sample_max = 50000;
    this.learn_step = 10;
    this.batch_size = 64;
    this.gamma = 0.99;
    this.tau = 1e-3;
    this.memory = [];

    this.action_size = 4;
    this.model = createNetwork(this, kernelInitializer);
    this.target_model = createNetwork(this, kernelInitializer);

    function createNetwork(agent, kernelInitializer='randomNormal') {
        const input_state = tf.input({shape: [7, 7, 1]});
        const conv1 = tf.layers.conv2d({
            inputShape: [7, 7, 1],
            kernelSize: 3,
            filters: 8,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(input_state);

        const conv2 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 16,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(conv1);

        const conv3 = tf.layers.conv2d({
            kernelSize: 3,
            filters: 32,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(conv2);

        const flat = tf.layers.flatten({}).apply(conv3);
        const v_dense = tf.layers.dense({
            units: 16,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(flat);
        const adv_dense = tf.layers.dense({
            units: 16,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(flat);

        const v_final = tf.layers.dense({
            units: 1,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(v_dense);
        const adv_final = tf.layers.dense({
            units: agent.action_size,
            activation: 'relu',
            kernelInitializer: kernelInitializer
        }).apply(adv_dense);

        // const output = tf.layers.add().apply([v_final, adv_final, -tf.div(tf.mean(adv_final, -1), 4)]);
        const output = tf.layers.add().apply([v_final, adv_final]);

        const model = tf.model({inputs: input_state, outputs: output});

        model.summary();

        const optimizer = tf.train.adam(1e-4);
        model.compile({
            optimizer: optimizer,
            loss: 'meanSquaredError'
        });
        return model;
    }

    this.soft_update = function() {
        tf.tidy(() => {
            for (let i = 0; i < this.model.weights.length; i += 1) {
                this.target_model.weights[i].val.assign(
                    tf.add(this.model.weights[i].val.mul(this.tau), this.target_model.weights[i].val.mul(1-this.tau))
                );
            }
        });
    }

    this.update_target_model = function() {
        for (let i = 0; i < this.model.weights.length; i += 1) {
            this.target_model.weights[i].val.assign(this.model.weights[i].val);
        }
    }

    this.append_sample = function(state, action, reward, next_state, done) {
        this.memory.push([math.reshape(state, [7,7,1]), action, reward, math.reshape(next_state, [7,7,1]), done]);
        if (this.memory.length > this.sample_max) {
            this.memory.shift();
        }
    }

    this.train_model = async function() {
        const population = new Array(this.memory.length).fill(0).map((c,i) => i);
        const mini_batch = sample(population, this.batch_size);

        let array_prev_state = [];
        let array_action = [];
        let array_reward = [];
        let array_next_state = [];
        let array_done = [];

        for (let i = 0; i < mini_batch.length; i += 1) {
            array_prev_state.push(this.memory[mini_batch[i]][0]);
            array_action.push(this.memory[mini_batch[i]][1]);
            array_reward.push(this.memory[mini_batch[i]][2]);
            array_next_state.push(this.memory[mini_batch[i]][3]);
            array_done.push(this.memory[mini_batch[i]][4]? 0 : 1);
        }

        const batch_prev_state = tf.tensor4d(array_prev_state);
        const batch_action = tf.tensor1d(array_action, 'int32');
        const batch_reward = tf.tensor1d(array_reward);
        const batch_next_state = tf.tensor4d(array_prev_state);
        const batch_done = tf.tensor1d(array_done);

        const target = this.model.predict(batch_prev_state);
        const target_val = this.target_model.predict(batch_next_state);

        let target_data = target.dataSync();
        let target_val_data = target_val.dataSync();

        for (let i = 0; i < this.batch_size; i += 1) {
            if (array_done[i]) {
                target_data[i * this.action_size + array_action[i]] = array_reward[i];
            }
            else {
                target_data[i * this.action_size + array_action[i]] =
                    array_reward[i] +
                    this.gamma *
                    Math.max(...target_val_data.slice(i * this.action_size, (i+1) * this.action_size));
            }
        }

        const target2 = tf.tensor2d(target_data, [this.batch_size, 4]);

        await this.model.fit(batch_prev_state, target2, {batchSize: this.batch_size, epochs: 1})
            .then(() => {
                batch_prev_state.dispose();
                batch_action.dispose();
                batch_reward.dispose();
                batch_next_state.dispose();
                batch_done.dispose();
                target.dispose();
                target_val.dispose();
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
