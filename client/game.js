//////////////////////////////////////////////////////////////
/////////////////// Client-side functions ////////////////////
//////////////////////////////////////////////////////////////


var gridSideLength = 100;

var renderer, scene, camera;
var gameElement, gameGUI;
var roads = 0;
var roadSegments = [];
var roadSegment;
var cars;

var keys = {
    "left": 0,
    "up": 0,
    "right": 0,
    "down": 0,
    "q": 0,
    "e": 0
};

var addGrids = function() {
    if (calcDistance(camera.position.x, camera.position.y, scene.nextGrid.position.x, scene.nextGrid.position.y) < gridSideLength/4) {
        var tmp = scene.nextGrid;
        scene.nextGrid = scene.thisGrid;
        scene.thisGrid = tmp;
        scene.nextGrid.translateX(2*gridSideLength);
    }
}

var addRoads = function() {
    if (roads - camera.position.x <= 50) {
        var oldSegment = roadSegments.shift();
        scene.remove(oldSegment);
        roadSegment = makeAndMoveRoadSegment(roads++);
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
}

var getCar = function(state) {
    if (state === undefined) {
        return undefined;
    }
    if (cars == undefined) {
        cars = Object();
    }
    if (cars[state.userId]  == undefined) {
        cars[state.userId] = initCar(state);
    }
    return cars[state.userId];
}

var initCamera = function() {
    gameElement = document.getElementById("game");
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.001, 1000 );
    // camera = new THREE.OrthographicCamera(window.innerWidth / -2048, window.innerWidth / 2048, window.innerHeight / 2048, window.innerHeight / -2048, -64, 128);
    function onResize() {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    gameElement.addEventListener('resize', onResize, false);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    camera.up = new THREE.Vector3(0,0,1);
    return camera;
}

var initCar = function(state) {
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
    wheel1.rotateZ(Math.PI);
    wheel1.rotation.order = "YXZ";
    scene.add(wheel1);
    newCar.add(wheel1);
    var wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.name = "wheel2";
    wheel2.translateX( 0.095);
    wheel2.translateY(-0.070);
    wheel2.translateZ(-0.195);
    wheel2.rotation.order = "YXZ";
    scene.add(wheel2);
    newCar.add(wheel2);
    var wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.name = "wheel3";
    wheel3.translateX(-0.095);
    wheel3.translateY(-0.070);
    wheel3.translateZ( 0.165);
    wheel3.rotateZ(Math.PI);
    wheel3.rotation.order = "YXZ";
    scene.add(wheel3);
    newCar.add(wheel3);
    var wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.name = "wheel4";
    wheel4.translateX( 0.095);
    wheel4.translateY(-0.070);
    wheel4.translateZ( 0.165);
    wheel4.rotation.order = "YXZ";
    scene.add(wheel4);
    newCar.add(wheel4);
    //new THREE.Vector3(0, -0.035, 0.165);
    //pivot.add(newCar);
    //newCar.pivotPoint = pivot;
    return newCar;
}

function keyLoop() {
    var state = Meteor.call('GetPlayerState');
    if (state === undefined) {
        setTimeout(keyLoop, 100/6);
        return;
    }
    if (keys.left != 0) {
        Meteor.call('TurnLeft', keys.left);
    } else if (state.steerAngle > 0 && state.velocity > 0) {
        Meteor.call('TurnRight', state.steerAngle * state.velocity / 80);
    }
    if (keys.up != 0) {
        Meteor.call('Accelerate', keys.up);
    }
    if (keys.right != 0) {
        Meteor.call('TurnRight', keys.right);
    } else if (state.steerAngle < 0 && state.velocity > 0) {
        Meteor.call('TurnLeft', -state.steerAngle * state.velocity / 80);
    }
    if (keys.down != 0) {
        Meteor.call('Decelerate', keys.down);
    }
    setTimeout(keyLoop, 100/6);
}

var initControls = function() {
    document.addEventListener('keydown', function( ev ) {
        switch ( ev.keyCode ) {
            case 13: // enter
                Meteor.call('Reset');
                break;

            case 32: // spacebar
                Meteor.call('Handbrake',1);
                break;

            case 37: // left
                keys.left = 1;
                break;

            case 38: // forward
                keys.up = 1;
                break;

            case 39: // right
                keys.right = 1;
                break;

            case 40: // back
                keys.down = 1;
                break;

            case 69: // E
                Meteor.call('ShiftUp');
                break;

            case 81: // Q
                Meteor.call('ShiftDown');
                break;
        }
    });
    document.addEventListener('keyup', function( ev ) {
        switch ( ev.keyCode ) {
            case 32: // spacebar
                Meteor.call('Handbrake',0);
                break;

            case 37: // left
                keys.left = 0;
                break;

            case 38: // forward
                keys.up = 0;
                break;

            case 39: // right
                keys.right = 0;
                break;

            case 40: // back
                keys.down = 0;
                break;
        }
    });
    keyLoop();
}

var initGame = function() {
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

var initGrid = function(gridLength) {
    scene.thisGrid = makeGrid(gridLength);
    scene.nextGrid = makeGrid(gridLength);
    var gridMid = -5;
    scene.thisGrid.position.x += gridMid;
    scene.nextGrid.position.x += gridMid + gridLength;
    scene.add(scene.thisGrid);
    scene.add(scene.nextGrid);
    scene.thisGrid.translateZ(-0.1);
    scene.nextGrid.translateZ(-0.1);
}

var initLights = function() {
    var hemisphereLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemisphereLight.color.setHSL( 0.6, 1, 0.6 );
    hemisphereLight.groundColor.setHSL( 206/360, 0.2, 0.5 );
    hemisphereLight.position.set( 0, 0, 500 );
    scene.add(hemisphereLight);
    scene.add(new THREE.AmbientLight("#0c0c0c"));
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.color.setHSL( 0.1, 1, 0.95 );
    directionalLight.position.set( -1, 1, 1.75 );
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
            geometry.center(new THREE.Vector3(0, 0.165, -0.035));
            var material = new THREE.MeshFaceMaterial(materials);
            carModel = new THREE.Mesh(geometry, material);//, 1258);
            //carModel.rotateY(-Math.PI/2);
            carBox = new THREE.Box3().setFromObject(carModel);
            meter = (Math.abs(carBox.max.y) + Math.abs(carBox.min.y))/1.2;
            floorLevel = 0.112;
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

var initRenderer = function() {
    gameElement = document.getElementById("game");
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;
    gameElement.appendChild(renderer.domElement);

    var dataElement = document.getElementById("data");
    var canvas = document.createElement('canvas');
    canvas.id = "gameData";
    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    canvas.style.zIndex   = 8;
    canvas.style.position = "absolute";
    dataElement.appendChild(canvas);
    gameGUI = canvas.getContext("2d");
}

var initRoad  = function() {
    for (roads = -5; roads <= 50; roads++) {
        roadSegment = makeAndMoveRoadSegment(roads);
        roadSegment.receiveShadow = true;
        scene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
}

var makeAndMoveRoadSegment = function(roadX) {
    var newRoadSegment = makeRoadPiece(roadX);
    return newRoadSegment;
}

var makeGrid = function(gridLength) {
    var group = new THREE.Group();
    var gridGeometry = new THREE.Geometry();
    gridGeometry.vertices.push(new THREE.Vector3( gridLength/2, 0, 0 ) );
    gridGeometry.vertices.push(new THREE.Vector3( -gridLength/2, 0, 0 ) );
    var linesMaterial = new THREE.LineBasicMaterial( { color: 0x4040ff, opacity: .2, linewidth: .1 } );
    var lineInterval = gridLength/100;
    for ( var i = 0; i <= gridLength; i++ ) {
        var line = new THREE.Line(gridGeometry, linesMaterial);
        line.position.y = ( i * lineInterval ) - gridLength/2;
        group.add( line );
        line = new THREE.Line( gridGeometry, linesMaterial );
        line.position.x = ( i * lineInterval ) - gridLength/2;
        line.rotation.z = Math.PI / 2;
        group.add( line );
    }
    return group;
}

var makeRoadPiece = function(roadX) {
    var roadMaterial = new THREE.MeshLambertMaterial({ color: "#222222" });
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
    roadShape.moveTo(botMidVector.x, botMidVector.y);
    roadShape.lineTo(botLeftVector.x, botLeftVector.y);
    roadShape.bezierCurveTo(mid1LeftVector.x, mid1LeftVector.y, mid2LeftVector.x, mid2LeftVector.y, topLeftVector.x, topLeftVector.y);
    roadShape.lineTo(topMidVector.x, topMidVector.y);
    roadShape.lineTo(topRightVector.x, topRightVector.y);
    roadShape.bezierCurveTo(mid2RightVector.x, mid2RightVector.y, mid1RightVector.x, mid1RightVector.y, botRightVector.x, botRightVector.y);
    roadShape.lineTo(botMidVector.x, botMidVector.y);
    var extrudeSettings = { amount: 0.001, bevelEnabled: false, bevelSegments: 0, steps: 1, bevelSize: 0, bevelThickness: 0 };
    var geometry = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
    return new THREE.Mesh(geometry, roadMaterial, 0);
}

var moveCamera = function(state) {
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
        camera.position.set(newX, roadCurve(newX), 0.5);
        camera.lookAt(getCar(state).position);//new THREE.Vector3(getCar(state).position.x + distance*0, roadCurve(getCar(state).position.x + distance*0), 0));
    } else {
        camera.rotateX(0.01);
        camera.rotateZ(0.04);
        camera.rotateY(0.02);
    }
}

var renderGameScene = function() {
    updatePlayers(Meteor.call('GetPlayerStates'));
    moveCamera(Meteor.call('GetPlayerState'));
    addGrids();
    addRoads();
    requestAnimationFrame(renderGameScene);
    renderer.render(scene, camera);
    if (gameGUI != undefined) {
        gameGUI.clearRect(0, 0, window.innerWidth / 2, window.innerHeight / 2);
        var state = Meteor.call('GetPlayerState');
        if (state === undefined) {
            return;
        }
        gameGUI.font = '20pt Calibri';
        gameGUI.fillStyle = 'yellow';
        gameGUI.fillText("RPM: " + Math.round(state.rpm / 10) * 10, 50, 50);
        gameGUI.fillText("Gear: " + state.gear, 50, 75);
        gameGUI.fillText("Speed: " + Math.round(state.velocity * 36) / 10 + " km/h", 50, 100);
        gameGUI.font = '30pt Calibri';
        gameGUI.fillText("Score: " + Math.round(state.score * 10) / 10 + "!", 50, 125);
    }
}

var updateCar = function(car, state) {
    /* Move a 3D car object that may or may not belong to _this_ player. */
    car.position.x = state.posx;
    car.position.y = state.posy;
    car.position.z = floorLevel;
    car.rotation.x = Math.PI/2;
    car.rotation.y = state.direction - Math.PI / 2;
    car.getObjectByName("wheel1").rotation.y = state.steerAngle;
    car.getObjectByName("wheel1").rotation.x -= state.velocity/0.25;
    car.getObjectByName("wheel2").rotation.y = state.steerAngle;
    car.getObjectByName("wheel2").rotation.x += state.velocity/0.25;
    car.getObjectByName("wheel3").rotation.x -= state.velocity/0.25;
    car.getObjectByName("wheel4").rotation.x += state.velocity/0.25;
}

var updatePlayers = function(players) {
    if (players === undefined) {
        return;
    }
    for (var i = 0; i < players.length; i++) {
        if (getCar(players[i])) {
            updateCar(getCar(players[i]), players[i]);
        } else {
            cars[players[i].userId] = initCar(players[i]);
            updateCar(getCar(players[i]), players[i]);
        }
    }
}
