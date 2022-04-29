var c = 0;
var aiPos = 0;
var walls = 0;
var avoided = 0;
var crash = 0;

function tick(){
  c++;
  document.getElementById("stepsDone").value = c;
  moveWall();
  checkCollision();
  experience();
}

var tickInterval;

function runSimulation(state){
  if(state == 1){ //run the simulation
    if (c > 100){
      runSimulation('0'); //force stop after 100 steps
    } else {
      tickInterval = setInterval("tick();", document.getElementById("interval").value); //tick every 100ms
    }
  } else { //stop the simulation
    clearInterval(tickInterval);
    c=0;
    document.getElementById("stepsDone").value = c;
    document.getElementById("wall").style.left = null;
    document.getElementById("wall").style.right = "0px";
    document.getElementById("ai").style.marginTop = "50px";
    aiPos = 0;
    walls = 0;
    avoided = 0;
    crash = 0;

  }
}

function moveWall(){
  var wall = document.getElementById("wall");
  var debugTextArea = document.getElementById("debugTextArea");

  var getWallX = wall.offsetLeft;
  var getWallY = wall.offsetTop;

  var getAIX = document.getElementById("sensor_2").offsetLeft+500;
  var getAIY = document.getElementById("ai").offsetTop;

  var successRate = Math.floor((avoided/(avoided+crash)*100));

  var getWallCentre = (getWallY-100)+50;

  if(getWallCentre <= 150){
    document.getElementById("t_wall_zone").innerHTML = "0";
  } else {
    document.getElementById("t_wall_zone").innerHTML = "1";
  }

  var getAICentre = (getAIY-100)+25;

  if(getAICentre <= 150){
    document.getElementById("t_ai_zone").innerHTML = "0";
  } else {
    document.getElementById("t_ai_zone").innerHTML = "1";
  }

  document.getElementById("topDebug").innerHTML = "&nbsp;Step: ["+c+"]<br>&nbsp;Wall ("+getWallX+", "+getWallY+")<br>&nbsp;AI ("+getAIX+", "+getAIY+")<br>Walls: "+walls+", Avoided: "+avoided+", Crashed: "+crash+", Success Rate: "+successRate+"%";

  if (getWallX <=0){
    walls++;
  } else {
    getWallX -= 20;
    wall.style.left = getWallX + "px";
  }
}

function moveCar(direction){

  if (aiPos<50){aiPos=50;}
  if (aiPos>200){aiPos=200;}

  if(direction == "down"){
    aiPos += 10;
  } else {
    aiPos -= 10;
  }

  document.getElementById('ai').style.marginTop = aiPos + "px";
}

function checkCollision(){
  var getWallX = document.getElementById("wall").offsetLeft;
  var getWallY = document.getElementById("wall").offsetTop+100;

  var getAIX = document.getElementById("sensor_2").offsetLeft+500;
  var getAIY = document.getElementById("ai").offsetTop;

  if (getWallX < getAIX && getAIY >= getWallY-100 && getAIY < getWallY || getWallX < getAIX && getWallY-100 > getAIY && getWallY-100 < getAIY+50){
    experience();
    document.getElementById("sensor_2").style.backgroundColor = "red";

    if (getWallX <= 0){crash++;}
  } else {
    document.getElementById("sensor_2").style.backgroundColor = "white";
    if(getWallX <= 0){avoided++;}
  }
}

var lastWallCount = 0;
var lastAvoided = 0;
var lastCrash = 0;
var tryzone = 0;


function experience(){
  var aizone, wallzone;

  //get wall and AI zone
  var getWallY = document.getElementById("wall").offsetTop;
  var getAIY = document.getElementById("ai").offsetTop;

  var getWallCentre = (getWallY-100)+50;

  if(getWallCentre <= 150){
    document.getElementById("t_wall_zone").innerHTML = "0";
    wallzone="0";
  } else {
    document.getElementById("t_wall_zone").innerHTML = "1";
    wallzone="1";
  }

  var getAICentre = (getAIY-100)+25;

  if(getAICentre <= 150){
    document.getElementById("t_ai_zone").innerHTML = "0";
    aizone = "0";
  } else {
    document.getElementById("t_ai_zone").innerHTML = "1";
    aizone = "1";
  }

  //trying
  document.getElementById("t_trying").innerHTML = "0";

  if (tryzone == 0){moveCar("up");} else {moveCar("down");}

  //read from experience database
  var buildvar = aizone+wallzone+tryzone;
  var experienceDB = document.getElementById("succ_"+buildvar).innerHTML;

  //read from DB AND DECIDE
  if(tryzone==0){
    buildvarOther = aizone+wallzone+1;
    experienceDBOther = document.getElementById("succ_"+buildvarOther).innerHTML;
    if(parseInt(experienceDBOther) > parseInt(experienceDB)+parseInt(10)){
      buildvar = buildvarOther;
      var experienceDB = document.getElementById("succ_"+buildvar).innerHTML;
      tryzone = 1;
    }
  }

  if(tryzone==1){
    buildvarOther = aizone+wallzone+0;
    experienceDBOther = document.getElementById("succ_"+buildvarOther).innerHTML;
    if(parseInt(experienceDBOther) > parseInt(experienceDB)+parseInt(10)){
      buildvar = buildvarOther;
      var experienceDB = document.getElementById("succ_"+buildvar).innerHTML;
      tryzone = 0;
    }
  }

  //update DB only when wall has passed
  if (lastWallCount != walls) {

    if(lastAvoided != avoided){
      experienceDB = parseInt(experienceDB)+parseInt(1);
      document.getElementById("succ_"+buildvar).innerHTML = experienceDB;
      lastAvoided = avoided;
    }

    if(lastCrash != crash){
      experienceDB = parseInt(experienceDB)-parseInt(1);
      document.getElementById("succ_"+buildvar).innerHTML = experienceDB;
      lastCrash = crash;
    }

    lastWallCount = walls;
    tryzone = Math.floor(Math.random()*2); //random between 0 and 1


    //randomise wall positions
    var randomWallYPos = Math.floor(Math.random() * (200+1) +0);
    document.getElementById("wall").style.marginTop = randomWallYPos + "px";

    document.getElementById("wall").style.left = null;
    document.getElementById("wall").style.right = "0px";
  }
}
