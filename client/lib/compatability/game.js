//////////////////////////////////////////////////////////////
///////////////////////// It begins! /////////////////////////
//////////////////////////////////////////////////////////////

// Server globals

//var angleOffset = -Math.PI/2;
var maxForce = 0.1;
var maxAngle = Math.PI/2;
var roadWidth = 3;

var carModel;
var carMass = 1380;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;
var floorLevel;


console.log(Test());

//////////////////////////////////////////////////////////////
/////////////////// Client-side functions ////////////////////
//////////////////////////////////////////////////////////////


var gridSideLength = 100;

var renderer, scene, camera;
var gameElement;
var roads = 0;
var roadSegments = [];
var roadSegment;
var cars;

function addGrids() {
    if (calcDistance(camera.position.x, camera.position.z, scene.nextGrid.position.x, scene.nextGrid.position.z) < gridSideLength/4) {
        var tmp = scene.nextGrid;
        scene.nextGrid = scene.thisGrid;
        scene.thisGrid = tmp;
        scene.nextGrid.translateX(2*gridSideLength);
    }
}

function addRoads() {
    if (roads - camera.position.x <= 50) {
        var oldSegment = roadSegments.shift();
        scene.remove(oldSegment);
        roadSegment = makeAndMoveRoadSegment(roads++);
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
}

function getCar(state) {
    if (cars == undefined) {
        cars = Object();
    }
    if (cars[state.userId]  == undefined) {
        cars[state.userId] = initCar(state);
    }
    return cars[state.userId];
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.001, 1000 );
    // OrthographicCamera(window.innerWidth / -2048, window.innerWidth / 2048, window.innerHeight / 2048, window.innerHeight / -2048, -64, 128);
    function onResize() {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize, false);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    return camera;
}

function initCar(state) {
    var newCar = carModel;
    newCar.material.materials[30].color = new THREE.Color("#FF0000");
    newCar.material.materials[57].color = new THREE.Color("#FF0000");
    newCar.material.materials[254].color = new THREE.Color("#000000");
    newCar.material.materials[254].transparent = true;
    newCar.material.materials[254].opacity = 0.8;
    newCar.material.materials[256].color = new THREE.Color("#000000");
    newCar.material.materials[256].transparent = true;
    newCar.material.materials[256].opacity = 0.8;
    newCar.material.materials[258].color = new THREE.Color("#000000");
    newCar.material.materials[258].transparent = true;
    newCar.material.materials[258].opacity = 0.8;
    newCar.material.materials[389].color = new THREE.Color("#000000");
    newCar.material.materials[389].transparent = true;
    newCar.material.materials[389].opacity = 0.8;
    newCar.material.materials[295].color = new THREE.Color(state.carColour);
    newCar.material.materials[488].color = new THREE.Color(state.carColour);
    newCar.material.materials[495].color = new THREE.Color(state.carColour);
    newCar.material.materials[556].color = new THREE.Color(state.carColour);
    newCar.material.materials[564].color = new THREE.Color(state.carColour);
    newCar.material.materials[622].color = new THREE.Color(state.carColour);
    newCar.material.materials[666].color = new THREE.Color(state.carColour);
    newCar.material.materials[686].color = new THREE.Color(state.carColour);
    newCar.material.materials[690].color = new THREE.Color(state.carColour);
    newCar.material.materials[701].color = new THREE.Color(state.carColour);
    newCar.castShadow = true;
    scene.add(newCar);
    var wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.name = "wheel1";
    wheel1.translateX(-0.095);
    wheel1.translateY(-0.070);
    wheel1.translateZ(-0.195);
    wheel1.rotateY(Math.PI);
    scene.add(wheel1);
    newCar.add(wheel1);
    var wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.name = "wheel2";
    wheel2.translateX( 0.095);
    wheel2.translateY(-0.070);
    wheel2.translateZ(-0.195);
    scene.add(wheel2);
    newCar.add(wheel2);
    var wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.name = "wheel3";
    wheel3.translateX(-0.095);
    wheel3.translateY(-0.070);
    wheel3.translateZ( 0.165);
    wheel3.rotateY(Math.PI);
    scene.add(wheel3);
    newCar.add(wheel3);
    var wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.name = "wheel4";
    wheel4.translateX( 0.095);
    wheel4.translateY(-0.070);
    wheel4.translateZ( 0.165);
    scene.add(wheel4);
    newCar.add(wheel4);
    //new THREE.Vector3(0, -0.035, 0.165);
    //pivot.add(newCar);
    //newCar.pivotPoint = pivot;
    return newCar;
}

