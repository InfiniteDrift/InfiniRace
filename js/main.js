function MyFunction(x) {
    var y;
    y = 8 * (Math.sin ((1/2) * Math.PI * (x/32-4)) + Math.sin ((1/3) * Math.PI * (x/32-4)) + 2*Math.sin ((1/5) * Math.PI * (x/32-4)));
    return y;
}

function MyDerivative(x) {
    var y;
    y = 0.0261799*(12*Math.cos(0.019635*(x-128))+10*Math.cos(0.0327249*(x-128))+15*Math.cos(0.0490874*x));
    return y;
}

function rotationAtPoint(p) {
    return -(Math.PI/2 + Math.atan2(MyDerivative(p), 1));
}

///

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var vertexShader = document.getElementById( 'vertexShader' ).textContent;
var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
var bokehShader = document.getElementById( 'bokehShader' ).textContent;

///

var scene = new THREE.Scene();

///

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.x = -5;
camera.position.y = 3;
camera.position.z = MyFunction(0);
//camera.rotation.z = -Math.SQRT1_2;
camera.rotation.y = -Math.PI / 2;
//camera.rotation.x = -Math.PI / 8;

///

var carGeometry = new THREE.BoxGeometry( 2, 0.75, 3 );
var roadGeometry = new THREE.BoxGeometry( 7, 0.001, 2500 );
var treeGeometry = new THREE.BoxGeometry( 1, 4, 1 );
var markerGeometry = new THREE.BoxGeometry( 1, 0.5, 0.5 );
var greenMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, opacity: 1.0, transparent: false } );
var roadMaterial = new THREE.MeshLambertMaterial( { color: 0xdddddd, opacity: 1.0, transparent: false } );
var carBox = new THREE.Mesh( carGeometry, greenMaterial );
var roadBox = new THREE.Mesh( roadGeometry, roadMaterial );
var treeBox1 = new THREE.Mesh( treeGeometry, greenMaterial );
var treeBox2 = new THREE.Mesh( treeGeometry, greenMaterial );
var markerBox = new THREE.Mesh( markerGeometry, greenMaterial );
//scene.add( carBox );
//scene.add( roadBox );
//scene.add( treeBox1 );
//scene.add( treeBox2 );
carBox.position.y = 0.6;
roadBox.position.y = 0;
roadBox.position.z = 0.1;
treeBox1.position.x = 7;
treeBox2.position.z = 2;
treeBox2.position.x = -9;
treeBox2.position.z = -52;
carBox.castShadow = true;
roadBox.receiveShadow = true;

var thisGrid = new THREE.Group();
var nextGrid = new THREE.Group();
var gridSide = 1000;
function addGridTo(group) {
    var gridGeometry = new THREE.Geometry();
    gridGeometry.vertices.push(new THREE.Vector3( gridSide/2, 0, 0 ) );
    gridGeometry.vertices.push(new THREE.Vector3( -gridSide/2, 0, 0 ) );
    var linesMaterial = new THREE.LineBasicMaterial( { color: 0x4040ff, opacity: .2, linewidth: .1 } );
    var lineInterval = gridSide/100;
    for ( var i = 0; i <= gridSide; i ++ ) {
        var line = new THREE.Line( gridGeometry, linesMaterial );
        line.position.z = ( i * lineInterval ) - gridSide;
        group.add( line );
        line = new THREE.Line( gridGeometry, linesMaterial );
        line.position.x = ( i * lineInterval ) - gridSide/2;
        line.rotation.y = Math.PI / 2;
        group.add( line );
    }
}
addGridTo(thisGrid);
addGridTo(nextGrid);
var gridMid = -5;
thisGrid.position.x += gridMid;
nextGrid.position.x += gridMid + gridSide;
scene.add(thisGrid);
scene.add(nextGrid);

///

// http://stackoverflow.com/a/19303725


function getTrackPoints(p) {
    // returns { start: [x1, y1], end: [x2, y2] }
    // p is the track segment number; p is used for x, p+0.1 is used for y
    return new THREE.QuadraticBezierCurve(
        new THREE.Vector3(
            p,
            0.5,
            MyFunction(p)
        ), new THREE.Vector3(
            p+0.1,
            0.5,
            MyFunction(p+0.1)
        ), new THREE.Vector3(
            p+0.2,
            0.5,
            MyFunction(p+0.2)
        )
    );
}

