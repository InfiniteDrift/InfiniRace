/**
 * Created by klug§ on 2015-12-10.
 */
Meteor.subscribe("racers")
Meteor.subscribe("players")

carColours = [["#ff9900", "Orange"], ["#ff3300", "Red"], ["#FFBAD2","Pink"], ["#000000","Black"], ["#ffffff", "White"], ["#0000FF","Blue"]]

//console.log(Meteor.call('GetPlayerState'));


/*Meteor.startup(function(){
    Meteor._reload.reload();
});*/


reload = true;

Template.loadGame.helpers({
    start : function() {
        /*console.log(reload);
        if(reload === true){
            Meteor._reload.reload();
            reload = false;
            console.log(reload);
        }*/
        Meteor.defer(function () {
            console.log("DOM is loaded")
            initModel();
            var s = new buzz.sound('InfiniRace.mp3');
            s.play();

        });
    }
});


Template.home.events({
    /*'click .startGame': function(event){
        console.log("Starting RACEEEE!!!!");
        initModel();
    },*/
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
    },
    'click #gameHref':function(){
        //document.location.reload(true);
        //Meteor._reload.reload();
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
    var racers =  Racers.find({}, {sort: {score:-1}, limit: 5});
    var userId = racers.map(function(p) { return p.userId});
    var users = Meteor.users.find({_id: {$in: userId}});
    var profilePic = users.map(function(p) {return p.profile["picture"]});
    var images = Images.find({_id: {$in: profilePic}});
    console.log([
        racers,
        images
    ]);
    return racers;
    //top5.picture = Images.find({_id: {$in: Meteor.users.find(top5.id).profile["picture"]}});
};

Template.racersTable.helpers({
    racers : function () {
        return Racers.find({}, {sort: {score: -1}, limit: 5});
    }
});



Template.colours.helpers({
    colours: function(){
        var currentColour = Racers.findOne({userId:Meteor.userId()}).carColour;
        var map = new Map(carColours);
        var colourName = map.get(currentColour);
        var selected = [];
        if(typeof colourName !== undefined) {
            selected = [[currentColour, colourName]]
        } else {
            selected = [["","Please select"]]
        }
        return selected.concat(carColours)

    }
});

Template.colours.events({
    "change #colour-select": function (event, template) {
        var category = $(event.currentTarget).val();
        console.log("category : " + category);
        Racers.update( {_id:Racers.findOne({userId:Meteor.userId()})['_id']}, {$set: {carColour:category}});
        // additional code to do what you want with the category
    }
});
