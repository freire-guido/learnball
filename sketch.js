class NLayer {
  constructor(size, inputs, position) {
    this.inputs = inputs;
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
  forward(){
    for (let o=0; o<this.outputs.length; o++){
      this.outputs[o] = 0;
      for (let i=0; i<this.inputs.length; i++){
        this.outputs[o] += this.inputs[i]*this.weights[o][i];
        console.log(this.outputs[o]);
      }
      this.outputs[o] += this.biases[o];
    }
  }
}
var team0 = [];
var team1 = [];
var network0 =[];
var network1 =[];
var network2 =[];
var network3 =[];

function setup(){
  windowWidth -= 90;
  windowHeight -= 90;
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  let inputs = [];
  //Create players, balls and goals
  for (let i=0; i<2; i++){
    team0.push(new Player(round(random(width/2)), round(random(height)), 0));
    team1.push(new Player(round(random(width/2, windowWidth)), round(random(height)), 1));
    inputs.push(team0[i].x, team0[i].y, team1[i].x, team1[i].y);
  }
  goal0 = new Goal(0, windowHeight/2);
  goal1 = new Goal(windowWidth, windowHeight/2);
  ball = new Ball(windowWidth/2, windowHeight/2);
  inputs.push(ball.x, ball.y);
  //Create networks
  network0.push(new NLayer(inputs.length, inputs, 0));
  network0.push(new NLayer(4, network0[0].outputs, 1));
  network0.push(new NLayer(4, network0[1].outputs, 2));
  network0.push(new NLayer(3, network0[2].outputs, 3));
  network1.push(new NLayer(inputs.length, inputs, 0));
  network1.push(new NLayer(4, network1[0].outputs, 1));
  network1.push(new NLayer(4, network1[1].outputs, 2));
  network1.push(new NLayer(3, network1[2].outputs, 3));
  network2.push(new NLayer(inputs.length, inputs, 0));
  network2.push(new NLayer(4, network2[0].outputs, 1));
  network2.push(new NLayer(4, network2[1].outputs, 2));
  network2.push(new NLayer(3, network2[2].outputs, 3));
  network3.push(new NLayer(inputs.length, inputs, 0));
  network3.push(new NLayer(4, network3[0].outputs, 1));
  network3.push(new NLayer(4, network3[1].outputs, 2));
  network3.push(new NLayer(3, network3[2].outputs, 3));
}

function draw(){
  background(255);
  for (let i=1; i<network0.length; i++){
    network0[i].forward();
  }
  team0[0].up(network0[3].outputs[0]);
  team0[0].side(network0[3].outputs[1]);
  logic(team0, team1, ball);
  //Render objects
  for (let i=0; i<team0.length; i++){
    team0[i].render();
    team1[i].render();
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
  this.up = (f)=> {
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

function logic(team0, team1, ball) {
  this.players = team0.concat(team1);
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