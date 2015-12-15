
/*imageStore = new FS.Store.GridFS("images", {
    chunkSize: 1024*1024  // optional, default GridFS chunk size in bytes (can be overridden per file).
                          // Default: 2MB. Reasonable range: 512KB - 4MB
});*/

Images = new FS.Collection("images", {
    stores: [new FS.Store.FileSystem("images", {path: "~/uploads"})]
});

Racers = new Mongo.Collection('racers');
console.log('hej');





