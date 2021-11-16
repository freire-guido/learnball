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

class HumanPlayer {
  constructor(x, y, team, r = 25) {
    this.t = team;
    this.r = r;
    this.x = x;
    this.y = y;
    this.kick = false;
  }
  up = (f) => {
    this.y += f;
  }
  side = (s) => {
    this.x += s;
  }
  render = (index = undefined) => {
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
      fill(255, 255, 255);
      text(index, this.x, this.y + (this.r - 20) / 2);
    }
  }
}

class Player {
  constructor(x, y, team, r = 25) {
    this.t = team;
    this.r = r;
    this.x = x;
    this.y = y;
    this.s = 0;
    this.kick = false;
  }
  up = (f) => {
    this.y += f;
  }
  side = (s) => {
    this.x += s;
  }
  render = (index = undefined) => {
    if (this.t == 1) {
      fill(0, 0, 255);
    }
    else {
      fill(255, 0, 0);
    }
    ellipse(this.x, this.y, this.r * 2);
    if (index !== undefined) {
      textSize(20);
      textAlign(CENTER);
      fill(255, 255, 255);
      text(index, this.x, this.y + (this.r - 20) / 2);
    }
  }
  inputs = (player, ball, goal) => {
    let inputs = [];
    if (this.t == 0) {
    inputs.push(ball.x - this.x, ball.y - this.y);
    inputs.push(player.x - this.x, player.y - this.y);
    return inputs;
    }
  }
}

class Ball {
  constructor(x, y, r = 10) {
    this.r = r;
    this.x = x;
    this.y = y;
  }
  collision = (dx, dy, kick) => {
    if (kick) {
      this.x -= dx * 4;
      this.y -= dy * 4;
    }
    else {
      this.x -= dx;
      this.y -= dy;
    }
  }
  render = () => {
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