function makeRoadSegment(p) {
    var curve = getTrackPoints(p);
    var path = new THREE.Path( curve.getPoints( 50 ) );
    var roadGeometry = path.createPointsGeometry( 50 );
    var roadSegmentMaterial = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: .25 } );
    var curveObject = new THREE.Line( roadGeometry, roadSegmentMaterial );
    return curveObject;
}

var roadWidth = 10;

function getLeftRoadVector(midVector) {
    var angle = Math.PI/2 + rotationAtPoint(midVector.x);
    var xL = midVector.x + (roadWidth/2)*Math.sin(angle);
    var zL = midVector.z + (roadWidth/2)*Math.cos(angle);
    var leftRoadVector = new THREE.Vector3(xL, midVector.y, zL);
    return leftRoadVector;
}

function getMidRoadVector(p) {
    return new THREE.Vector3(p, 0.01, MyFunction(p));
}

function getRightRoadVector(midVector) {
    var angle = -Math.PI/2 + rotationAtPoint(midVector.x);
    var xL = midVector.x + (roadWidth/2)*Math.sin(angle);
    var zL = midVector.z + (roadWidth/2)*Math.cos(angle);
    var rightRoadVector = new THREE.Vector3(xL, midVector.y, zL);
    return rightRoadVector;
}

function makeRoadLine(p) {
    var roadSegmentMaterial = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: .25 } );
    var roadSegmentGeometry = new THREE.Geometry();
    for (var i = 0; i < 1; i += 0.5) {
        roadSegmentGeometry.vertices.push(getMidRoadVector(p+i));
    }
    roadSegmentGeometry.vertices.push(getMidRoadVector(p + 1));
    var line = new THREE.Line( roadSegmentGeometry, roadSegmentMaterial );
    return line;
}

function makeLeftRoadLine(p) {
    var roadSegmentMaterial = new THREE.LineBasicMaterial( { color : 0x00ff00, linewidth: .25 } );
    var roadSegmentGeometry = new THREE.Geometry();
    for (var i = 0; i < 1; i += 0.5) {
        roadSegmentGeometry.vertices.push(getLeftRoadVector(getMidRoadVector(p+i)));
    }
    roadSegmentGeometry.vertices.push(getLeftRoadVector(getMidRoadVector(p + 1)));
    var line = new THREE.Line( roadSegmentGeometry, roadSegmentMaterial );
    return line;
}

function makeRightRoadLine(p) {
    var roadSegmentMaterial = new THREE.LineBasicMaterial( { color : 0x00ff00, linewidth: .25 } );
    var roadSegmentGeometry = new THREE.Geometry();
    for (var i = 0; i < 1; i += 0.5) {
        roadSegmentGeometry.vertices.push(getRightRoadVector(getMidRoadVector(p+i)));
    }
    roadSegmentGeometry.vertices.push(getRightRoadVector(getMidRoadVector(p + 1)));
    var line = new THREE.Line( roadSegmentGeometry, roadSegmentMaterial );
    return line;
}

///

