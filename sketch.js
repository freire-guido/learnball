const config = {
  teamSize: 2,
  time: 500,
  shape: [4, 4, 2]
}
var policy = new Graph([0]);
var players = [];
var player;
var human;
var network;
var result = 0;
var time = 0;
var pause = false;
var modifier = 50
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
  human = new HumanPlayer(windowWidth / 3 * 2, windowHeight / 2, 1)
  network = new NNetwork(player.inputs(human, ball, goal0), config.shape);
  players.push(player, human);
  player.render(10);
  ball.render();
  goal0.render();
  goal1.render();
}
function draw() {
  if (pause) return;
  background(255);
  logic(players, ball);
  time += 1;
  network.forward(player.inputs(human, ball, goal0));
  player.up(network.outputs[0] * modifier);
  player.side(network.outputs[1] * modifier);
  human.up(keyIsDown(DOWN_ARROW) ? 10 : 0);
  human.up(keyIsDown(UP_ARROW) ? -10 : 0);
  human.side(keyIsDown(RIGHT_ARROW) ? 10 : 0);
  human.side(keyIsDown(LEFT_ARROW) ? -10: 0);
  player.render()
  human.render()
  for (let l = network.layers.length - 1; l >= 0; l--) {
    network.layers[l].render((l + 1) * 30, 10, 60);
  }
  if (time > config.time) {
    if (player.s > bestScore) {
      bestGenome = network.genome;
      bestScore = player.s;
    }
    network.genome = bestGenome;
    policy.input = player.s;
    time = 0;
    result = 0;
    reset(players, ball);
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
  players[0].x = windowWidth / 3;
  players[0].y = windowHeight / 2;
  players[0].s = 0;
  players[1].x = windowWidth * 2 / 3;
  players[1].y = windowHeight / 2;
  players[1].s = 0;
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