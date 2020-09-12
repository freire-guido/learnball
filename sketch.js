class NLayer {
  constructor(size, inputs, position) {
    this.test = 0;
    this.inputs = inputs;
    this.outputs = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.pos = position;
    //Initialize random weights and biases
    if (this.pos != 0) {
      for (let o = 0; o < this.weights.length; o++) {
        this.weights[o] = new Array(this.inputs.length);
        this.biases[o] = random(-1, 1);
        for (let i = 0; i < this.inputs.length; i++) {
          this.weights[o][i] = random(-1, 1);
        }
      }
    }
    else {
      for (let o = 0; o < this.weights.length; o++) {
        this.weights[o] = new Array(this.inputs.length);
        this.biases[o] = 0;
        for (let i = 0; i < this.inputs.length; i++) {
          this.weights[o][i] = 1;
        }
      }
    }
  }
  //Matrix max
  forward(inputs, team) {
    this.inputs = inputs;
    if (this.pos > 0) {
      for (let o = 0; o < this.outputs.length; o++) {
        this.outputs[o] = 0;
        for (let i = 0; i < this.inputs.length; i++) {
          this.outputs[o] += this.inputs[i] * this.weights[o][i];
        }
        this.outputs[o] += this.biases[o];
        this.outputs[o] = 10*activate(this.outputs[o]);
      }
    }
    else {
      for (let i = 0; i < this.outputs.length; i++) {
        this.outputs[i] = this.inputs[i];
      }
    }
    //tanh activation function
    function activate(z) {
      return Math.tanh(z);
    }
  }
  //Returns weights and biases as a list
  get genome() {
    let genome = [];
    genome.push(this.biases);
    for (let o = 0; o < this.outputs.length; o++) {
      genome.push(this.weights[o]);
    }
    return genome;
  }
  //Sets all parameters to the ones specified in the genome
  set encode(genome) {
    this.weights = Array.from(genome.slice(1));
    this.biases = Array.from(genome[0]);
    for (let o = 0; o < this.weights.length; o++) {
      //20% mutation chance
      let dice = random(100);
      if (dice < 5) {
        for (let i = 0; i < this.weights[o].length; i++) {
          console.log('mutation');
          this.weights[o][i] = random(-1, 1);
        }
        this.biases[o] = random(-1, 1);
      }
    }
  }
  render(x, y, h) {
    this.x = x;
    this.y = y;
    this.r = 8;
    for (let o = 0; o < this.outputs.length; o++) {
      let oY = h * o / (this.outputs.length - 1) + this.y;
      if (this.pos != 0) {
        for (let i = 0; i < this.weights[o].length; i++) {
          let iY = h * i / (this.weights[o].length - 1) + this.y;
          strokeWeight(abs(this.weights[o][i]));
          stroke(126)
          line(this.x - 30, iY, this.x, oY);
          strokeWeight(0);
        }
      } if (this.pos == 4) {
        text(round(this.outputs[o]), this.x, oY);
      }
      strokeWeight(abs(this.outputs[o] / 500));
      ellipse(this.x, oY, this.r);
      strokeWeight(0);
    }
  }
}
var time = 0;
var result = 0;
var players = [];
var networks = new Array(4);
var ball;

function setup() {
  windowWidth -= 30;
  windowHeight -= 30;
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  //Create players, balls and goals
  for (let i = 0; i < networks.length; i++) {
    if (i < networks.length / 2) {
      players.push(new Player(windowWidth / 3, windowHeight / (networks.length / 2 + 1) * (i + 1), 0));
    } else {
      players.push(new Player(windowWidth * 2 / 3, windowHeight / (networks.length / 2 + 1) * (i - (networks.length / 2 - 1)), 1));
    }
  }
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  //Shape networks
  for (let i = 0; i < networks.length; i++) {
    networks[i] = [];
    if (i < networks.length / 2) {
      networks[i].push(new NLayer(players[i].inputs(players, ball, goal1).length, players[i].inputs(players, ball, goal1), 0));
      networks[i].push(new NLayer(6, networks[i][0].outputs, 1));
      networks[i].push(new NLayer(5, networks[i][1].outputs, 2));
      networks[i].push(new NLayer(4, networks[i][2].outputs, 3));
      networks[i].push(new NLayer(3, networks[i][3].outputs, 4));
    } else {
      networks[i].push(new NLayer(players[i].inputs(players, ball, goal0).length, players[i].inputs(players, ball, goal0), 0));
      networks[i].push(new NLayer(6, networks[i][0].outputs, 1));
      networks[i].push(new NLayer(5, networks[i][1].outputs, 2));
      networks[i].push(new NLayer(4, networks[i][2].outputs, 3));
      networks[i].push(new NLayer(3, networks[i][3].outputs, 4));
    }
  }
  //Render objects
  for (let i = 0; i < players.length; i++) {
    players[i].render();
  }
  ball.render();
  goal0.render();
  goal1.render();
}

