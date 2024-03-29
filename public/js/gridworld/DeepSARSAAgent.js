function DeepSARSAAgent(_env, _x, _y, _canvas) {
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
    this.tau = 1e-3;

    this.action_size = 4;
    this.model = createNetwork(this);

    function createNetwork(agent) {
        const model = tf.sequential();
        model.add(tf.layers.conv2d({
            inputShape: [7, 7, 1],
            kernelSize: 3,
            filters: 8,
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
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
        model.add(tf.layers.dense({units: agent.action_size}));

        model.summary();

        const optimizer = tf.train.adam(1e-4);
        model.compile({
            optimizer: optimizer,
            loss: 'meanSquaredError'
        });
        return model;
    }

    this.train_model = async function(state, action, reward, next_state, next_action, done) {
        const input = tf.tensor4d(state, [1, 7, 7, 1]);
        const next_input = tf.tensor4d(next_state, [1, 7, 7, 1]);
        const next_output = this.model.predict(next_input);
        const target = this.model.predict(input);
        let target_data = target.dataSync();

        if (done) {
            target_data[action] = reward;
        }
        else {
            target_data[action] = reward + this.gamma * next_output.dataSync()[next_action];
        }

        let target2 = tf.tensor2d([target_data]);

        await this.model.fit(input, target2, {batchSize: 1, epochs: 1})
            .then(() => {
                tf.dispose(input);
                tf.dispose(next_input);
                tf.dispose(next_output);
                tf.dispose(target);
                tf.dispose(target2);
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
