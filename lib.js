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
    for (let i = 1; i < this.inputs.length; i++) {
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

class Game {
  constructor({ teamSize, time, shape, modifier, height, width }, genome = undefined, mutation = 0) {
    this.modifier = modifier
    this.goal0 = new Goal(0, height / 2);
    this.goal1 = new Goal(width, height / 2);
    this.ball = new Ball(width / 2, height / 2);
    this.networks = [];
    this.players = [];
    for (let i = 0; i < teamSize; i++) {
      this.players[i] = new Player(width / 3, height / (teamSize + 1) * (i + 1), 0);
      this.players[i + teamSize] = new Player(width * 2 / 3, height / (teamSize + 1) * (teamSize - i), 1);
    }
    for (let i = 0; i < teamSize; i++) {
      this.networks[i] = new NNetwork(this.players[i].inputs(this.players, this.ball, this.goal1), shape, true);
      this.networks[i + teamSize] = new NNetwork(this.players[i + teamSize].inputs(this.players, this.ball, this.goal0), shape, true);
      if (genome) {
        this.networks[i].genome = genome;
        this.networks[i].mutate(mutation, false);
        this.networks[i + teamSize].genome = genome;
        this.networks[i + teamSize].mutate(mutation, false);
      }
    }
  }
  step(steps = 1) {
    for (let s = 0; s < steps; s++) {
      logic(this.players, this.ball, this.goal0, this.goal1);
      for (let i = 0; i < this.networks.length; i++) {
        if (i < this.networks.length / 2) {
          this.networks[i].forward(this.players[i].inputs(this.players, this.ball, this.goal1));
        } else {
          this.networks[i].forward(this.players[i].inputs(this.players, this.ball, this.goal0));
        }
        this.players[i].up(this.networks[i].outputs[0] * this.modifier);
        this.players[i].side(this.networks[i].outputs[1] * this.modifier);
      }
    }
  }
  reset(height, width) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].t == 0) {
        this.players[i].x = width / 3;
        this.players[i].y = height / (this.players.length / 2 + 1) * (i + 1);
        this.players[i].s = 0;  
      } else {
        this.players[i].x = width * 2 / 3;
        this.players[i].y = height / (this.teamSize + 1) * (this.teamSize - i);
        this.players[i].s = 0;
      }
    }
    this.ball.x = width / 2;
    this.ball.y = height / 2;
  }
  best() {
    let scores = this.players.map(player => player.s);
    let scoresSorted = [...scores].sort((a, b) => { return b - a })
    return { score: scoresSorted[0], network: this.networks[scores.indexOf(scoresSorted[0])] }
  }
  render(height, width) {
    for (let i = 0; i < this.networks.length; i++) {
      this.networks[i].render(i * (width / this.networks.length), 60, 60, 30);
      this.players[i].render(i);
    }
    this.ball.render();
    this.goal0.render();
    this.goal1.render();
  }
  #logic(players, ball, goal0, goal1) {
    //Player-ball collision logic
    for (let i = 0; i < players.length; i++) {
      var dx = players[i].x - ball.x;
      var dy = players[i].y - ball.y;
      //Reward touching the ball
      if (sqrt(sq(dx) + sq(dy)) < ball.r + players[i].r) {
        ball.collision(dx, dy, players[i].kick);
        players[i].s += 1;
      }
      //Reward staying in the field
      if (players[i].x < config.width && players[i].x > 0 && players[i].y < config.height && players[i].y > 0) {
        players[i].s += 0.001;
      }
    }
    //Goal detection logic
    if (ball.x < 40 && ball.y < goal0.y + 40 && goal0.y - 40 < ball.y) {
      reset(players, ball);
      result -= 1;
    }
    else if (ball.x < 40 && ball.y < goal1.y + 40 && goal1.y - 40 < ball.y) {
      reset(players, ball);
      result += 1;
    }
  }
}