function initControls() {
    document.addEventListener('keydown', function( ev ) {
        switch ( ev.keyCode ) {
            case 37: // left
                TurnLeft(1);
                break;

            case 38: // forward
                Gas(1);
                break;

            case 39: // right
                TurnRight(1);
                break;

            case 40: // back
                Break(1);
                break;

            case 13: // enter
                Reset();
                break;
        }
    });
    document.addEventListener('keyup', function( ev ) {
        switch ( ev.keyCode ) {
            case 37: // left
                break;

            case 38: // forward
                break;

            case 39: // right
                break;

            case 40: // back
                break;
        }
    });
}

function initGame() {
    initRenderer();
    scene = new THREE.Scene();
    initCamera();
    initLights();
    initGrid(gridSideLength);
    initRoad();
    initControls();
    requestAnimationFrame(renderGameScene);
    renderer.render(scene, camera);
}

function initGrid(gridLength) {
    scene.thisGrid = makeGrid(gridLength);
    scene.nextGrid = makeGrid(gridLength);
    var gridMid = -5;
    scene.thisGrid.position.x += gridMid;
    scene.nextGrid.position.x += gridMid + gridLength;
    scene.add(scene.thisGrid);
    scene.add(scene.nextGrid);
    scene.thisGrid.translateY(-0.1);
    scene.nextGrid.translateY(-0.1);
}

function initLights() {
    var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemisphereLight.color.setHSL( 0.6, 1, 0.6 );
    hemisphereLight.groundColor.setHSL( 206/360, 0.2, 0.5 );
    hemisphereLight.position.set( 0, 500, 0 );
    scene.add(hemisphereLight);
    scene.add(new THREE.AmbientLight("#0c0c0c"));
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL( 0.1, 1, 0.95 );
    directionalLight.position.set( -1, 1.75, 1 );
    directionalLight.position.multiplyScalar( 50 );
    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;
    var d = 50;
    directionalLight.shadowCameraLeft = -d;
    directionalLight.shadowCameraRight = d;
    directionalLight.shadowCameraTop = d;
    directionalLight.shadowCameraBottom = -d;
    directionalLight.shadowCameraFar = 3500;
    directionalLight.shadowBias = -0.0001;
    scene.add(directionalLight);
}

initModel = function() {
    var ldr = new THREE.JSONLoader();
    ldr.load(
        "bmw_no_wheels.json",
        function(geometry, materials) {
            geometry.center(new THREE.Vector3(0, -0.035, 0.165));
            var material = new THREE.MeshFaceMaterial(materials);
            carModel = new THREE.Mesh(geometry, material);//, 1258);
            carBox = new THREE.Box3().setFromObject(carModel);
            floorLevel = carBox.max.y + 0.013;
            meter = (Math.abs(carBox.max.y) + Math.abs(carBox.min.y))/1.2;
            ldr.load(
                "bmw_wheel.json",
                function(wGeometry, wMaterials) {
                    wGeometry.center();
                    wheelGeometry = wGeometry;
                    wheelMaterial = new THREE.MeshFaceMaterial(wMaterials);
                    initGame();
                }
            );
        }
    );
};

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    gameElement = document.getElementById("game");
    gameElement.appendChild(renderer.domElement);
}

