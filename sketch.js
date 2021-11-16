const config = {
  teamSize: 2,
  time: 200,
  shape: [4,4,2]
}
var policy = new Graph([0]);
var player;
var network;
var result = 0;
var time = 0;
var pause = false;
var modifier = 100
var bestGenome;
var bestScore = 0;

function setup() {
  windowHeight, windowWidth -= 50;
  createCanvas(windowWidth, windowHeight - 20);
  rectMode(CENTER);
  noStroke();

  //Create players, balls and goals
  goal0 = new Goal(0, windowHeight / 2);
  goal1 = new Goal(windowWidth, windowHeight / 2);
  ball = new Ball(windowWidth / 2, windowHeight / 2);
  player = new Player(windowWidth / 3, windowHeight / 2, 0);
  network = new NNetwork(player.inputs(player, ball, goal0), config.shape);
  player.render(10);
  ball.render();
  goal0.render();
  goal1.render();
}
function draw() {
  if (pause) return;
  background(255);
  logic(player, ball);
  time += 1;
  network.forward(player.inputs(player, ball, goal0));
  player.up(network.outputs[0] * modifier);
  player.side(network.outputs[1] * modifier);
  player.render()
  for (let l = network.layers.length - 1; l >= 0; l--) {
    network.layers[l].render((l + 1) * 30, 10, 60);
  }
  if (time > config.time) {
    if (player.s > bestScore) {
      bestGenome = network.genome;
      bestScore = player.s;
    }
    policy.input = player.s;
    time = 0;
    result = 0;
    reset(player, ball);
  }
  ball.render();
  goal0.render();
  goal1.render();
  policy.render(10, windowHeight - 10, 5);
}

function logic(player, ball) {
  var dx = player.x - ball.x;
  var dy = player.y - ball.y;
  //Reward touching the ball
  if (sqrt(sq(dx) + sq(dy)) < ball.r + player.r) {
    ball.collision(dx, dy, player.kick);
    player.s += 1;
  }
  //Penalize going outside the field
  if (player.x < windowWidth && player.x > 0 && player.y < windowHeight && player.y > 0) {
    player.s += 0.05;
  }
  //Goal detection logic
  if (ball.x < 40 && ball.y < goal0.y + 40 && goal0.y - 40 < ball.y) {
    player.s += 100
  }
}

//Resets playing field
function reset(player, ball) {
  player.x = windowWidth / 3;
  player.y = windowHeight / 2;
  player.s = 0;
  ball.x = windowWidth / 2;
  ball.y = windowHeight / 2;
}

//Merges a female and male network at a random cutoff, and returns the child genome
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