scene.fog = new THREE.Fog( 0xffffff, 1, 5000 );
scene.fog.color.setHSL( 0.6, 0, 1 );
hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 500, 0 );
scene.add( hemiLight );
dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( -1, 1.75, 1 );
dirLight.position.multiplyScalar( 50 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadowMapWidth = 2048;
dirLight.shadowMapHeight = 2048;

var d = 50;

dirLight.shadowCameraLeft = -d;
dirLight.shadowCameraRight = d;
dirLight.shadowCameraTop = d;
dirLight.shadowCameraBottom = -d;

dirLight.shadowCameraFar = 3500;
dirLight.shadowBias = -0.0001;
var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
groundMat.color.setHSL( 0.095, 1, 0.75 );

var ground = new THREE.Mesh( groundGeo, groundMat );
ground.rotation.x = -Math.PI/2;
//scene.add( ground );

ground.receiveShadow = true;

var uniforms = {
    topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
    bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
    offset:		 { type: "f", value: 33 },
    exponent:	 { type: "f", value: 0.6 }
};
uniforms.topColor.value.copy( hemiLight.color );

scene.fog.color.copy( uniforms.bottomColor.value );

var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

var sky = new THREE.Mesh( skyGeo, skyMat );
scene.add( sky );

///

/*var loader = new THREE.BinaryLoader();
var car;
new loader.load("./js/veyron/VeyronNoUv_bin.js", function(carGeometry) {
    var orange    = new THREE.MeshLambertMaterial( { color: 0x995500, opacity: 1.0, transparent: false } );
    var mesh	= new THREE.Mesh( carGeometry, orange );
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.5;
    scene.add( mesh );
    car = mesh;
});
*/

var CARS = {
    "veyron": 	{
        name:	"Bugatti Veyron",
        url: 	"./js/veyron/VeyronNoUv_bin.js",
        author: '<a href="http://artist-3d.com/free_3d_models/dnm/model_disp.php?uid=1129" target="_blank">Troyano</a>',
        init_rotation: [ 0, 0, 0 ],
        scale: 5.5,
        init_material: 4,
        body_materials: [ 2 ],
        object: null,
        buttons: null,
        materials: null
    }
};
var loader = new THREE.BinaryLoader();

var mlib = {

    "Orange": 	new THREE.MeshLambertMaterial( { color: 0xff6600, combine: THREE.MixOperation, reflectivity: 0.3 } ),
    "Blue": 	new THREE.MeshLambertMaterial( { color: 0x001133, combine: THREE.MixOperation, reflectivity: 0.3 } ),
    "Red": 		new THREE.MeshLambertMaterial( { color: 0x660000, combine: THREE.MixOperation, reflectivity: 0.25 } ),
    "Black": 	new THREE.MeshLambertMaterial( { color: 0x000000, combine: THREE.MixOperation, reflectivity: 0.15 } ),
    "White":	new THREE.MeshLambertMaterial( { color: 0xffffff, combine: THREE.MixOperation, reflectivity: 0.25 } ),

    "Carmine": 	new THREE.MeshPhongMaterial( { color: 0x770000, specular:0xffaaaa, combine: THREE.MultiplyOperation } ),
    "Gold": 	new THREE.MeshPhongMaterial( { color: 0xaa9944, specular:0xbbaa99, shininess:50, combine: THREE.MultiplyOperation } ),
    "Bronze":	new THREE.MeshPhongMaterial( { color: 0x150505, specular:0xee6600, shininess:10, combine: THREE.MixOperation, reflectivity: 0.25 } ),
    "Chrome": 	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xffffff, combine: THREE.MultiplyOperation } ),

    "Orange metal": new THREE.MeshLambertMaterial( { color: 0xff6600, combine: THREE.MultiplyOperation } ),
    "Blue metal": 	new THREE.MeshLambertMaterial( { color: 0x001133, combine: THREE.MultiplyOperation } ),
    "Red metal": 	new THREE.MeshLambertMaterial( { color: 0x770000, combine: THREE.MultiplyOperation } ),
    "Green metal": 	new THREE.MeshLambertMaterial( { color: 0x007711, combine: THREE.MultiplyOperation } ),
    "Black metal":	new THREE.MeshLambertMaterial( { color: 0x222222, combine: THREE.MultiplyOperation } ),

    "Pure chrome": 	new THREE.MeshLambertMaterial( { color: 0xffffff } ),
    "Dark chrome":	new THREE.MeshLambertMaterial( { color: 0x444444 } ),
    "Darker chrome":new THREE.MeshLambertMaterial( { color: 0x222222 } ),

    "Black glass": 	new THREE.MeshLambertMaterial( { color: 0x101016, opacity: 0.975, transparent: true } ),
    "Dark glass":	new THREE.MeshLambertMaterial( { color: 0x101046, opacity: 0.25, transparent: true } ),
    "Blue glass":	new THREE.MeshLambertMaterial( { color: 0x668899, opacity: 0.75, transparent: true } ),
    "Light glass":	new THREE.MeshBasicMaterial( { color: 0x223344, opacity: 0.25, transparent: true, combine: THREE.MixOperation, reflectivity: 0.25 } ),

    "Red glass":	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.75, transparent: true } ),
    "Yellow glass":	new THREE.MeshLambertMaterial( { color: 0xffffaa, opacity: 0.75, transparent: true } ),
    "Orange glass":	new THREE.MeshLambertMaterial( { color: 0x995500, opacity: 0.75, transparent: true } ),

    "Orange glass 50":	new THREE.MeshLambertMaterial( { color: 0xffbb00, opacity: 0.5, transparent: true } ),
    "Red glass 50": 	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } ),

    "Fullblack rough":	new THREE.MeshLambertMaterial( { color: 0x000000 } ),
    "Black rough":		new THREE.MeshLambertMaterial( { color: 0x050505 } ),
    "Darkgray rough":	new THREE.MeshLambertMaterial( { color: 0x090909 } ),
    "Red rough":		new THREE.MeshLambertMaterial( { color: 0x330500 } ),

    "Darkgray shiny":	new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x050505 } ),
    "Gray shiny":		new THREE.MeshPhongMaterial( { color: 0x050505, shininess: 20 } )

};
var m;
var mi;
// Veyron materials
CARS[ "veyron" ].materials = {
    body: [
        [ "Orange metal", 	mlib[ "Orange metal" ] ],
        [ "Blue metal", 	mlib[ "Blue metal" ] ],
        [ "Red metal", 		mlib[ "Red metal" ] ],
        [ "Green metal",	mlib[ "Green metal" ] ],
        [ "Black metal", 	mlib[ "Black metal" ] ],
        [ "Gold", 		mlib[ "Gold" ] ],
        [ "Bronze", 	mlib[ "Bronze" ] ],
        [ "Chrome", 	mlib[ "Chrome" ] ]
    ],
};
m = CARS[ "veyron" ].materials;
mi = CARS[ "veyron" ].init_material;
CARS[ "veyron" ].mmap = {

    0: mlib[ "Black rough" ],		// tires + inside
    1: mlib[ "Pure chrome" ],		// wheels + extras chrome
    2: m.body[ mi ][ 1 ], 			// back / top / front torso
    3: mlib[ "Dark glass" ],		// glass
    4: mlib[ "Pure chrome" ],		// sides torso
    5: mlib[ "Pure chrome" ],		// engine
    6: mlib[ "Red glass 50" ],		// backlights
    7: mlib[ "Orange glass 50" ]	// backsignals

};
var myCar = new THREE.Group();
loader.load( CARS[ "veyron" ].url, function( geometry ) { createScene( geometry, "veyron" ) } );
function createScene( geometry, car ) {

    geometry.sortFacesByMaterialIndex();

    var m = new THREE.MeshFaceMaterial(),
        s = CARS[ car ].scale * 1,
        r = CARS[ car ].init_rotation,
        materials = CARS[ car ].materials,
        mi = CARS[ car ].init_material,
        bm = CARS[ car ].body_materials;

    for ( var i in CARS[ car ].mmap ) {

        m.materials[ i ] = CARS[ car ].mmap[ i ];

    }

    var mesh = new THREE.Mesh( geometry, m );

    mesh.rotation.x = r[ 0 ];
    mesh.rotation.y = r[ 1 ];
    mesh.rotation.z = r[ 2 ];
    mesh.rotation.y += Math.PI/2;

    mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.005;
    mesh.position.y += 0.5;
    scene.add( mesh );

    CARS[ car ].object = mesh;

}

