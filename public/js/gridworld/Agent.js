function Agent(_env, _x, _y, _canvas) {
    this.env = _env;
    this.x = _x;
    this.y = _y;
    this.canvas = _canvas;
    this.dir = Math.floor(Math.random() * dirs.length);
    this.vision = false;
    this.visionForward = 2;
    this.action = null;
    this.reward = 0;
    this.ball_count = 0;
    
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
}
