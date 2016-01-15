
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

// Server globals

//var angleOffset = -Math.PI/2;
maxAngle = Math.PI/3;
roadWidth = 3;
idleSpeed = 880;// 880 rpm -- http://m-power.lv/files_misc/E30%20m3%20repair%20manual/miscellaneous/engine_information.htm

GearRatio = function(gear) {
    // http://www.s14.net/specplus/comparisons.html
    if (gear == 1) {
        return 3.72;
    } else if (gear == 2) {
        return 2.40;
    } else if (gear == 3) {
        return 1.77;
    } else if (gear == 4) {
        return 1.26;
    } else if (gear == 5) {
        return 1;
    } else if (gear == -1) {
        return 4.23;
    } else {
        return 0;
    }
}
