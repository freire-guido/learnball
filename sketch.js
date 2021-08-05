const config = {
  teamSize: 2,
  time: 500,
  modifier: 20,
  shape: [10,10,3]
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
  network = new NNetwork(player.inputs(player, ball, goal), config.shape);
  bestGenome = network.genome;

  //Render objects
  player.render();
  ball.render();
  goal.render();
}

function draw() {
  background(255);
  logic(player, ball);
  time += 1;

  network.forward(player.inputs(player, ball, goal));
  player.up(network.outputs[0] * config.modifier);
  player.side(network.outputs[1] * config.modifier);
  player.kick = (network.outputs[2] > 0 ? true : false);

  for (let l = network.layers.length - 1; l >= 0; l--) {
    network.layers[l].render((l + 1) * 30, 10, 60);
  }

  if (time > config.time) {
    if (player.s > bestScore) {
      console.log('CHANGE')
      bestGenome = network.genome;
      bestScore = player.s;
    }
    console.log(bestScore, bestGenome[1][2], bestGenome[1][3], bestGenome[1][4])
    network.genome = bestGenome;
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