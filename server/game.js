//////////////////////////////////////////////////////////////
/////////////////// Server-side functions ////////////////////
//////////////////////////////////////////////////////////////

var airDensity = 1.2;// 1.2 kg/m^3
var standardGravity = 9.80665;// 9.80665 m/s^2 -- https://en.wikipedia.org/wiki/Standard_gravity

var frictionCoefficient = 0.80;// http://hpwizard.com/tire-friction-coefficient.html
var rollingResistanceCoefficient = 0.020;// http://hpwizard.com/tire-friction-coefficient.html

var mass = 1300;// 1300 kg --
var dragArea = 0.6204;// http://www.carinf.com/en/2a8057300.html
var wheelRadius = 0.30325;// 0.30325 m -- http://www.bmwmregistry.com/model_faq.php?id=8
var redline = 7300;// 7300 rpm
var wheelbase = 2.562;// 2.562 m -- http://www.carfolio.com/specifications/models/car/?car=56155
var weightDistribution = 0.52;// Towards the front. -- http://www.carfolio.com/specifications/models/car/?car=56155

var finalDriveRatio = 3.25;
var dt = (1/60);// Seconds per frame, for updating player state.

Meteor.methods({
   'GetPlayerState': function(){
       return Racers.findOne({userId: Meteor.userId()});
   },

   'GetPlayerStates': function() {
        var players = [];
        Racers.find().forEach( function(player) {
            players.push(player);
        });
        return players;
    },

    'Accelerate': function(amount) {
        var state = Meteor.call('GetPlayerState');
        var rpm = state.rpm;
        if (state.acceleration) {
            var rate;
            if (state.gear == 0) {
                rate = 11000;
            } else if (state.gear == 1) {
                rate = 8500;
            } else if (state.gear == 2) {
                rate = 1500;
            } else if (state.gear == 3) {
                rate = 900;
            } else if (state.gear == 4) {
                rate = 500;
            } else if (state.gear == 5) {
                rate = 300;
            } else {
                rate = 0;
            }
            rpm += rate * dt * amount;
        }
        if (amount > 0 && rpm > redline * 1.05) {
            rpm *= 0.95;
        }
        if (rpm < idleSpeed) {
            Meteor.call('Accelerate', 0.1);
        }
        Racers.update( {_id:state._id}, {$set: {rpm:rpm}});
    },

    'Decelerate': function(amount) {
        var state = Meteor.call('GetPlayerState');
        if (state === undefined) {
            return;
        }
        var rpm = state.rpm;
        var rate;
        if (state.gear == 0) {
            rate = 11000;
        } else if (state.gear == 1) {
            rate = 8500;
        } else if (state.gear == 2) {
            rate = 1500;
        } else if (state.gear == 3) {
            rate = 900;
        } else if (state.gear == 4) {
            rate = 500;
        } else if (state.gear == 5) {
            rate = 300;
        } else {
            rate = 0;
        }
        rpm -= rate * dt * amount;
        if (rpm < 0) {
            rpm = 0;
        }
        if (rpm < idleSpeed) {
            Meteor.call('Accelerate', 0.1);
        }
        Racers.update( {_id:state._id}, {$set: {rpm:rpm}});
    },

    'Handbrake': function(amount) {
        var state = Meteor.call('GetPlayerState');
        Racers.update( {_id:state._id}, {$set: {handbrake:amount}});
    },

   'TurnLeft' : function(amount) {
        var state = Meteor.call('GetPlayerState');
        var direction;
        if (amount >= 0 && amount <= 1) {
            if (state.direction < maxAngle+roadDirection(state.posx)) {
                direction = state.direction + (0.1*amount)*(Math.PI/5);
            } else {
                direction = maxAngle+roadDirection(state.posx);
            }
        }
        Racers.update( {_id:state._id}, {$set: {direction:direction}});
    },

   'TurnRight': function(amount) {
        var state = Meteor.call('GetPlayerState');
        var direction;
        if (amount >= 0 && amount <= 1) {
            if (state.direction > -maxAngle+roadDirection(state.posx)) {
                direction = state.direction - (0.1*amount)*(Math.PI/5);
            } else {
                direction = -maxAngle+roadDirection(state.posx);
            }
        }
        Racers.update( {_id:state._id}, {$set: {direction:direction}});
    },

   'Reset': function() {
        var state = Meteor.call('GetPlayerState');
        var posx = state.posx;
        if (posx < 0) {
            posx = 0;
        }
        var posy = roadCurve(posx);
        var direction = roadDirection(posx);
        var velocity = 0;
        Racers.update( {_id:state._id}, {$set: {posx:posx, posy:posy, direction:direction, velocity:velocity}});
    },

    'ShiftUp': function() {
        var state = Meteor.call('GetPlayerState');
        var newState = shiftGear(state, state.gear + 1);
        Racers.update( {_id:state._id}, {$set: {rpm:newState.rpm, gear:newState.gear}});
    },

    'ShiftDown': function() {
        var state = Meteor.call('GetPlayerState');
        var newState = shiftGear(state, state.gear - 1);
        Racers.update( {_id:state._id}, {$set: {rpm:newState.rpm, gear:newState.gear}});
    }


});