myCar.add(CARS["veyron"].object);
myCar.position.x = 10;

/*
var dae;
var loader = new THREE.ColladaLoader();
//loader.options.convertUpAxis = true;
loader.load( './js/model.dae', function ( collada ) {
    dae = collada.scene;
    dae.scale.x = dae.scale.y = dae.scale.z = 0.001;
    dae.updateMatrix();
} );
scene.add( dae );
//dae.position.x = 10;
*/

///

var keyboard = new THREEx.KeyboardState();

var roadCurvesL = [];
//var roadCurvesM = [];
var roadCurvesR = [];
var pn = 75;
var roadCurveL = makeLeftRoadLine(Math.floor(pn));
//var roadCurveM = makeRoadLine(Math.floor(pn));
var roadCurveR = makeRightRoadLine(Math.floor(pn));
scene.add(roadCurveL);
//scene.add(roadCurveM);
scene.add(roadCurveR);
for (var i = -5; i <= pn; i++) {
    roadCurveL = makeLeftRoadLine(Math.floor(i));
    //roadCurveM = makeRoadLine(Math.floor(i));
    roadCurveR = makeRightRoadLine(Math.floor(i));
    roadCurvesL.push(roadCurveL);
    //roadCurvesM.push(roadCurveM);
    roadCurvesR.push(roadCurveR);
    scene.add(roadCurveL);
    //scene.add(roadCurveM);
    scene.add(roadCurveR);
}

