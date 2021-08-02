class Graph {
  constructor(ii) {
    this.inputs = ii;
  }
  set input(input) {
    this.inputs.push(input);
  }
  render(xx, yy, ss) {
    this.x = xx;
    this.y = yy;
    this.s = ss;
    for (var i = 1; i < this.inputs.length; i++) {
      strokeWeight(2);
      line((i - 1) * this.s + this.x, -this.inputs[i - 1] + this.y, i * this.s + this.x, -this.inputs[i] + this.y);
    }
    noStroke();
    text(this.inputs[i - 1], i * this.s + this.x, -this.inputs[i - 1] + this.y);
  }
}

function Player(x, y, team, r = 25) {
  this.t = team;
  this.r = r;
  this.x = x;
  this.y = y;
  this.s = 0;
  this.kick = false;
  this.up = (f) => {
    this.y += f;
  }
  this.side = (s) => {
    this.x += s;
  }
  this.render = (index = undefined) => {
    if (this.t == 1) {
      fill(0, 0, 255);
    }
    else {
      fill(255, 0, 0)
    }
    ellipse(this.x, this.y, this.r * 2);
    if (index !== undefined) {
      textSize(20);
      textAlign(CENTER);
      fill(255,255,255);
      text(index, this.x, this.y + (this.r - 20) / 2);
    }
  }
  this.inputs = (players, ball, goal) => {
    let inputs = [];
    let dist = [];
    if (this.t == 0) {
      players.slice(players.length / 2).forEach(player => { dist.push(sqrt(sq(this.x - player.x) + sq(this.y - player.y))) });
      inputs.push(players[dist.indexOf([...dist].sort()[0]) + players.length / 2].x - this.x, players[dist.indexOf([...dist].sort()[0]) + players.length / 2].y - this.y);
      dist = [];
      players.slice(0, players.length / 2).forEach(player => { dist.push(sqrt(sq(this.x - player.x) + sq(this.y - player.y))) });
      inputs.push(players[dist.indexOf([...dist].sort()[1])].x - this.x, players[dist.indexOf([...dist].sort()[1])].y - this.y);
    } else {
      players.slice(0, players.length / 2).forEach(player => { dist.push(sqrt(sq(this.x - player.x) + sq(this.y - player.y))) });
      inputs.push(players[dist.indexOf([...dist].sort()[0])].x - this.x, players[dist.indexOf([...dist].sort()[0])].y - this.y);
      dist = [];
      players.slice(players.length / 2).forEach(player => { dist.push(sqrt(sq(this.x - player.x) + sq(this.y - player.y))) });
      inputs.push(players[dist.indexOf([...dist].sort()[1]) + players.length / 2].x - this.x, players[dist.indexOf([...dist].sort()[1]) + players.length / 2].y - this.y);
    }
    inputs.push(goal.x - this.x, goal.y - this.y);
    inputs.push(ball.x - this.x, ball.y - this.y);
    return inputs;
  }
}

function Ball(x, y, r = 10) {
  this.r = r;
  this.x = x;
  this.y = y;
  this.collision = (dx, dy, kick) => {
    if (kick) {
      this.x -= dx * 4;
      this.y -= dy * 4;
    }
    else {
      this.x -= dx;
      this.y -= dy;
    }
  }
  this.render = () => {
    fill(0, 255, 0);
    ellipse(this.x, this.y, this.r * 2);
  }
}

function Goal(x, y) {
  this.x = x;
  this.y = y;
  this.render = () => {
    rect(this.x, this.y, 40, 160);
  }
}