var players0=[];
var players1=[];
function setup(){
  windowWidth -= 90;
  windowHeight -= 90;
  createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  //Create players, balls and goals
  for (let i=0; i<5; i++){
    players0.push(new Player(round(random(width/2)), round(random(height)), 0));
  }
  goal0 = new Goal(0, windowHeight/2);
  for (let i=0; i<5; i++){
    players1.push(new Player(round(random(width/2, windowWidth)), round(random(height)), 1));
  }
  goal1 = new Goal(1820, windowHeight/2);
  ball = new Ball(windowWidth/2, windowHeight/2);
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