/**
 * Created by klug§ on 2015-12-10.
 */
Meteor.subscribe("racers")
Meteor.subscribe("players")

//console.log(Meteor.username)

/*
Meteor.startup(function(){
    var user = Meteor.user().username;
    console.log(user.profile);
    if (Racers.find({id: Meteor.userId() }).count() == 0){
        Racers.insert({name: user, score: 100, posX: 0, posY: 0, velocity: 0, angle: 0, id:Meteor.userId()});
    }
});
*/


//Racers.insert({name: names[i], score: Math.floor(Math.random()*10)*5, posX: 0, posY: 0, velocity: 0, angle: 0, id:
// null});

//For loading of custom js post load
/*Template.layout.rendered = function () {
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
 };*/


UI.body.events({
    //Profile pic upload
    'change #fileInput': function (event) {
        var id;
        FS.Utility.eachFile(event, function(file) {
            id = Images.insert(file)
        });
        $("form")[0].reset();
        console.log(id._id);

        //Delete old profile pic from db
        if ( typeof Meteor.user().profile["picture"] !== 'undefined') {
            Images.remove(Meteor.user().profile["picture"])
        }
        Meteor.users.update(Meteor.userId(), {$set: {"profile.picture": id._id}});
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
        return Images.find({_id: Meteor.user().profile["picture"]}); // Where Images is an FS.Collection instance
    }
});


Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"

});

Template.leaderboard.racers = function () {
    return Racers.find({}, {sort: {score:-1}, limit: 5});
};

Template.colours.helpers({
    colours: function(){
        return [["#ff9900", "Orange"], ["#ff3300", "Red"], ["#FFBAD2","Pink"], ["#000000","Black"], ["#ffffff", "White"], ["#0000FF","Blue"]]
    }
});

Template.colours.events({
    "change #colourSelect": function (event, template) {
        var category = $(event.currentTarget).val();
        console.log("category : " + category);
        // additional code to do what you want with the category
    }
});