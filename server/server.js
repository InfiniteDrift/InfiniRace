/**
 * Created by klug§ on 2015-12-10.
 */
Meteor.startup(function () {
    if (Racers.find().count() === 0) {
        var names = ["Ada Lovelace",
            "Grace Hopper",
            "Marie Curie",
            "Carl Friedrich Gauss",
            "Nikola Tesla",
            "Claude Shannon"];
        for (var i = 0; i < names.length; i++)
            Racers.insert({name: names[i], score: Math.floor(Math.random()*10)*5, posX: 0, posY: 0, velocity: 0, id: null, colour: "#ffffff"});
    }
    Images.allow({
        'insert': function () {
            // add custom authentication code here
            return true;
        }
    });
});
Meteor.publish('racers', function(){
    return Racers.find();
});

Accounts.onLogin(function(user){
    var id = user.user._id
    console.log(id);

    var user = Meteor.users.findOne(id);
    console.log(user);

    if (Racers.find({id: Meteor.userId() }).count() == 0){
        Racers.insert({name: user.username, score: 100, posX: 0, posY: 0, velocity: 0, angle: 0, id:Meteor.userId()});
    }
});







