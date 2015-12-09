Players = new Meteor.Collection("players");

if (Meteor.isClient) {

    Meteor.subscribe('racers')


    Template.layout.rendered = function () {
        console.log(Racers.find().fetch())
        console.log("hej")
        $('body').append("<script src='https://ajax.googleapis.com/ajax/libs/jquery/{{JQUERY_VERSION}}/jquery.min.js'></script> " +
            "<script>window.jQuery || document.write('<script src='compatibility/vendor/jquery-{{JQUERY_VERSION}}.min.compatibility'><\/script>/')</script>" +
            "<script src='client/compatibility/plugins.js'></script>" +
            "<script src='client/compatibility/three.min.js'></script>" +
            "<script src='client/compatibility/BinaryLoader.js'></script>" +
            "<script src='client/compatibility/THREEx.KeyboardState.js'></script>" +
            "<script type='x-shader/x-vertex' src='client/compatibility/shader.vs' id='vertexShader'></script>" +
            "<script type='x-shader/x-fragment' src='client/compatibility/shader.fs' id='fragmentShader'></script>" +
            "<script type='x-shader/x-fragment' src='client/compatibility/bokeh.fs' id='bokehShader'></script>" +
            "<script src='client/compatibility/main.js'></script>");
    };

    UI.body.events({
        'change #fileInput': function (event) {
            FS.Utility.eachFile(event, function(file) {
                Images.insert(file);
            });
            $("form")[0].reset();
            console.log("Hej")
        }
    });

    Template.body.events({
        'click .StartGame': function(){
            render();
            console.log("Button was clicked");
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
    Meteor.publish('racers', function(){
        return Racers.find()
    });


    Images.allow({
        'insert': function () {
            // add custom authentication code here
            return true;
        }
    });
}

