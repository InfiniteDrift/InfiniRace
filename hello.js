Players = new Meteor.Collection("players");

if (Meteor.isClient) {
    // counter starts at 0
    Session.setDefault('counter', 0);

    UI.body.events({
        'change #fileInput': function (event) {
            FS.Utility.eachFile(event, function(file) {
                Images.insert(file);
            });
            $("form")[0].reset();
            console.log("Hej")
        }
    });

    Template.imageView.helpers({
        images: function () {
            return Images.find(); // Where Images is an FS.Collection instance
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"

    });

    Template.leaderboard.players = function () {
        return Players.find({}, {sort: {score:-1}});
    };

    Template.player.events = {
        'click': function () {
            Session.set("selected_player", this._id);
        }
    };
}

var imageStore = new FS.Store.GridFS("images", {
    chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes (can be overridden per file).
                          // Default: 2MB. Reasonable range: 512KB - 4MB
});

Images = new FS.Collection("images", {
    stores: [imageStore]
});

Racers = new Mongo.Collection('racers');
Racers.insert({id: "racer1", x: "1", y: "1"});
if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Players.find().count() === 0) {
            var names = ["Ada Lovelace",
                "Grace Hopper",
                "Marie Curie",
                "Carl Friedrich Gauss",
                "Nikola Tesla",
                "Claude Shannon"];
            for (var i = 0; i < names.length; i++)
                Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
        }
    });
  /*Meteor.publish('racers', function() {
    return Racers.find();
  });*/

    Images.allow({
        'insert': function () {
            // add custom authentication code here
            return true;
        }
    });
}

