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

Template.home.events({
    'click .startGame': function(event){
        console.log("Starting RACEEEE!!!!");
        initModel();
    },
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

    //top5.picture = Images.find({_id: {$in: Meteor.users.find(top5.id).profile["picture"]}});

};

Template.colours.helpers({
    colours: function(){
        return [["#ff9900", "Orange"], ["#ff3300", "Red"], ["#FFBAD2","Pink"], ["#000000","Black"], ["#ffffff", "White"], ["#0000FF","Blue"]]
    }
});

Template.colours.events({
    "change #colour-select": function (event, template) {
        var category = $(event.currentTarget).val();
        console.log("category : " + category);
        Racers.update( {_id:Racers.findOne({id:Meteor.userId()})['_id']}, {$set: {carColour:category}});
        // additional code to do what you want with the category
    }
});

/*
function init() {
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, 400 / 400, 0.1, 1000);
    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(400, 400);
    renderer.shadowMapEnabled = true;
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(60, 20, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;
    // add the plane to the scene
    scene.add(plane);
    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    var cubeMaterial = new THREE.MeshLambertMaterial({color: 0xff0000});
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    // position the cube
    cube.position.x = -4;
    cube.position.y = 3;
    cube.position.z = 0;
    // add the cube to the scene
    scene.add(cube);
    var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x7777ff});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // position the sphere
    sphere.position.x = 20;
    sphere.position.y = 0;
    sphere.position.z = 2;
    sphere.castShadow = true;
    // add the sphere to the scene
    scene.add(sphere);
    // position and point the camera to the center of the scene
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);
    // add the output of the renderer to the html element
    document.getElementById("game").appendChild(renderer.domElement);
    // call the render function
    var step = 0;
    renderScene();
    function renderScene() {
        // rotate the cube around its axes
        cube.rotation.x += 0.02;
        cube.rotation.y += 0.02;
        cube.rotation.z += 0.02;
        // bounce the sphere up and down
        step += 0.04;
        sphere.position.x = 20 + ( 10 * (Math.cos(step)));
        sphere.position.y = 2 + ( 10 * Math.abs(Math.sin(step)));
        // render using requestAnimationFrame
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    }
}
*/


//window.onload = initModel;

console.log("JADKNWJKDNAWKJDNJW")

//updatePlayer(playerStates[0]);



//window.onload = initModel;

