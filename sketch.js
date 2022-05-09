const config = {
  teamSize: 2,
  time: 1000,
  shape: [10, 10, 2],
  modifier: 20,
  height: 1020,
  width: 1360,
  batch: 4
}

var game;
var epsilon = 0;

var policy;
var pause = false;
var render = false;
var bestGenome = undefined;
var time = 0;

function setup() {
  createCanvas(config.width, config.height);
  policy = new Graph([0])
}

function draw() {
  if (pause) return;
  if (render) {
    if (time < config.time) {
      if (time == 0) {
        game = new Game(config, bestGenome);
        for (let i = 0; i < game.networks.length / 2; i++) {
          game.networks[i].mutate(80);
        }
      }
      game.step()
      background(255);
      game.render(config.height, config.width);
      time++;
    } else {
      game.reset()
      time = 0;
    }
  } else {
    time = 0;
    let games = Array(Math.pow(2, config.batch - 1)).fill().map(x => (new Game(config, bestGenome, epsilon)))
    games.forEach(game => {
      for (let i = 0; i < game.networks.length / 2; i++) {
        game.networks[i].mutate(80);
      }
      game.step(config.time);
    });
    for (let b = games.length / 2; b >= 1; b /= 2) {
      for (let i = 0; i < b; i++) {
        games[i] = new Game(config, games[2*i].best().network.genome);
        for (let n = 0; n < games[i].networks.length / 2; n++) {
          games[i].networks[n].genome = games[2*i + 1].best().network.genome
        }
        games[i].step(config.time);
      }
    }
    let batchBest = games[0].best()
    if (batchBest.score > policy.inputs[policy.inputs.length - 1] || epsilon >= 100) {
      policy.inputs.push(batchBest.score);
      bestGenome = batchBest.network.genome;
      epsilon = 0;
    } else {
      epsilon += 0.05;
    }
    background(255);
    let net = new NNetwork(0, config.shape);
    net.genome = bestGenome;
    net.render(config.width / 2 - 50, config.height / 2, 100, 100);
    batchBest.network.render(config.width / 2 - 40, config.height / 4, 80, 80)
    policy.render(10, config.height - 100, 5);
    textAlign(LEFT)
    text(epsilon, 20, 20);
  }
}

function playMatch(config, genome = undefined) {
  //Create players, balls, goals and networks
  let { goal0, goal1, ball, networks, players } = initializeMatch(genome);
  if (genome) {
    for (let i = 0; i < networks.length; i++) {
      networks[i].genome = genome
    }
  }
  //Play the match
  let result = 0;
  for (let time = 0; time < config.time || result != 0; time++) {
    logic(players, ball, goal0, goal1);
    for (let i = 0; i < networks.length; i++) {
      if (i < networks.length / 2) {
        networks[i].forward(players[i].inputs(players, ball, goal1));
      } else {
        networks[i].forward(players[i].inputs(players, ball, goal0));
      }
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

function initializeMatch(genome = undefined) {
  let goal0 = new Goal(0, config.height / 2);
  let goal1 = new Goal(config.width, config.height / 2);
  let ball = new Ball(config.width / 2, config.height / 2);
  let networks = [];
  let players = [];
  for (let i = 0; i < config.teamSize; i++) {
    players[i] = new Player(config.width / 3, config.height / (config.teamSize + 1) * (i + 1), 0);
    players[i + config.teamSize] = new Player(config.width * 2 / 3, config.height / (config.teamSize + 1) * (config.teamSize - i), 1);
  }
  for (let i = 0; i < config.teamSize; i++) {
    networks[i] = new NNetwork(players[i].inputs(players, ball, goal1), config.shape, true);
    networks[i + config.teamSize] = new NNetwork(players[i + config.teamSize].inputs(players, ball, goal0), config.shape, true);
    if (genome) {
        networks[i].genome = genome;
        networks[i].mutate(10, false);
        networks[i + config.teamSize].genome = genome;
        networks[i + config.teamSize].mutate(10, false);
    }
  }
  return { goal0: goal0, goal1: goal1, ball: ball, networks: networks, players: players };
}

function logic(players, ball, goal0, goal1) {
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
  if (keyCode === 32) { //spacebar
    pause = !pause;
  }
  if (keyCode === 13) {
    render = !render;
  }
  if (keyCode === 8) {
    saveJSON(network.genome, "genome.json");
  }
}