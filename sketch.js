var players=[];
function setup(){
  createCanvas(windowWidth-100, windowHeight-100);
  noStroke();
  rectMode(CENTER);
  //Create players, balls and goals
  for (let i=0; i<5; i++){
    players.push(new Player(round(random(width/2)), round(random(height))));
  }
  ball = new Ball(windowWidth/2, windowHeight/2);
  goalL = new Goal(0, windowHeight/2);
}

function draw(){
  background(255);
  //Move player around
  if (keyIsDown(UP_ARROW)){
    players[0].forward(-3);
  }
  if (keyIsDown(DOWN_ARROW)){
    players[0].forward(3);
  }
  if (keyIsDown(RIGHT_ARROW)){
    players[0].side(3);
  }
  if (keyIsDown(LEFT_ARROW)){
    players[0].side(-3);
  }
  if (keyIsDown(SHIFT)){
    players[0].kick = true;
  }
  var dx = players[0].x - ball.x;
  var dy = players[0].y - ball.y;
  //Player-ball collision logic
  if (sqrt(sq(dx)+sq(dy)) < ball.r + players[0].r){
    ball.collision(dx, dy, players[0].kick);
  }
  //Goal logic
  if (ball.x < 40 && ball.y < goalL.y+40 && goalL.y-40 < ball.y){
    ball.x = windowWidth/2;
    ball.y = windowHeight/2;
  }
  //Render objects
  players[0].render();
  ball.render();
  goalL.render();
}

function Player(xx,yy){
  this.r = 20;
  this.x = xx;
  this.y = yy;
  this.kick = false;
  this.forward = function(f){
    this.y += f;
  }
  this.side = function(s){
    this.x += s;
  }
  this.render = function(){
    this.kick = false;
    fill(0,255,0);
    ellipse(this.x, this.y, this.r*2);
  }
}

function Ball(xx,yy){
  this.r = 10;
  this.x = xx;
  this.y = yy;
  this.collision = function(dx,dy,kick){
    print("collision");
    if (kick){
      print("kick");
      this.x -= dx*4;
      this.y -= dy*4;
    }
    else{
      this.x -= dx;
      this.y -= dy;
    }
  }
  this.render = function(){
    fill(255,0,0);
    ellipse(this.x, this.y, this.r*2);
  }
}

function Goal(xx,yy){
  this.x = xx;
  this.y = yy;
  this.render = function(){
    rect(this.x, this.y, 40, 160);
  }
}