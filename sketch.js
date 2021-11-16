const config = {
  teamSize: 2,
  time: 200,
  shape: [4,4,2]
}
var policy = new Graph([0]);
var networks = [];
var players = [];
var result = 0;
var time = 0;
var pause = false;
var modifier = 100

function setup() {
  windowHeight, windowWidth -= 50;
  createCanvas(windowWidth, windowHeight - 20);
  rectMode(CENTER);
  noStroke();

  //Create players, balls and goals
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  for (let i = 0; i < config.teamSize; i++) {
    players[i] = new Player(windowWidth / 3, windowHeight / (config.teamSize + 1) * (i + 1), 0);
    players[i + config.teamSize] = new Player(windowWidth * 2 / 3, windowHeight / (config.teamSize + 1) * (config.teamSize - i), 1);
    players[i].render(i);
    players[i + config.teamSize].render(i + config.teamSize);
  }
  //Shape networks
  for (let i = 0; i < config.teamSize; i++) {
    networks[i] = new NNetwork(players[i].inputs(players, ball, goal1), config.shape);
    networks[i + config.teamSize] = new NNetwork(players[i + config.teamSize].inputs(players, ball, goal0), config.shape);
  }
  ball.render();
  goal0.render();
  goal1.render();
}
function draw() {
  if (pause) return;
  background(255);
  logic(players, ball);
  time += 1;
  //Forward propagation
  for (let i = 0; i < networks.length; i++) {
    networks[i].forward(players[i].inputs(players, ball, goal1));
    players[i].up(networks[i].outputs[0] * modifier);
    players[i].side(networks[i].outputs[1] * modifier);
    //Renders networks
    for (let l = networks[i].layers.length - 1; l >= 0; l--) {
      networks[i].layers[l].render((l + 1) * 30 + i * 200, 10, 60);
    }
  }
  //crossOver best players
  let scores = players.map(player => player.s);
  if (result < 0) {
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    for (let i = config.teamSize; i < config.teamSize * 2; i++) {
      let cross = crossOver(networks[female], networks[male]);
      networks[i].genome = cross;
    }
    policy.input = players[male].s;
    time = 0;
    result = 0;
    reset(players, ball);
  }
  else if (result > 0) {
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    for (let i = 0; i < config.teamSize; i++) {
      let cross = crossOver(networks[female], networks[male]);
      networks[i].genome = cross;
    }
    policy.input = players[male].s;
    time = 0;
    result = 0;
    reset(players, ball);
  }
  else if (time > config.time) {
    let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
    let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
    for (let i = 0; i < config.teamSize * 2; i++) {
      if (i != female & i != male) {
        let cross = crossOver(networks[female], networks[male]);
        networks[i].genome = cross;
      } else {
        networks[i].genome = networks[i].genome;
      }
    }
    policy.input = players[male].s;
    time = 0;
    result = 0;
    reset(players, ball);
  }
  //Render objects
  for (let i = 0; i < players.length; i++) {
    players[i].render(i);
  }
  ball.render();
  goal0.render();
  goal1.render();
  policy.render(10, windowHeight - 10, 5);
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
    //Reward staying in the field
    if (players[i].x < windowWidth && players[i].x > 0 && players[i].y < windowHeight && players[i].y > 0) {
      players[i].s += 0.05;
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

//Resets playing field
function reset(players, ball) {
  for (let i = 0; i < config.teamSize; i++) {
    players[i].x = windowWidth / 3;
    players[i].y = windowHeight / (config.teamSize + 1) * (i + 1);
    players[i].s = 0;

    players[i + config.teamSize].x = windowWidth * 2 / 3;
    players[i + config.teamSize].y = windowHeight / (config.teamSize + 1) * (config.teamSize - i);
    players[i + config.teamSize].s = 0;
  }
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
}

//Merges a female and male network at a random cutoff, and returns the child genome
function crossOver(female, male) {
  let child = new Array(male.length);
  for (let l = 0; l < female.genome.length; l++) {
    let cutoff = round(random(male.genome[l].length));
    let first = male.genome[l].slice(0, cutoff);
    let second = female.genome[l].slice(cutoff);
    child[l] = first.concat(second);
  }
  return child;
}

function keyTyped() {
  if (keyCode === 32){
    pause = !pause;
  }
  if (keyCode === 87){
    modifier += 10;
  }
  if (keyCode === 83){
    modifier -= 10;
  }
}