markerBox.position.x = 0;
markerBox.position.y = 1;
markerBox.position.z = MyFunction(markerBox.position.x);
scene.add(markerBox);
var rawSpeed = 0;
var speed = 0;
gridMid += gridSide;
var markerYPos = 0;
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    carBox.rotation.y = 0;
    if( keyboard.pressed("up") ) {
        // Accelerating
        if (rawSpeed < 0.5) {
            rawSpeed += 0.005;
            if (rawSpeed > 1.5) {
                rawSpeed = 1.5;
            }
            speed = Math.tan(rawSpeed);
        } else {
            rawSpeed = 0.5;
            speed = Math.tan(rawSpeed);
        }
    }
    if (!keyboard.pressed("up") && !keyboard.pressed("down")) {
        // Non-accelerating
        if (rawSpeed > 0) {
            rawSpeed -= 0.001;
            if (rawSpeed < 0) {
                rawSpeed = 0;
            }
            speed = Math.tan(rawSpeed);
        } else {
            rawSpeed = 0;
            speed = Math.tan(rawSpeed);
        }
    }
    if( keyboard.pressed("down") ) {
        // Braking
        if (rawSpeed > 0) {
            rawSpeed -= 0.01;
            if (rawSpeed < 0) {
                rawSpeed = 0;
            }
            speed = Math.tan(rawSpeed);
        } else {
            rawSpeed = 0;
            speed = Math.tan(rawSpeed);
        }
    }
    if( keyboard.pressed("left") ) { carBox.rotation.y = 0.1; carBox.position.x -= 0.1; markerYPos -= 0.1; camera.position.x -= 0.1; }
    if( keyboard.pressed("right") ) { carBox.rotation.y = -0.1; carBox.position.x += 0.1; markerYPos += 0.1; }
    if( !keyboard.pressed("left") && !keyboard.pressed("right") ) { carBox.rotation.y = 0; }

    var travelling = -speed * Math.sin(rotationAtPoint(markerBox.position.x));
    if (pn < Math.floor(pn + travelling)) {
        pn += travelling;
        var curveToRemove = roadCurvesL.shift();
        scene.remove(curveToRemove);
        curveToRemove = null;
        //curveToRemove.dispose();
        //curveToRemove = roadCurvesM.shift();
        //scene.remove(curveToRemove);
        //curveToRemove.dispose();
        curveToRemove = roadCurvesR.shift();
        scene.remove(curveToRemove);
        curveToRemove = null;
        //curveToRemove.dispose();

        var roadCurveL = makeLeftRoadLine(Math.floor(pn));
        //var roadCurveM = makeRoadLine(Math.floor(pn));
        var roadCurveR = makeRightRoadLine(Math.floor(pn));
        roadCurvesL.push(roadCurveL);
        //roadCurvesM.push(roadCurveM);
        roadCurvesR.push(roadCurveR);
        scene.add(roadCurveL);
        //scene.add(roadCurveM);
        scene.add(roadCurveR);
    } else {
        pn += travelling;
    }
    markerBox.position.x += travelling;
    markerBox.position.z = MyFunction(markerBox.position.x);
    camera.position.x += travelling;
    if (camera.position.x > 0) {
        camera.position.z = MyFunction(camera.position.x);
        camera.rotation.y = rotationAtPoint(camera.position.x);
    }

    /*scene.remove(roadCurve);
     roadCurve.dispose();
     roadCurve = makeRoadSegment(Math.floor(pn));
     scene.add(roadCurve);*/

    treeBox1.position.z += 2;
    if (treeBox1.position.z > 5) {
        treeBox1.position.z = -100 - Math.random()*50;
        treeBox1.position.x = 7 + Math.random()*10;
        if (Math.random() > 0.25) {
            treeBox1.position.x *= -1;
        }
    }
    treeBox2.position.z += 2;
    if (treeBox2.position.z > 5) {
        treeBox2.position.z = -100 - Math.random()*50;
        treeBox2.position.x = -9 - Math.random()*10;
        if (Math.random() > 0.25) {
            treeBox2.position.x *= -1;
        }
    }
    if (camera.position.x >= gridMid) {
        var tmp = thisGrid;
        nextGrid = thisGrid;
        thisGrid = tmp;
        nextGrid.position.x += gridSide;
        gridMid += gridSide;
    }
}
render();