function initRoad() {
    for (roads = -5; roads <= 50; roads++) {
        roadSegment = makeAndMoveRoadSegment(roads);
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
}

function makeAndMoveRoadSegment(roadX) {
    var newRoadSegment = makeRoadPiece(roadX);
    newRoadSegment.rotateX(Math.PI/2);
    return newRoadSegment;
}

function makeGrid(gridLength) {
    var group = new THREE.Group();
    var gridGeometry = new THREE.Geometry();
    gridGeometry.vertices.push(new THREE.Vector3( gridLength/2, 0, 0 ) );
    gridGeometry.vertices.push(new THREE.Vector3( -gridLength/2, 0, 0 ) );
    var linesMaterial = new THREE.LineBasicMaterial( { color: 0x4040ff, opacity: .2, linewidth: .1 } );
    var lineInterval = gridLength/100;
    for ( var i = 0; i <= gridLength; i++ ) {
        var line = new THREE.Line(gridGeometry, linesMaterial);
        line.position.z = ( i * lineInterval ) - gridLength/2;
        group.add( line );
        line = new THREE.Line( gridGeometry, linesMaterial );
        line.position.x = ( i * lineInterval ) - gridLength/2;
        line.rotation.y = Math.PI / 2;
        group.add( line );
    }
    return group;
}

function makeRoadPiece(roadX) {
    var roadMaterial = new THREE.MeshLambertMaterial({ color: "#111111" });
    var roadShape = new THREE.Shape();
    var botMidVector = getMidRoadVector(roadX);
    var botLeftVector = getPointOnLeftLineForX(botMidVector, roadWidth);
    var botRightVector = getPointOnRightLineForX(botMidVector, roadWidth);
    var mid1MidVector = getMidRoadVector(roadX + 1/3);
    var mid1LeftVector = getPointOnLeftLineForX(mid1MidVector, roadWidth);
    var mid1RightVector = getPointOnRightLineForX(mid1MidVector, roadWidth);
    var mid2MidVector = getMidRoadVector(roadX + 2/3);
    var mid2LeftVector = getPointOnLeftLineForX(mid2MidVector, roadWidth);
    var mid2RightVector = getPointOnRightLineForX(mid2MidVector, roadWidth);
    var topMidVector = getMidRoadVector(roadX + 1);
    var topLeftVector = getPointOnLeftLineForX(topMidVector, roadWidth);
    var topRightVector = getPointOnRightLineForX(topMidVector, roadWidth);
    roadShape.moveTo(botMidVector.x, botMidVector.z);
    roadShape.lineTo(botLeftVector.x, botLeftVector.z);
    roadShape.bezierCurveTo(mid1LeftVector.x, mid1LeftVector.z, mid2LeftVector.x, mid2LeftVector.z, topLeftVector.x, topLeftVector.z);
    roadShape.lineTo(topMidVector.x, topMidVector.z);
    roadShape.lineTo(topRightVector.x, topRightVector.z);
    roadShape.bezierCurveTo(mid2RightVector.x, mid2RightVector.z, mid1RightVector.x, mid1RightVector.z, botRightVector.x, botRightVector.z);
    roadShape.lineTo(botMidVector.x, botMidVector.z);
    var extrudeSettings = { amount: 0.001, bevelEnabled: false, bevelSegments: 0, steps: 1, bevelSize: 0, bevelThickness: 0 };
    var geometry = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
    return new THREE.Mesh(geometry, roadMaterial, 0);
}

function moveCamera(state) {
    if (getCar(state) != undefined) {
        var newX;
        var distance = 2;
        if (state.posx < distance) {
            newX = state.posx - distance;
        } else {
            var i;
            for (i = 0.0; calcDistance(state.posx, roadCurve(state.posx), state.posx-i, roadCurve(state.posx-i)) < distance; i += 0.01 ) {}
            newX = state.posx - i;
        }
        camera.position.set(newX, 0.5, roadCurve(newX));
        camera.lookAt(getCar(state).position);//new THREE.Vector3(getCar(state).position.x + distance*0, 0, roadCurve(getCar(state).position.x + distance*0)));
    }
}

function renderGameScene() {
    updatePlayers(GetPlayerStates());
    moveCamera(GetPlayerState());
    addGrids();
    addRoads();
    requestAnimationFrame(renderGameScene);
    renderer.render(scene, camera);
}

function updateCar(car, state) {
    /* Move a 3D car object that may or may not belong to _this_ player. */
    car.position.x = state.posx;
    car.position.y = 0.12;
    car.position.z = state.posz;
    car.rotation.y = state.direction;
    car.getObjectByName("wheel1").rotation.x -= state.velocity/0.25;
    car.getObjectByName("wheel2").rotation.x += state.velocity/0.25;
    car.getObjectByName("wheel3").rotation.x -= state.velocity/0.25;
    car.getObjectByName("wheel4").rotation.x += state.velocity/0.25;
}

function updatePlayers(players) {
    for (var i = 0; i < players.length; i++) {
        if (getCar(players[i])) {
            updateCar(getCar(players[i]), players[i]);
        } else {
            cars[players[i].userId] = initCar(players[i]);
            updateCar(getCar(players[i]), players[i]);
        }
    }
}






































//////////////////////////////////////////////////////////////
/////////////////// Server-side functions ////////////////////
//////////////////////////////////////////////////////////////

var playerStates = [
    {
        userId: "0",
        posx: 0,
        posy: floorLevel,
        posz: roadCurve(0),
        velocity: 0,
        direction: roadDirection(0),
        acceleration: { amount: 0, direction: roadDirection(0) },
        score: 0,
        carColour: "#123123"
    }
];

var maxSpeed = 0.25;

function Break(amount) {
    var state = GetPlayerState();
    if (amount >= 0 && amount <= 1) {
        if (state.velocity > 0) {
            state.velocity -= maxSpeed/amount;
            if (state.velocity < 0) {
                state.velocity = 0;
            }
        } else {
            state.velocity = 0;
        }
    }
}

function Gas(amount) {
    var state = GetPlayerState();
    if (amount > 0 && amount <= 1) {
        if (state.velocity < maxSpeed) {
            state.velocity += 0.0001 + Math.sqrt(amount*state.velocity);
        } else if (state.velocity == 0) {
            state.velocity = 0.001;
        } else {
            state.velocity = maxSpeed;
        }
    }
}

function GetPlayerState() {
    return playerStates["0"];
}

function GetPlayerStates() {
    var players = [];
    Racers.find().forEach( function(player) {
        players.push(player);
    });
    console.log(players);
    return players;
}

function Meteor_userId() {
    return "0";
}

function recalcPlayer(state) {
    var dt = (1/60);
    var interval = dt*1000;
    state.posx += -Math.sin(state.direction)*state.velocity*20*dt;
    state.posz += -Math.cos(state.direction)*state.velocity*20*dt;
    setTimeout(recalcPlayer, interval, state);
}

function recalcPlayers() {
    var t = 50;
    for (var i = 0; i < GetPlayerStates().length; i++) {
        recalcPlayer(GetPlayerStates()[i]);
    }
}

function Reset() {
    if (GetPlayerState().posx < 0) {
        GetPlayerState().posx = 0;
    }
    GetPlayerState().posz = roadCurve(GetPlayerState().posx);
    GetPlayerState().direction = roadDirection(GetPlayerState().posx);
    GetPlayerState().velocity = 0;
}

function TurnLeft(amount) {
    var state = GetPlayerState();
    if (amount >= 0 && amount <= 1) {
        if (state.direction < maxAngle+roadDirection(state.posx)) {
            state.direction += (0.1*amount)*(Math.PI/5);
        } else {
            state.direction = maxAngle+roadDirection(state.posx);
        }
    }
}

function TurnRight(amount) {
    var state = GetPlayerState();
    if (amount >= 0 && amount <= 1) {
        if (state.direction > -maxAngle+roadDirection(state.posx)) {
            state.direction -= (0.1*amount)*(Math.PI/5);
        } else {
            state.direction = -maxAngle+roadDirection(state.posx);
        }
    }
}

recalcPlayers();

//////////////////////////////////////////////////////////////
/////////////////////////// START ////////////////////////////
//////////////////////////////////////////////////////////////

//window.onload = initModel;
