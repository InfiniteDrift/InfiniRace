
/*imageStore = new FS.Store.GridFS("images", {
    chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes (can be overridden per file).
                          // Default: 2MB. Reasonable range: 512KB - 4MB
});*/

Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});

Racers = new Mongo.Collection('racers');


var Test = function() {
    console.log("test");
};



var maxForce = 0.1;
var maxAngle = Math.PI/2;
var roadWidth = 3;

var carModel;
var carMass = 1380;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;
var floorLevel;

