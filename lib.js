class Graph {
  constructor(ii = []) {
    this.inputs = ii;
  }
  render(xx, yy, ss) {
    this.x = xx;
    this.y = yy;
    this.s = ss;
    textSize(20);
    textAlign(CENTER);
    fill(0, 255, 0);
    stroke('black');
    strokeWeight(2);
    for (let i = 1; i < this.inputs.length; i++){
      line(this.x + (i - 1) * this.s, this.y - this.inputs[i - 1], this.x + i * this.s, this.y - this.inputs[i]);
    }
    noStroke();
    text((this.inputs[this.inputs.length - 1]).toPrecision(5), this.x + this.inputs.length * this.s, this.y - this.inputs[this.inputs.length - 1]);
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
  up(f) {
    this.y += f;
  }
  side(s) {
    this.x += s;
  }
  render(index = undefined) {
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
  inputs(players, ball, goal) {
    let inputs = [];
    let distances = [];
    if (this.t == 0) {
      players.slice(players.length / 2).forEach(player => { distances.push(dist(this.x, this.y, player.x, player.y)); });
      inputs.push(players[distances.indexOf([...distances].sort()[0]) + players.length / 2].x - this.x, players[distances.indexOf([...distances].sort()[0]) + players.length / 2].y - this.y);
      distances = [];
      players.slice(0, players.length / 2).forEach(player => { distances.push(dist(this.x, this.y, player.x, player.y)); });
      inputs.push(players[distances.indexOf([...distances].sort()[1])].x - this.x, players[distances.indexOf([...distances].sort()[1])].y - this.y);
    } else {
      players.slice(0, players.length / 2).forEach(player => { distances.push(dist(this.x, this.y, player.x, player.y)); });
      inputs.push(players[distances.indexOf([...distances].sort()[0])].x - this.x, players[distances.indexOf([...distances].sort()[0])].y - this.y);
      distances = [];
      players.slice(players.length / 2).forEach(player => { distances.push(dist(this.x, this.y, player.x, player.y)); });
      inputs.push(players[distances.indexOf([...distances].sort()[1]) + players.length / 2].x - this.x, players[distances.indexOf([...distances].sort()[1]) + players.length / 2].y - this.y);
    }
    inputs.push(goal.x - this.x, goal.y - this.y);
    inputs.push(ball.x - this.x, ball.y - this.y);
    return inputs;
  }
}

class Ball {
  constructor(x, y, r = 10) {
    this.r = r;
    this.x = x;
    this.y = y;
  }
  collision(dx, dy, kick) {
    if (kick) {
      this.x -= dx * 4;
      this.y -= dy * 4;
    }
    else {
      this.x -= dx;
      this.y -= dy;
    }
  }
  render() {
    fill(0, 255, 0);
    ellipse(this.x, this.y, this.r * 2);
  }
}

function Goal(x, y) {
  this.x = x;
  this.y = y;
  this.render = () => {
    rectMode(CENTER);
    rect(this.x, this.y, 40, 160);
  }
}