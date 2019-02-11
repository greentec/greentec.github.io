function Agent(_env, _x, _y, _canvas) {
    this.env = _env;
    this.x = _x;
    this.y = _y;
    this.canvas = _canvas;
    this.dir = Math.floor(Math.random() * dirs.length);
    this.visionForward = 7; // must be odd..
    this.action = null;
    this.reward = 0;
    // this.states = createQueue(100);
    // this.actions = createQueue(100);
    // this.rewards = createQueue(100);
    let model, optimizer;
    // [model, optimizer] = createPolicyNetwork(agent);
    // this.model = model;
    // this.optimizer = optimizer;

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
                if (entity.type === 'goal') {
                    done = true;
                }
                // else if (entity.type === 'ball') {
                //     ball_count -= 1;
                //     this.env.grid[this.y][this.x].pop(); // empty ball
                // }
            }
        }
        else {
            reward += this.env.globalReward;
        }

        return [reward, done];
    }

    this.draw = function() {
        let ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x * this.env.grid_width + this.env.grid_width / 2,
                      this.y * this.env.grid_width + this.env.grid_width / 2);
        ctx.rotate(Math.PI / 2 * this.dir);
        ctx.translate(-this.x * this.env.grid_width - this.env.grid_width / 2,
                      -this.y * this.env.grid_width - this.env.grid_width / 2);
        ctx.fillStyle = colors['RED'];
        ctx.moveTo(this.x * this.env.grid_width + this.env.grid_width * 9 / 10, this.y * this.env.grid_width + this.env.grid_width / 2);
        ctx.lineTo(this.x * this.env.grid_width + this.env.grid_width / 10, this.y * this.env.grid_width + this.env.grid_width / 10);
        ctx.lineTo(this.x * this.env.grid_width + this.env.grid_width / 10, this.y * this.env.grid_width + this.env.grid_width * 9 / 10);
        ctx.lineTo(this.x * this.env.grid_width + this.env.grid_width * 9 / 10, this.y * this.env.grid_width + this.env.grid_width / 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
