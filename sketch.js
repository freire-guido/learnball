class NLayer {
  constructor(size, inputs, position) {
    this.outputs = new Array(size);
    this.weights = new Array(size);
    this.biases = new Array(size);
    this.pos = position;
    //Initialize random weights and biases
    if (this.pos != 0){
      for (let o=0; o<this.weights.length; o++){
        this.weights[o] = new Array(inputs.length);
        this.biases[o] = Math.random();
        for (let i=0; i<inputs.length; i++){
          this.weights[o][i] = Math.random();
        }
      }
    }
    else {
      this.outputs = inputs;

    }
  }
  forward(inputs){
    for (let o=0; o<this.outputs.length; o++){
      for (let i=0; i<inputs.length; i++){
        this.outputs[o] += inputs[i]*this.weights[o][i];
      }
      this.outputs[o] += this.biases[o];
    }
  }
}
var players0 = [];
var players1 = [];
var team0 = [];
var team1 = [];

function setup(){
  windowWidth -= 90;
  windowHeight -= 90;
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  let inputs = [];
  //Create players, balls and goals
  for (let i=0; i<2; i++){
    players0.push(new Player(round(random(width/2)), round(random(height)), 0));
    players1.push(new Player(round(random(width/2, windowWidth)), round(random(height)), 1));
    inputs.push(players0[i].x, players0[i].y, players1[i].x, players1[i].y);
  }
  goal0 = new Goal(0, windowHeight/2);
  goal1 = new Goal(windowWidth, windowHeight/2);
  ball = new Ball(windowWidth/2, windowHeight/2);
  inputs.push(ball.x, ball.y);
  //Create networks
  team0.push(new NLayer(inputs.length, inputs, 0));
  team0.push(new NLayer(4, team0[0].outputs, 1));
  team0.push(new NLayer(4, team0[1].outputs, 2));
  team0.push(new NLayer(players0.length*3, team0[2].outputs, 3));
}

function draw(){
  background(255);
  logic(players0, players1, ball);
  //Render objects
  for (let i=0; i<players0.length; i++){
    players0[i].render();
    players1[i].render();
  }
  ball.render();
  goal0.render();
  goal1.render();
}

function Player(xx,yy,tt){
  this.t = tt;
  this.r = 20;
  this.x = xx;
  this.y = yy;
  this.kick = false;
  this.forward = (f)=> {
    this.y += f;
  }
  this.side = (s)=> {
    this.x += s;
  }
  this.render = ()=> {
    this.kick = false;
    if (this.t==1){
      fill(0,0,255);
    }
    else {
      fill(255,0,0)
    }
    ellipse(this.x, this.y, this.r*2);
  }
}

function Ball(xx,yy){
  this.r = 10;
  this.x = xx;
  this.y = yy;
  this.collision = (dx,dy,kick)=> {
    if (kick){
      this.x -= dx*4;
      this.y -= dy*4;
    }
    else{
      this.x -= dx;
      this.y -= dy;
    }
  }
  this.render = ()=> {
    fill(0,255,0);
    ellipse(this.x, this.y, this.r*2);
  }
}

function Goal(xx,yy){
  this.x = xx;
  this.y = yy;
  this.render = ()=> {
    rect(this.x, this.y, 40, 160);
  }
}

function logic(players0, players1, ball) {
  this.players = players0.concat(players1);
  //Player-ball collision logic
  for (let i=0; i<players.length; i++){
    var dx = players[i].x - ball.x;
    var dy = players[i].y - ball.y;
    if (sqrt(sq(dx)+sq(dy)) < ball.r + players[i].r){
      ball.collision(dx, dy, players[i].kick);
    }
  }
  //Goal detection logic
  if (ball.x < 40 && ball.y < goal0.y+40 && goal0.y-40 < ball.y){
    ball.x = windowWidth/2;
    ball.y = windowHeight/2;
  }
  if (ball.x < 40 && ball.y < goal1.y+40 && goal1.y-40 < ball.y){
    ball.x = windowWidth/2;
    ball.y = windowHeight/2;
  }
}