function rpmToTorque(rpm) {
    // Tuned S14B23 engine: http://www.m2bmw.com/jami.asp
    // Returns Nm
    if (rpm < idleSpeed) {
        return 100;
    } else if (rpm < 1700) {
        return 100 + 0.0488 * (rpm - idleSpeed);
    } else if (rpm < 2000) {
        return 140 + 0.2 * (rpm - 1700);
    } else if (rpm < 2500) {
        return 200 - 0.04 * (rpm - 2000);
    } else if (rpm < 3225) {
        return 180 + 0.0552 * (rpm - 2500);
    } else if (rpm < 4000) {
        return 220 + 0.0258 * (rpm - 3225);
    } else if (rpm < 4400) {
        return 240;
    } else if (rpm < 4750) {
        return 240 + 0.0571 * (rpm - 4400);
    } else if (rpm < 6000) {
        return 260 - 0.004 * (rpm - 4750);
    } else if (rpm < redline * 1.5) {
        // Engine surely broken!
        return 0;
    }
}

shiftGear = function(state, newGear) {
    //rpm_ny = rpm_old * gear(ny)/gear(old)
    var oldGear = state.gear;
    var oldRPM = state.rpm;
    var newRPM;
    if (oldGear == 0 || newGear == 0) {
        state.gear = newGear;
    } else if (newGear >= 1 && newGear <= 5) {
        newRPM = oldRPM * GearRatio(newGear) / GearRatio(oldGear);
        state.gear = newGear;
        //if (newRPM > redline * 1.05) {
        //    newRPM = redline * 1.05;
        //}
        state.rpm = newRPM;
    }
    return state;
}

wheelVelocity = function(velocity, rpm, gear) {
    if (gear == 0) {
        return velocity;
    } else {
        return (Math.PI * wheelRadius * rpm) / (30 * GearRatio(gear) * finalDriveRatio);
    }
}

recalcPlayer = function(state) {
    var wheelForce = (finalDriveRatio / wheelRadius) * GearRatio(state.gear) * rpmToTorque(state.rpm);
    var maximumTireFrictionalForce = frictionCoefficient * mass * standardGravity/* * Math.cos(slope) */;
    var propellingForce;
    if (wheelForce < maximumTireFrictionalForce) {
        propellingForce = wheelForce;
    } else {
        propellingForce = maximumTireFrictionalForce;
    }
    var rollingFrictionalForce = rollingResistanceCoefficient * mass * standardGravity/* * Math.cos(slope)*/;
    //var gravitationalForce = mass * standardGravity * Math.sin(slope);
    var dragForce = 0.5 * dragArea * airDensity * Math.pow(state.velocity, 2);
    var engineBrakingForce = 0;//(finalDriveRatio / wheelRadius) * gearRatio(state.gear) * (0.74 * state.rpm / 60);
    var totalForce = propellingForce - rollingFrictionalForce - dragForce - engineBrakingForce;
    // TODO: Use totalForce to decelerate! Without it, a car only slows down due to engine braking.
    // If throttling the engine too little, then RPM sinks due to resistance in the engine and from external factors.
    // If this leads to RPM below idle, the engine should shut off. But this is ignored for now.
    state.velocity = wheelVelocity(state.velocity, state.rpm, state.gear);
    if (state.velocity > 0 ) {
        var frontWheelX = state.posx + 0.195 * Math.cos(state.direction);
        var frontWheelY = state.posy + 0.195 * Math.sin(state.direction);
        var backWheelX = state.posx - 0.165 * Math.cos(state.direction);
        var backWheelY = state.posy - 0.165 * Math.sin(state.direction);
        frontWheelX += state.velocity * meter * dt * Math.cos(state.direction + state.steerAngle);
        frontWheelY += state.velocity * meter * dt * Math.sin(state.direction + state.steerAngle);
        backWheelX += state.velocity * meter * dt * Math.cos(state.direction);
        backWheelY += state.velocity * meter * dt * Math.sin(state.direction);
        state.posx = frontWheelX - 0.195 * Math.cos(state.direction);
        state.posy = frontWheelY - 0.195 * Math.sin(state.direction);
        if (state.posy > getMidRoadVector(state.posx).y + roadWidth) {
            state.posy = getMidRoadVector(state.posx).y + roadWidth;
            state.direction -= Math.PI / 4;
            state.rpm /= 2;
        } else if (state.posy < getMidRoadVector(state.posx).y - roadWidth) {
            state.posy = getMidRoadVector(state.posx).y - roadWidth;
            state.direction += Math.PI / 4;
            state.rpm /= 2;
        } else {
            state.direction = Math.atan2(frontWheelY - backWheelY, frontWheelX - backWheelX);
            var something = Math.sign(state.direction * state.steerAngle);
            //window.console.log("!" + state.direction + "   --   " + state.steerAngle + "   ------    " + (something * state.handbrake * state.velocity) * dt / Math.PI);
            state.direction += something * state.handbrake * state.velocity * dt / (Math.PI * 5);
        }
        if (state.velocity > 10 && state.handbrake > 0) {
            state.score += state.handbrake * state.velocity * dt;
        }
    }
    Meteor.call('Decelerate', state.handbrake);
    Meteor.call('Decelerate', 0.1);// Engine braking.
    Racers.update( {_id:state._id}, {$set: {posx:state.posx, posz:state.posz, direction:state.direction, rpm:state.rpm, velocity:state.velocity, score:state.score}});
};

recalcPlayers = function() {
    var playerStates = Meteor.call('GetPlayerStates');
    for (var i = 0; i < playerStates.length; i++) {
        recalcPlayer(playerStates[i]);
    }
    //setTimeout(recalcPlayers, dt * 1000);
};