function draw() {
  background(255);
  logic(players, ball);
  time += 1;
  //Forward propagation
  for (let i = 0; i < networks.length; i++) {
    if (i < networks.length / 2) {
      networks[i][0].forward(players[i].inputs(players, ball, goal1));
    } else {
      networks[i][0].forward(players[i].inputs(players, ball, goal0));
    }
    for (let l = 1; l < networks[i].length; l++) {
      if (i < networks.length / 2) {
        networks[i][l].forward(networks[i][l - 1].outputs, 0);
      } else {
        networks[i][l].forward(networks[i][l - 1].outputs, 1);
      }
    }
  }
  //Map outputs of last layer to player controls
  for (let i = 0; i < networks.length; i++) {
    players[i].up(networks[i][networks[i].length-1].outputs[0]);
    players[i].side(networks[i][networks[i].length-1].outputs[1]);
    players[i].kick = (networks[i][networks[i].length-1].outputs[2] > 0 ? true : false);
    //Renders networks
    for (let l = networks[i].length - 1; l >= 0; l--) {
      networks[i][l].render((l + 1) * 30 + i * 200, 10, 60);
    }
  }
  //crossOver best players
  if (result < 0) {
    let scores = players.map(player => player.s);
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    for (let i = networks.length / 2; i < networks.length; i++) {
      let cross = crossOver(networks[female], networks[male]);
      for (let l = 1; l < networks[i].length; l++) {
        networks[i][l].encode = cross[l];
      }
    }
    reset(players, ball);
    time = 0;
    result = 0;
  }
  else if (result > 0) {
    let scores = players.map(player => player.s);
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    for (let i = 0; i < networks.length / 2; i++) {
      let cross = crossOver(networks[female], networks[male]);
      for (let l = 1; l < networks[i].length; l++) {
        networks[i][l].encode = cross[l];
      }
    }
    reset(players, ball);
    time = 0;
    result = 0;
  }
  else if (time > 240) {
    let scores = players.map(player => player.s);
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    console.log(scores);
    console.log(female, male);
    for (let i = 0; i < networks.length; i++) {
      let cross = crossOver(networks[female], networks[male]);
      if (i != female & i != male) {
        for (let l = 1; l < networks[i].length; l++) {
          networks[i][l].encode = cross[l];
        }
      }
    }
    reset(players, ball);
    time = 0;
    result = 0;
  }
  //Render objects
  for (let i = 0; i < players.length; i++) {
    players[i].render();
  }
  ball.render();
  goal0.render();
  goal1.render();
}

function Player(xx, yy, tt) {
  this.t = tt;
  this.r = 25;
  this.x = xx;
  this.y = yy;
  this.s = 0;
  this.kick = false;
  this.up = (f) => {
    this.y += f;
  }
  this.side = (s) => {
    this.x += s;
  }
  this.render = () => {
    this.kick = false;
    if (this.t == 1) {
      fill(0, 0, 255);
    }
    else {
      fill(255, 0, 0)
    }
    ellipse(this.x, this.y, this.r * 2);
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
    inputs.push(ball.x - this.x, ball.y - this.y);
    inputs.push(goal.x - this.x, goal.y - this.y);
    return inputs
  }
}

function Ball(xx, yy) {
  this.r = 10;
  this.x = xx;
  this.y = yy;
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

function Goal(xx, yy) {
  this.x = xx;
  this.y = yy;
  this.render = () => {
    rect(this.x, this.y, 40, 160);
  }
}

function logic(players, ball) {
  //Player-ball collision logic
  for (let i = 0; i < players.length; i++) {
    var dx = players[i].x - ball.x;
    var dy = players[i].y - ball.y;
    //Reward touching the ball
    if (sqrt(sq(dx) + sq(dy)) < ball.r + players[i].r) {
      ball.collision(dx, dy, players[i].kick);
      players[i].s += 1;
    }
    //Penalize going outside the field
    if (players[i].x > windowWidth | players[i].x < 0 | players[i].y > windowHeight | players[i].y < 0) {
      players[i].s -= 0.1;
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

//Resets game conditions
function reset(players, ball) {
  for (let i = 0; i < players.length; i++) {
    if (i < players.length / 2) {
      players[i].x = windowWidth / 3;
      players[i].y = windowHeight / (networks.length / 2 + 1) * (i + 1);
      players[i].s = 0;
    } else {
      players[i].x = windowWidth * 2 / 3;
      players[i].y = windowHeight / (networks.length / 2 + 1) * (i - (networks.length / 2 - 1));
      players[i].s = 0;
    }
  }
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
}

//Merges a female and male network at a random cutoff, and returns the child network
function crossOver(female, male) {
  this.female = [];
  this.male = [];
  this.child = new Array(male.length);
  female.forEach(NLayer => { this.female.push(NLayer.genome) });
  male.forEach(NLayer => { this.male.push(NLayer.genome) });
  for (let l = 0; l < this.female.length; l++) {
    let cutoff = round(random(this.male[l].length));
    let first = this.male[l].slice(0, cutoff);
    let second = this.female[l].slice(cutoff);
    this.child[l] = first.concat(second);
  }
  return this.child;
}