/**
 * Created by klug§ on 2015-12-10.
 */

var maxForce = 0.1;
var maxAngle = Math.PI/2;
var roadWidth = 3;

var carModel;
var carMass = 1380;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;
var floorLevel;



Meteor.startup(function () {
    /*if (Racers.find().count() === 0) {
        var names = ["Ada Lovelace",
            "Grace Hopper",
            "Marie Curie",
            "Carl Friedrich Gauss",
            "Nikola Tesla",
            "Claude Shannon"];
        for (var i = 0; i < names.length; i++)
            Racers.insert({name: names[i],
                id: null, score: Math.floor(Math.random()*10)*5, posx: 0, posy: 0, posz:0, velocity: 0, direction:0, carColour: "#ffffff"});
    }*/
    Images.allow({
        'insert': function () {
            // add custom authentication code here
            return true;
        }
    });


    Meteor.setInterval(recalcPlayers, 1000/60);

    console.log('InfiniRace: Server started');

});

Meteor.publish('racers', function(){
    return Racers.find();
});

Accounts.onLogin(function(user){
    var id = user.user._id;
    console.log(id);

    var user = Meteor.users.findOne(id);
    console.log(user);

    if (Racers.find({userId: Meteor.userId() }).count() == 0){
        Racers.insert(
            {
                userId: Meteor.userId(),
                name: user.username,
                posx: 0,
                posy: roadCurve(0),
                posz: floorLevel,
                acceleration: true,
                rpm: idleSpeed,
                gear: 0,
                handbrake: 0,
                velocity: 0,
                direction: roadDirection(0),
                steerAngle: 0,
                score: 0,
                carColour: "#123123"
            }
        );
    }
});


