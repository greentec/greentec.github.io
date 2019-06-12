function Env(_w, _canvas) {
    this.canvas = _canvas;
    this.grid = null;
    this.grid_W = _w;
    this.grid_W_max = 8;
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
    this.keys_count = 0;
    this.doors_count = 0;

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
        this.grid_W = w;

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

    this.drawRewardGraph = function(rewards_array, indent_x, indent_y, total_episode=this.episodes+1) {
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

        ctx.fillText(total_episode, graph_indent + graph_width - 10, graph_indent + graph_height + 20);

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

    this.setEntityWithWall = function(agent, info) {
        this.agent = agent;

        if (!this.grid) {
            this.initGrid(this.grid_W, this.grid_W);
        }

        for (let key in info) {
            switch (key) {
                case 'ball':
                    this.balls_count = info[key];
                    break;

                case 'door':
                    this.doors_count = info[key];
                    break;

                case 'key':
                    this.keys_count = info[key];
                    break;
            }
        }

        // walls
        let horizontal = Math.random() < 0.5 ? true : false;
        let wall_index;
        let door_index;
        let key_list = [];
        let ball_list = [];
        if (horizontal) {
            do {
                wall_index = Math.floor(Math.random() * (this.grid_W - 2)) + 1;
            } while (agent.y === wall_index);
            door_index = Math.floor(Math.random() * this.grid_W);

            for (let i = 0; i < this.grid_W; i += 1) {
                if (i !== door_index) {
                    this.grid[wall_index][i].push( new Entity(wall_index, i, 0, 'GREY', 'wall') );
                }
                else {
                    if (info.hasOwnProperty('door') === true) {
                        this.grid[wall_index][i].push( new Entity(wall_index, i, 0, 'PURPLE', 'door') );
                    }
                }
            }

            for (let y = 0; y < this.grid_W; y += 1) {
                for (let x = 0; x < this.grid_W; x += 1) {
                    if ((agent.y < wall_index && y < wall_index) ||
                        (agent.y > wall_index && y > wall_index)) {
                        // key - must be in the same room
                        key_list.push(y.toString() + '#' + x.toString());
                    }
                    else if ((agent.y < wall_index && y > wall_index) ||
                             (agent.y > wall_index && y < wall_index)){
                        // ball - must be in the other room
                        ball_list.push(y.toString() + '#' + x.toString());
                    }
                }
            }
        }
        else {
            do {
                wall_index = Math.floor(Math.random() * (this.grid_W - 2)) + 1;
            } while (agent.x === wall_index);
            door_index = Math.floor(Math.random() * this.grid_W);

            for (let i = 0; i < this.grid_W; i += 1) {
                if (i !== door_index) {
                    this.grid[i][wall_index].push( new Entity(i, wall_index, 0, 'GREY', 'wall') );
                }
                else {
                    if (info.hasOwnProperty('door') === true) {
                        this.grid[i][wall_index].push( new Entity(i, wall_index, 1, 'PURPLE', 'door') );
                    }
                }
            }

            for (let y = 0; y < this.grid_W; y += 1) {
                for (let x = 0; x < this.grid_W; x += 1) {
                    if ((agent.x < wall_index && x < wall_index) ||
                        (agent.x > wall_index && x > wall_index)) {
                        // key - must be in the same room
                        key_list.push(y.toString() + '#' + x.toString());
                    }
                    else if ((agent.x < wall_index && x > wall_index) ||
                             (agent.x > wall_index && x < wall_index)){
                        // ball - must be in the other room
                        ball_list.push(y.toString() + '#' + x.toString());
                    }
                }
            }
        }

        let population = new Array(this.grid_W * this.grid_W).fill(0).map((c,i) => i);
        let entity_pos_array = this.sample(population, population.length);

        if (info.hasOwnProperty('ball') === true) {
            for (let i = 0; i < this.balls_count; i++) {
                let pos = entity_pos_array.pop();
                let x = pos % this.grid_W;
                let y = Math.floor(pos / this.grid_W);
                // if (x !== agent.x && y !== agent.y) {
                if (this.grid[y][x].length === 0 &&
                    (x === agent.x && y === agent.y) === false &&
                    ball_list.indexOf(y.toString() + '#' + x.toString()) !== -1) {
                    if (info.hasOwnProperty('key') === true) {
                        this.grid[y][x].push( new Entity(y, x, 1, 'GREEN', 'ball') );
                    }
                    else {
                        this.grid[y][x].push( new Entity(y, x, 3, 'GREEN', 'ball') );
                    }
                }
                else {
                    i -= 1;
                }
            }
        }

        if (info.hasOwnProperty('key') === true) {
            for (let i = 0; i < this.keys_count; i++) {
                let pos = entity_pos_array.pop();
                let x = pos % this.grid_W;
                let y = Math.floor(pos / this.grid_W);
                // if (x !== agent.x && y !== agent.y) {
                if (this.grid[y][x].length === 0 &&
                    (x === agent.x && y === agent.y) === false &&
                    key_list.indexOf(y.toString() + '#' + x.toString()) !== -1) {
                    this.grid[y][x].push( new Entity(y, x, 1, 'PURPLE', 'key') );
                }
                else {
                    i -= 1;
                }
            }
        }
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

                        case 'door':
                            ctx.strokeStyle = colors[entity.color];
                            ctx.lineWidth = 2;
                            ctx.rect((x + 0.1) * this.grid_width, (y + 0.1) * this.grid_width, this.grid_width * 0.8, this.grid_width * 0.8);

                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.66, y * this.grid_width + this.grid_width * 0.38);
                            ctx.arc(x * this.grid_width + this.grid_width * 0.5,
                                    y * this.grid_width + this.grid_width * 0.38,
                                    this.grid_width * 0.16,
                                    Math.PI,
                                    0);
                            ctx.rect(x * this.grid_width + this.grid_width * 0.25,
                                     y * this.grid_width + this.grid_width * 0.38,
                                     this.grid_width * 0.5,
                                     this.grid_width * 0.42);

                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.58, y * this.grid_width + this.grid_width * 0.55);
                            ctx.arc(x * this.grid_width + this.grid_width * 0.5,
                                    y * this.grid_width + this.grid_width * 0.55,
                                    this.grid_width * 0.08,
                                    0,
                                    Math.PI * 2);
                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.5, y * this.grid_width + this.grid_width * 0.63);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.5, y * this.grid_width + this.grid_width * 0.8);

                            ctx.stroke();
                            break;

                        case 'key':
                            ctx.strokeStyle = colors[entity.color];
                            ctx.lineWidth = 3;
                            ctx.arc(x * this.grid_width + this.grid_width * 0.5,
                                    y * this.grid_width + this.grid_width * 0.25,
                                    this.grid_width * 0.18,
                                    0,
                                    Math.PI * 2);
                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.5, y * this.grid_width + this.grid_width * 0.45);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.5, y * this.grid_width + this.grid_width * 0.85);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.75, y * this.grid_width + this.grid_width * 0.85);
                            ctx.moveTo(x * this.grid_width + this.grid_width * 0.5, y * this.grid_width + this.grid_width * 0.6);
                            ctx.lineTo(x * this.grid_width + this.grid_width * 0.70, y * this.grid_width + this.grid_width * 0.6);
                            ctx.stroke();
                            break;

                    }
                    ctx.closePath();
                }
            }
        }
        ctx.lineWidth = 1;
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
