class NLayer {
  constructor(size, inputs, position) {
    this.inputs = inputs;
    this.outputs = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.pos = position;
    //Initialize random weights and biases
    if (this.pos != 0) {
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
  forward(inputs, team) {
    if (this.pos > 0) {
      for (let o = 0; o < this.outputs.length; o++) {
        this.outputs[o] = 0;
        for (let i = 0; i < inputs.length; i++) {
          this.outputs[o] += inputs[i] * this.weights[o][i];
        }
        this.outputs[o] += this.biases[o];
        if (team != 0 || o != 1) {
          this.outputs[o] = -sigmoid(this.outputs[o]);
        } else {
          this.outputs[o] = sigmoid(this.outputs[o]);
        }
      }
      //Sigmoid activation function
      function sigmoid(z) {
        return 1 / (1 + Math.exp(-z));
      }
    }
    else {
      for (let i = 0; i < this.outputs.length; i++) {
        this.outputs[i] = inputs[i];
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
    this.weights = Array.from(genome.slice(1));
    this.biases = Array.from(genome[0]);
    for (let o = 0; o < this.weights.length; o++) {
      //20% mutation chance
      let dice = random(10);
      if (dice > 5) {
        for (let i = 0; i < this.weights[o].length; i++) {
          let dice = random(10);
          if (dice > 5) {
            this.weights[o][i] = random(-1, 1);
          }
        }
      }
      if (dice > 5) {
        this.biases[o] = random(-1, 1);
      }
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
      players.push(new Player(windowWidth / 3, windowHeight * (i + 1) / 3, 0));
    } else {
      players.push(new Player(windowWidth * 2 / 3, windowHeight * (i - 1) / 3, 1));
    }
  }
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  let inputs0 = [];
  let inputs1 = [];
  players.forEach(player => { inputs0.push(player.x, player.y) });
  players.slice(players.length / 2).forEach(player => { inputs1.push(player.x, player.y) });
  players.slice(0, players.length / 2).forEach(player => { inputs1.push(player.x, player.y) });
  inputs0.push(ball.x, ball.y);
  inputs1.push(ball.x, ball.y);
  //Create networks
  for (let i = 0; i < networks.length; i++) {
    networks[i] = [];
    if (i < 2 / 2) {
      networks[i].push(new NLayer(inputs0.length, inputs0, 0));
      networks[i].push(new NLayer(4, networks[i][0].outputs, 1));
      networks[i].push(new NLayer(4, networks[i][1].outputs, 2));
      networks[i].push(new NLayer(3, networks[i][2].outputs, 3));
    } else {
      networks[i].push(new NLayer(inputs1.length, inputs0, 0));
      networks[i].push(new NLayer(4, networks[i][0].outputs, 1));
      networks[i].push(new NLayer(4, networks[i][1].outputs, 2));
      networks[i].push(new NLayer(3, networks[i][2].outputs, 3));
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
  //Update inputs
  let inputs0 = [];
  let inputs1 = [];
  players.forEach(player => { inputs0.push(player.x, player.y) });
  players.slice(players.length / 2).forEach(player => { inputs1.push(player.x, player.y) });
  players.slice(0, players.length / 2).forEach(player => { inputs1.push(player.x, player.y) });
  inputs0.push(ball.x, ball.y);
  inputs1.push(ball.x, ball.y);
  //Forward propagation
  networks[0][0].forward(inputs0, 0);
  networks[1][0].forward(inputs0, 0);
  networks[2][0].forward(inputs1, 1);
  networks[3][0].forward(inputs1, 1);
  for (let i = 0; i < networks.length; i++) {
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
    players[i].up(networks[i][3].outputs[0]);
    players[i].side(networks[i][3].outputs[1]);
    players[i].kick = (networks[i][3].outputs[2] > 0.5 ? true : false);
  }
  //crossOver best players
  if (result < 0) {
    let best = findNets(players);
    let female = best[0];
    let male = best[1];
    for (let i = networks.length / 2; i < networks.length; i++) {
      let cross = crossOver(networks[female], networks[male]);
      for (let l = 1; l < networks[i].length; l++) {
        networks[i][l].encode = cross[l];
      }
    }
  }
  else if (result > 0) {
    let best = findNets(players);
    let female = best[0];
    let male = best[1];
    for (let i = 0; i < networks.length / 2; i++) {
      let cross = crossOver(networks[female], networks[male]);
      for (let l = 1; l < networks[i].length; l++) {
        networks[i][l].encode = cross[l];
      }
    }
  }
  else if (time > 1200) {
    let best = findNets(players);
    let female = best[0];
    let male = best[1];
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
  this.r = 20;
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
    if (sqrt(sq(dx) + sq(dy)) < ball.r + players[i].r) {
      ball.collision(dx, dy, players[i].kick);
      players[i].s += 0.2;
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
      players[i].y = windowHeight * i / 3;
      players[i].s = 0;
    } else {
      players[i].x = windowWidth * 2 / 3;
      players[i].y = windowHeight * (i - 2) / 3;
      players[i].s = 0;
    }
  }
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
}

//Returns best and second best network INDEXES as a list
function findNets(players) {
  this.sMax = max(players.map(player => player.s));
  this.sMin = min(players.map(player => player.s));
  console.log(players.map(player => player.s));
  if (sMax == 0) {
    this.female = round(random(players.length - 1));
    this.male = round(random(players.length - 1));
  } else {
    this.male = players.map(player => player.s).indexOf(sMax);
    this.female = players.map(player => player.s).indexOf(sMin);
    for (let i = 0; i < players.length; i++) {
      if (players[i].s >= players[female].s & players[i].s < players[male].s) {
        this.female = i;
      }
    }
    if (players[female].s == sMin) {
      female = male;
    }
  }
  return [this.female, this.male];
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