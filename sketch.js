class NLayer {
  constructor(size, inputs, position) {
    this.inputs = inputs;
    this.outputs = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.pos = position;
    //Initialize random weights and biases
    if (this.pos > 0) {
      for (let o = 0; o < this.weights.length; o++) {
        this.weights[o] = new Array(inputs.length);
        this.biases[o] = random(-1, 1);
        for (let i = 0; i < inputs.length; i++) {
          this.weights[o][i] = random(-1, 1);
        }
      }
    }
    else {
      for (let o = 0; o < this.weights.length; o++) {
        this.weights[o] = new Array(inputs.length);
        this.biases[o] = 0;
        for (let i = 0; i < inputs.length; i++) {
          this.weights[o][i] = 1;
        }
      }
    }
  }
  //Matrix max
  forward(inputs) {
    let sum = 0;
    for (let o = 0; o < this.outputs.length; o++) {
      this.outputs[o] = 0;
      for (let i = 0; i < inputs.length; i++) {
        this.outputs[o] += inputs[i] * this.weights[o][i];
      }
      this.outputs[o] += this.biases[o];
      sum += this.outputs[o];
    }
    //Map last layer to value between 0 and 1
    if (this.pos == 3) {
      for (let o = 0; o < this.outputs.length; o++) {
        this.outputs[o] = this.outputs[o] / sum;
      }
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
    let dice = random(10);
    this.weights = Array.from(genome.slice(1));
    this.biases = Array.from(genome[0]);
    //20% mutation chance
    if (dice > 5) {
      for (let o = 0; o < this.weights.length; o++) {
        for (let i = 0; i < this.weights[o].length; i++) {
          let dice = random(1, 10);
          if (dice > 5) {
            this.weights[o][i] = random(-1, 1);
          }
        }
      }
    }
  }
}
var time = 0;
var result;
var team0 = [];
var team1 = [];
var network0 = [];
var network1 = [];
var network2 = [];
var network3 = [];
var ball;

function setup() {
  windowWidth -= 30;
  windowHeight -= 30;
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  let inputs0 = [];
  let inputs1 = [];
  //Create players, balls and goals
  for (let i = 0; i < 2; i++) {
    team0.push(new Player(round(random(width / 2)), round(random(height)), 0));
    team1.push(new Player(round(random(width / 2, windowWidth)), round(random(height)), 1));
    inputs0.push(team0[i].x, team0[i].y, team1[i].x, team1[i].y);
    inputs1.push(team1[i].x, team1[i].y, team0[i].x, team0[i].y);
  }
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  inputs0.push(ball.x, ball.y);
  inputs1.push(ball.x, ball.y);
  //Create networks
  network0.push(new NLayer(inputs0.length, inputs0, 0));
  network0.push(new NLayer(4, network0[0].outputs, 1));
  network0.push(new NLayer(4, network0[1].outputs, 2));
  network0.push(new NLayer(3, network0[2].outputs, 3));
  network1.push(new NLayer(inputs0.length, inputs0, 0));
  network1.push(new NLayer(4, network1[0].outputs, 1));
  network1.push(new NLayer(4, network1[1].outputs, 2));
  network1.push(new NLayer(3, network1[2].outputs, 3));
  network2.push(new NLayer(inputs1.length, inputs1, 0));
  network2.push(new NLayer(4, network2[0].outputs, 1));
  network2.push(new NLayer(4, network2[1].outputs, 2));
  network2.push(new NLayer(3, network2[2].outputs, 3));
  network3.push(new NLayer(inputs1.length, inputs1, 0));
  network3.push(new NLayer(4, network3[0].outputs, 1));
  network3.push(new NLayer(4, network3[1].outputs, 2));
  network3.push(new NLayer(3, network3[2].outputs, 3));
  //Render objects
  for (let i = 0; i < team0.length; i++) {
    team0[i].render();
    team1[i].render();
  }
  ball.render();
  goal0.render();
  goal1.render();
}

function draw() {
  background(255);
  //Update inputs
  let inputs0 = [];
  let inputs1 = [];
  for (let i = 0; i < 2; i++) {
    inputs0.push(team0[i].x, team0[i].y, team1[i].x, team1[i].y);
    inputs1.push(team1[i].x, team1[i].y, team0[i].x, team0[i].y);
  }
  inputs0.push(ball.x, ball.y);
  inputs1.push(ball.x, ball.y);
  console.log(inputs0);
  //Forward propagation
  network0[0].forward(inputs0);
  network1[0].forward(inputs0);
  network2[0].forward(inputs1);
  network3[0].forward(inputs1);
  network0[1].forward(network0[0]);
  network1[1].forward(network1[0]);
  network2[1].forward(network2[0]);
  network3[1].forward(network3[0]);
  network0[2].forward(network0[1]);
  network1[2].forward(network1[1]);
  network2[2].forward(network2[1]);
  network3[2].forward(network3[1]);
  network0[3].forward(network0[2]);
  network1[3].forward(network1[2]);
  network2[3].forward(network2[2]);
  network3[3].forward(network3[2]);
  //Map outputs of last layer to player controls
  team0[0].up(network0[3].outputs[0]);
  team0[0].side(network0[3].outputs[1]);
  team0[0].kick = (network0[3].outputs[2] > 0.5 ? true : false);
  team0[1].up(network1[3].outputs[0]);
  team0[1].side(network1[3].outputs[1]);
  team0[1].kick = (network1[3].outputs[2] > 0.5 ? true : false);
  team1[0].up(network2[3].outputs[0]);
  team1[0].side(network2[3].outputs[1]);
  team1[0].kick = (network2[3].outputs[2] > 0.5 ? true : false);
  team1[1].up(network3[3].outputs[0]);
  team1[1].side(network3[3].outputs[1]);
  team1[1].kick = (network3[3].outputs[2] > 0.5 ? true : false);
  logic(team0, team1, ball);
  //crossOver winning network players
  switch (result) {
    case 0:
      cross = crossOver(network0, network1);
      for (let i = 1; i < network1.length; i++) {
        network2[i].encode = cross[i];
        network3[i].encode = cross[i];
      }
      time = 0;
      reset(team0, team1, ball);
      break;
    case 1:
      cross = crossOver(network2, network3);
      for (let i = 1; i < network1.length; i++) {
        network0[i].encode = cross[i];
        network1[i].encode = cross[i];
      }
      time = 0;
      reset(team0, team1, ball);
      break;
    default:
      time += 1;
      break;
  }
  if (time > 200) {
    cross = crossOver(network0, network3);
    for (let i = 1; i < network1.length; i++) {
      network1[i].encode = cross[i];
      network2[i].encode = cross[i];
    }
    reset(team0, team1, ball);
    time = 0
  }
  //Render objects
  for (let i = 0; i < team0.length; i++) {
    team0[i].render();
    team1[i].render();
  }
  ball.render();
  goal0.render();
  goal1.render();
}

function Player(xx, yy, tt) {
  this.t = tt;
  this.r = 20;
  this.x = xx;
  this.y = yy;
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

function logic(team0, team1, ball) {
  this.players = team0.concat(team1);
  //Player-ball collision logic
  for (let i = 0; i < players.length; i++) {
    var dx = players[i].x - ball.x;
    var dy = players[i].y - ball.y;
    if (sqrt(sq(dx) + sq(dy)) < ball.r + players[i].r) {
      ball.collision(dx, dy, players[i].kick);
    }
  }
  //Goal detection logic
  if (ball.x < 40 && ball.y < goal0.y + 40 && goal0.y - 40 < ball.y) {
    reset(team0, team1, ball);
    result = 1;
  }
  else if (ball.x < 40 && ball.y < goal1.y + 40 && goal1.y - 40 < ball.y) {
    reset(team0, team1, ball);
    result = 0;
  }
  else {
    result = undefined;
  }
}

//Resets game conditions
function reset(team0, team1, ball) {
  for (let i = 0; i < team0.length; i++) {
    team0[i].x = round(random(windowWidth / 2));
    team0[i].y = round(random(windowHeight));
    team1[i].x = round(random(windowWidth / 2, windowWidth));
    team1[i].y = round(random(windowHeight));
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