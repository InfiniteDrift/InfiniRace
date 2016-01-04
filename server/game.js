/**
 * Created by sebastian on 03/01/16.
 */

//////////////////////////////////////////////////////////////
/////////////////// Server-side functions ////////////////////
//////////////////////////////////////////////////////////////



var maxForce = 0.1;
var maxAngle = Math.PI/2;
var roadWidth = 3;

var carModel;
var carMass = 1380;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;
var floorLevel;




var playerStates = [
    {
        userId: "0",
        posx: 0,
        posy: floorLevel,
        posz: roadCurve(0),
        velocity: 0,
        direction: roadDirection(0),
        acceleration: { amount: 0, direction: roadDirection(0) },
        score: 0,
        carColour: "#123123"
    }
];

function GetPlayerState() {
    return Racers.findOne({userId: Meteor.userId()});
}

function GetPlayerStates() {
    var players = [];
    Racers.find().forEach( function(player) {
        players.push(player);
    });
    console.log(players);
    return players;
}

var maxSpeed = 0.25;


function Break(amount) {
    var state = GetPlayerState();
    var velocity = 0;
    if (amount >= 0 && amount <= 1) {
        if (state.velocity > 0) {
            velocity -= maxSpeed/amount;
            if (state.velocity < 0) {
                velocity = 0;
            }
        } else {
            velocity = 0;
        }
    }
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {velocity:velocity}});
}

function Gas(amount) {
    var state = GetPlayerState();
    var velocity = 0;

    if (amount > 0 && amount <= 1) {
        if (state.velocity < maxSpeed) {
            velocity += 0.0001 + Math.sqrt(amount*state.velocity);
        } else if (state.velocity == 0) {
            velocity = 0.001;
        } else {
            velocity = maxSpeed;
        }
    }
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {velocity:velocity}});
}

function recalcPlayer(state) {
    var dt = (1/60);
    var interval = dt*1000;
    var posx = state.posx + -Math.sin(state.direction)*state.velocity*20*dt;
    var posz = state.posz + -Math.cos(state.direction)*state.velocity*20*dt;
    setTimeout(recalcPlayer, interval, state);
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {posx:posx, posz:posz}});
}

function recalcPlayers() {
    var t = 50;
    var playerStates = GetPlayerStates();
    for (var i = 0; i < playerStates.length; i++) {
        recalcPlayer(playerStates[i]);
    }
}

function Reset() {
    var posx = GetPlayerState().posx;
    if (posx < 0) {
        posx = 0;
    }
    var posz = roadCurve(posx);
    var direction = roadDirection(posx);
    var velocity = 0;
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {posx:posx, posz:posz, direction:direction, velocity:velocity}});
}

function TurnLeft(amount) {
    var state = GetPlayerState();
    var direction;
    if (amount >= 0 && amount <= 1) {
        if (state.direction < maxAngle+roadDirection(state.posx)) {
            direction = state.direction + (0.1*amount)*(Math.PI/5);
        } else {
            direction = maxAngle+roadDirection(state.posx);
        }
    }
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {direction:direction}});
}

function TurnRight(amount) {
    var state = GetPlayerState();
    var direction;
    if (amount >= 0 && amount <= 1) {
        if (state.direction > -maxAngle+roadDirection(state.posx)) {
            direction = state.direction - (0.1*amount)*(Math.PI/5);
        } else {
            direction = -maxAngle+roadDirection(state.posx);
        }
    }
    Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {direction:direction}});
}
