const config = {
  teamSize: 3,
  time: 10000,
  shape: [10, 10, 8, 2],
  modifier: 50,
  height: 1020,
  width: 1360
}

var policy;
var bestScore = 0;
var pause = false;
var render = false;
var bestGenome = undefined;
var time = 0;

var { goal0, goal1, ball, networks, players } = initializeMatch();

function setup() {
  createCanvas(config.width, config.height - 20);
  policy = new Graph();
}

function draw() {
  if (pause) return;
  if (render) {
    if (time == 0) {
      for (let i = 0; i < config.teamSize; i++) {
        players[i] = new Player(config.width / 3, config.height / (config.teamSize + 1) * (i + 1), 0);
        players[i + config.teamSize] = new Player(config.width * 2 / 3, config.height / (config.teamSize + 1) * (config.teamSize - i), 1);
      }
      for (let i = 0; i < config.teamSize; i++) {
        networks[i] = new NNetwork(players[i].inputs(players, ball, goal1), config.shape);
        networks[i + config.teamSize] = new NNetwork(players[i + config.teamSize].inputs(players, ball, goal0), config.shape);
        networks[i].genome = bestGenome;
        networks[i + config.teamSize].genome = bestGenome;
      }
    }
    logic(players, ball);
    background(255);
    for (let i = 0; i < networks.length; i++) {
      networks[i].forward(players[i].inputs(players, ball, goal1));
      players[i].up(networks[i].outputs[0] * config.modifier);
      players[i].side(networks[i].outputs[1] * config.modifier);
      networks[i].render(i * (config.width / networks.length), 10, 60, 30);
      players[i].render(i);
    }
    ball.render();
    goal0.render();
    goal1.render();
    time++
  } else {
    time = 0;
    let { genome, score } = playMatch(config, bestGenome);
    if (score > bestScore) {
      bestScore = score;
      bestGenome = genome;
      policy.input = bestScore
    }
    let network = new NNetwork([1, 1, 1, 1, 1, 1], config.shape);
    network.genome = bestGenome;
    background(255);
    network.render(500, 500, 100, 100)
    policy.render(10, config.height - 100, 5);
  }
}

function playMatch(config, genome = undefined) {
  //Create players, balls, goals and networks
  let { goal0, goal1, ball, networks, players } = initializeMatch();
  for (let i = 0; i < config.teamSize; i++) {
    players[i] = new Player(config.width / 3, config.height / (config.teamSize + 1) * (i + 1), 0);
    players[i + config.teamSize] = new Player(config.width * 2 / 3, config.height / (config.teamSize + 1) * (config.teamSize - i), 1);
  }
  if (!genome) {
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
      players[i].up(networks[i].outputs[0] * config.modifier);
      players[i].side(networks[i].outputs[1] * config.modifier);
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
  return { genome: networks[male].genome, score: players[male].s };
}

function initializeMatch() {
  let goal0 = new Goal(0, config.height / 2);
  let goal1 = new Goal(config.width, config.height / 2);
  let ball = new Ball(config.width / 2, config.height / 2);
  let networks = [];
  let players = [];
  for (let i = 0; i < config.teamSize; i++) {
    players[i] = new Player(config.width / 3, config.height / (config.teamSize + 1) * (i + 1), 0);
    players[i + config.teamSize] = new Player(config.width * 2 / 3, config.height / (config.teamSize + 1) * (config.teamSize - i), 1);
  }
  return { goal0: goal0, goal1: goal1, ball: ball, networks: networks, players: players };
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
    if (players[i].x < config.width && players[i].x > 0 && players[i].y < config.height && players[i].y > 0) {
      players[i].s += 0.01;
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
    players[i].x = config.width / 3;
    players[i].y = config.height / (config.teamSize + 1) * (i + 1);
    players[i].s = 0;

    players[i + config.teamSize].x = config.width * 2 / 3;
    players[i + config.teamSize].y = config.height / (config.teamSize + 1) * (config.teamSize - i);
    players[i + config.teamSize].s = 0;
  }
  ball.x = config.width / 2;
  ball.y = config.height / 2;
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
  if (keyCode === 13) {
    render = !render;
  }
  if (keyCode === 8) {
    saveJSON(network.genome, "genome.json");
  }
}