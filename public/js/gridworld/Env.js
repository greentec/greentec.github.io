function Env(_w, _canvas) {
    this.canvas = _canvas;
    this.grid = null;
    this.grid_W = _w;
    this.grid_width = 30;
    this.width = null;
    this.height = null;
    this.globalReward = -0.1;
    this.episodes = 0;
    this.maxEpisodes = 100;
    this.steps = 0;
    this.maxSteps = 200;

    this.balls_count = 0;
    this.boxes_count = 0;
    this.marks_count = 0;

    this.agent = null;
    const ctx = this.canvas.getContext('2d');

    this.initGrid = function(w = 6, h = 6) {
        this.grid = new Array(h);
        for (let y = 0; y < h; y++) {
            this.grid[y] = new Array(w);
            for (let x = 0; x < w; x++) {
                this.grid[y][x] = [];
            }
        }

        this.width = w;
        this.height = h;

        this.canvas.style.backgroundColor = 'rgb(0,0,0)';
    }

    this.drawOutline = function() {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        for (let i = 0; i <= this.width; i++) {
            ctx.moveTo(i * this.grid_width, 0);
            ctx.lineTo(i * this.grid_width, this.height * this.grid_width);
        }
        for (let i = 0; i <= this.height; i++) {
            ctx.moveTo(0, i * this.grid_width);
            ctx.lineTo(this.width * this.grid_width, i * this.grid_width);
        }
        ctx.stroke();

        ctx.closePath();
    }

    this.drawInfo = function() {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.font = '14px monospace';

        ctx.fillText(`step: ${this.steps}/${this.maxSteps}`, 10, this.grid_W * this.grid_width + 20);
        ctx.fillText(`episode: ${this.episodes+1}/${this.maxEpisodes}`, 10, this.grid_W * this.grid_width + 40);
        ctx.fillText(`reward: ${Math.floor(this.agent.reward * 10) / 10}`, 10, this.grid_W * this.grid_width + 60);
        ctx.closePath();
    }

    this.drawRewardGraph = function(rewards_array, indent_x, indent_y) {
        let max = Math.max(...rewards_array);
        let min = Math.min(...rewards_array);
        if (max === min) {
            min = max - Math.abs(max);
        }

        const graph_height = 100;
        const graph_width = 110;
        const graph_indent = 20;
        const graph_w = graph_width / (rewards_array.length - 1); // one data width

        ctx.save();
        ctx.translate(indent_x, indent_y);

        // axis
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.moveTo(graph_indent, graph_indent);
        ctx.lineTo(graph_indent, graph_indent + graph_height + 5);
        ctx.lineTo(graph_indent + graph_width, graph_indent + graph_height + 5);

        ctx.stroke();
        ctx.closePath();

        // text
        ctx.beginPath();
        ctx.font = '12px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText('Reward', 100, graph_indent); // title
        ctx.fillText(max, 0, graph_indent);
        ctx.fillText(min, 0, graph_indent + graph_height);

        ctx.fillText(this.episodes+1, graph_indent + graph_width - 10, graph_indent + graph_height + 20);

        ctx.closePath();

        // line graph
        //   rewards
        ctx.beginPath();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 1;
        ctx.moveTo(graph_indent, graph_indent + graph_height - (rewards_array[0] - min) / (max - min) * graph_height);
        for (let i = 1; i < rewards_array.length; i += 1) {
            ctx.lineTo(graph_indent + graph_w * i, graph_indent + graph_height - (rewards_array[i] - min) / (max - min) * graph_height);
        }
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    this.setEntity = function(agent, info, init_pos = null) {
        this.agent = agent;

        if (!this.grid) {
            this.initGrid(this.grid_W, this.grid_W);
        }

        let entity_pos_array;
        if (init_pos !== null) {
            entity_pos_array = init_pos.map(c => c[0] + c[1] * this.grid_W);
        }
        else {
            // entities
            let population = new Array(this.grid_W * this.grid_W).fill(0).map((c,i) => i);
            entity_pos_array = this.sample(population, population.length);
        }

        let now_ball_count = 0;
        let now_box_count = 0;
        let now_marks_count = 0;
        let total_count = 0;

        for (let key in info) {
            switch (key) {
                case 'ball':
                    this.balls_count = info[key];
                    total_count += this.balls_count;
                    break;

                case 'box':
                    this.boxes_count = info[key];
                    total_count += this.boxes_count;
                    break;

                case 'mark':
                    this.marks_count = info[key];
                    total_count += this.marks_count;
                    break;
            }
        }

        while (true) {
            let pos = entity_pos_array.shift();
            let x = pos % this.grid_W;
            let y = Math.floor(pos / this.grid_W);
            if (isNaN(pos) || isNaN(x) || isNaN(y)) {
                console.log('NaN Error', pos, x, y);
                return null;
            }

            if (x !== agent.x && y !== agent.y) {
                if (now_ball_count < this.balls_count) {
                    this.grid[y][x].push( new Entity(y, x, 1, 'LIGHTBLUE', 'ball') );
                    now_ball_count += 1;
                    total_count -= 1;
                }
                else if (now_box_count < this.boxes_count) {
                    this.grid[y][x].push( new Entity(y, x, -1, 'YELLOW', 'box') );
                    now_box_count += 1;
                    total_count -= 1;
                }
            }

            if (total_count <= 0) {
                break;
            }
        }
    };

    this.draw = function() {
        // this.canvas.width = this.canvas.width;
        this.drawOutline();
        this.drawInfo();

        let ctx = this.canvas.getContext('2d');
        let entity;

        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                for (let i = 0; i < this.grid[y][x].length; i += 1) {
                    entity = this.grid[y][x][i];
                    ctx.beginPath();
                    ctx.fillStyle = colors[entity.color];

                    switch (entity.type) {

                        case 'goal':
                            ctx.fillRect(x * this.grid_width, y * this.grid_width, this.grid_width, this.grid_width);
                            break;

                        case 'box':
                            ctx.fillRect((x + 0.2) * this.grid_width, (y + 0.2) * this.grid_width, this.grid_width * 0.6, this.grid_width * 0.6);
                            break;

                        case 'ball':
                            ctx.arc((x + 0.5) * this.grid_width, (y + 0.5) * this.grid_width, this.grid_width / 3, 0, Math.PI * 2);
                            ctx.fill();
                            break;

                        case 'mark':
                            ctx.strokeStyle = colors[entity.color];
                            ctx.lineWidth = 3;
                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.1, y * this.grid_width + this.grid_width * 0.1);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.9, y * this.grid_width + this.grid_width * 0.9);
                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.9, y * this.grid_width + this.grid_width * 0.1);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.1, y * this.grid_width + this.grid_width * 0.9);
                            ctx.stroke();
                            break;

                        case 'wall':
                            ctx.fillRect(x * this.grid_width, y * this.grid_width, this.grid_width, this.grid_width);
                            break;

                    }
                    ctx.closePath();
                }
            }
        }
    };


    // from https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array/45556840#45556840
    this.sample = function(population, k) {
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

    this.reset = function() {
        for (let y = 0; y < this.height; y += 1) {
            for (let x = 0; x < this.width; x += 1) {
                for (let i = 0; i < this.grid[y][x].length; i += 1) {
                    this.grid[y][x].pop();
                }
            }
        }
    }
}
