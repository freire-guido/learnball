const config = {
  teamSize: 3,
  time: 10000,
  shape: [10, 10, 8, 2]
}
var policy;
var bestScore = 0;
var pause = false;
var modifier = 50;
var bestGenome = undefined;

function setup() {
  windowHeight, windowWidth -= 50;
  createCanvas(windowWidth, windowHeight - 20);
  policy = new Graph();
}

function draw() {
  if (pause) return;
  let result = playMatch(config, bestGenome);
  let network = new NNetwork([1, 1, 1, 1, 1, 1], config.shape);
  if (result[1] > bestScore){
    bestScore = result[1];
    bestGenome = result[0];
  }
  network.genome = bestGenome;
  policy.input = bestScore
  background(255);
  network.render(500, 500, 100, 100)
  policy.render(10, windowHeight - 100, 5);
}

function playMatch(config, genome = undefined) {
  //Create players, balls, goals and networks
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  let networks = [];
  let players = [];
  for (let i = 0; i < config.teamSize; i++) {
    players[i] = new Player(windowWidth / 3, windowHeight / (config.teamSize + 1) * (i + 1), 0);
    players[i + config.teamSize] = new Player(windowWidth * 2 / 3, windowHeight / (config.teamSize + 1) * (config.teamSize - i), 1);
  }
  if (!genome){
    for (let i = 0; i < config.teamSize; i++) {
      networks[i] = new NNetwork(players[i].inputs(players, ball, goal1), config.shape);
      networks[i + config.teamSize] = new NNetwork(players[i + config.teamSize].inputs(players, ball, goal0), config.shape);
    }
  } else {
    for (let i = 0; i < config.teamSize; i++) {
      networks[i] = new NNetwork(players[i].inputs(players, ball, goal1), config.shape);
      networks[i + config.teamSize] = new NNetwork(players[i + config.teamSize].inputs(players, ball, goal0), config.shape);
      networks[i].genome = genome
      networks[i + config.teamSize].genome = genome
    }
  }
  //Play the match
  let result = 0;
  for (let time = 0; time < config.time || result != 0; time++) {
    logic(players, ball);
    for (let i = 0; i < networks.length; i++) {
      networks[i].forward(players[i].inputs(players, ball, goal1));
      players[i].up(networks[i].outputs[0] * modifier);
      players[i].side(networks[i].outputs[1] * modifier);
    }
  }
  //crossOver best players
  let scores = players.map(player => player.s);
  let male = scores.indexOf([...scores].sort(function (a, b) { return b - a })[0]);
  let female = scores.indexOf([...scores].sort(function (a, b) { return b - a })[1]);
  if (result < 0) {
    for (let i = config.teamSize; i < config.teamSize * 2; i++) {
      let cross = crossOver(networks[female].genome, networks[male].genome);
      networks[i].genome = cross;
    }
  }
  else if (result > 0) {
    for (let i = 0; i < config.teamSize; i++) {
      let cross = crossOver(networks[female].genome, networks[male].genome);
      networks[i].genome = cross;
    }
  }
  else {
    for (let i = 0; i < config.teamSize * 2; i++) {
      if (i != female && i != male) {
        let cross = crossOver(networks[female].genome, networks[male].genome);
        networks[i].genome = cross;
      } else {
        networks[i].genome = networks[i].genome;
      }
    }
  }
  return [networks[male].genome, players[male].s];
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

//Merges a female and male genome at a random cutoff, and returns the child genome
function crossOver(female, male) {
  let child = new Array(male.length);
  for (let l = 0; l < female.length; l++) {
    let cutoff = round(random(male[l].length));
    let first = male[l].slice(0, cutoff);
    let second = female[l].slice(cutoff);
    child[l] = first.concat(second);
  }
  return child;
}

function keyTyped() {
  if (keyCode === 32) {
    pause = !pause;
  }
  if (keyCode === 87) {
    modifier += 10;
  }
  if (keyCode === 83) {
    modifier -= 10;
  }
  if (keyCode === 13){
    saveJSON(network.genome, "genome.json");
  }
}