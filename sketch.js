const config = {
  teamSize: 2,
  time: 500,
  modifier: 30,
  shape: [10, 10, 1],
}
var policy = new Graph([0]);
var result = 0;
var time = 0;
var bestGenome;
var bestScore = 0;
var network;
var player;

function setup() {
  windowHeight, windowWidth -= 50;
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();

  //Create players, balls and goals
  goal = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  player = new Player(windowWidth / 3, windowHeight / 2, 0);
  xNetwork = new NNetwork(player.inputs(player, ball, goal, 'x'), config.shape);
  yNetwork = new NNetwork(player.inputs(player, ball, goal, 'y'), config.shape);
  bestXGenome = xNetwork.genome;
  bestYGenome = yNetwork.genome;

  //Render objects
  player.render();
  ball.render();
  goal.render();
}

function draw() {
  background(255);
  logic(player, ball);
  time += 1;

  xNetwork.forward(player.inputs(player, ball, goal, 'x'));
  yNetwork.forward(player.inputs(player, ball, goal, 'y'));
  player.side(xNetwork.outputs[0] * config.modifier);
  player.up(yNetwork.outputs[0] * config.modifier);
  //player.kick = (network.outputs[2] > 0 ? true : false); TODO figure out kick specialization

  for (let l = xNetwork.layers.length - 1; l >= 0; l--) {
    xNetwork.layers[l].render((l + 1) * 30, 10, 60);
  }

  for (let l = yNetwork.layers.length - 1; l >= 0; l--) {
    yNetwork.layers[l].render((l + 1) * 30, 80, 60);
  }

  if (time > config.time) {
    if (player.s > bestScore) {
      bestXGenome = xNetwork.genome;
      bestYGenome = yNetwork.genome;
      bestScore = player.s;
    }
    xNetwork.genome = bestXGenome;
    yNetwork.genome = bestYGenome;
    policy.input = player.s;
    time = 0;
    result = 0;
    reset(player, ball);
  }

  //Render objects
  player.render(player.s);
  ball.render();
  goal.render();
  policy.render(10, windowHeight - 10, 5);
}

function logic(player, ball) {
  //Player-ball collision logic

  var dx = player.x - ball.x;
  var dy = player.y - ball.y;
  //Reward touching the ball
  if (sqrt(sq(dx) + sq(dy)) < ball.r + player.r) {
    ball.collision(dx, dy, player.kick);
    player.s += 1;
  }
  //Penalize going outside the field
  if (player.x > windowWidth | player.x < 0 | player.y > windowHeight | player.y < 0) {
    player.s -= 0.1;
  }

  //Goal detection logic
  if (ball.x < 40 && ball.y < goal.y + 40 && goal.y - 40 < ball.y) {
    player.s += 100
  }
}

//Resets game conditions
function reset(player, ball) {
  player.x = windowWidth / 3;
  player.y = windowHeight / 2;
  player.s = 0;
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
}

//Merges a female and male genome at a random cutoff, and returns the child genome
function crossOver(female, male) {
  this.child = new Array(male.length);
  for (let l = 0; l < female.length; l++) {
    let cutoff = round(random(male[l].length));
    let first = male[l].slice(0, cutoff);
    let second = female[l].slice(cutoff);
    this.child[l] = first.concat(second);
  }
  return this.child;
}