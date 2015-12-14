
//////////////////////////////////////////////////////////////
///////////////////////// It begins! /////////////////////////
//////////////////////////////////////////////////////////////

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;

//////////////////////////////////////////////////////////////
/////////////////////// Game functions ///////////////////////
//////////////////////////////////////////////////////////////



function roadCurve(x) {
    if (x < 0) {
        return roadCurve(0);
    }
    x *= 10;
    var y;
    y = 2 * (Math.sin ((1/2) * Math.PI * (x/32-4)) + Math.sin ((1/3) * Math.PI * (x/32-4)) + 2*Math.sin ((1/5) * Math.PI * (x/32-4)));
    return y;
}

function roadCurveDerivative(x) {
    if (x < 0) {
        return roadCurveDerivative(0);
    }
    x *= 10;
    var y;
    y = 0.0261799*(12*Math.cos(0.019635*(x-128))+10*Math.cos(0.0327249*(x-128))+15*Math.cos(0.0490874*x));
    return y;
}

function roadDirection(x) {
    if (x < 0) {
        return roadDirection(0);
    }
    return -(Math.PI / 2 + Math.atan2(roadCurveDerivative(x), 1));
}

var carModel;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;

//////////////////////////////////////////////////////////////
/////////////////// Convenience functions ////////////////////
//////////////////////////////////////////////////////////////

var floorLevel;

function MoveCar(car, state) {
    car.position.x = state.posx;
    car.position.y = floorLevel;
    car.position.z = state.posz;
    car.rotation.y = state.direction;
}

function calcDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2,2));
}

function MoveCamera(camera, car, state) {
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
    camera.lookAt(new THREE.Vector3(car.position.x + distance*0, 0, roadCurve(car.position.x + distance*0)));
}

//////////////////////////////////////////////////////////////
///////////////////////// Server API /////////////////////////
//////////////////////////////////////////////////////////////

var playerStates = [];
var angleOffset = -Math.PI/2;
var maxSpeed = 0.1;
var maxAngle = Math.PI/2;

playerStates.push({
    id: 0,
    posx: 0,
    posy: 0,
    posz: 0,
    velocity: 0,
    acceleration: { amount: 0, direction: angleOffset },
    direction: angleOffset,
    score: 0,
    carColour: "#123123"
});

function getPlayerState(player) {
    return {
        posx: playerStates[player].posx,
        posy: playerStates[player].posy,
        posz: playerStates[player].posz,
        velocity: playerStates[player].velocity,
        acceleration: playerStates[player].acceleration,
        direction: playerStates[player].direction,
        score: playerStates[player].score,
        carColour: playerStates[player].carColour
    }
}

function updatePlayer(state) {
    var t = 50;
    state.posx += -Math.sin(state.direction)*state.velocity*20*t/1000;
    state.posz += -Math.cos(state.direction)*state.velocity*20*t/1000;

/*
    if (state.posz > getRightRoadVector(getMidRoadVector(state.posx))) {
        var d = 0;
        for (var stepSize = 0.01; state.posz > getRightRoadVector(getMidRoadVector(state.posx)); d += stepSize) {
            state.posx -= state.velocity.x*t * stepSize;
            state.posz -= state.velocity.y*t * stepSize;
        }
        state.direction += Math.PI/2;
        state.posx += d * Math.cos(state.direction);
        state.posz += d * Math.sin(state.direction);
        state.velocity.x *= (1/2) * Math.cos(state.direction);
        state.velocity.y *= (1/2) * Math.sin(state.direction);
    }/* else if (state.posz < getLeftRoadVector(getMidRoadVector(state.posx))) {
        var d = 0;
        for (var stepSize = 0.01; state.posz < getLeftRoadVector(getMidRoadVector(state.posx)); d += stepSize) {
            state.posx -= state.velocity.x*t * stepSize;
            state.posz -= state.velocity.y*t * stepSize;
        }
        state.direction -= Math.PI/2;
        state.posx += d * Math.cos(state.direction);
        state.posz += d * Math.sin(state.direction);
        state.velocity.x *= (1/2) * Math.cos(state.direction);
        state.velocity.y *= (1/2) * Math.sin(state.direction);
    } else {
        state.velocity.x -= 0.1 * Math.cos(state.direction);
        state.velocity.y -= 0.1 * Math.sin(state.direction);
    }*/
    //Break(state.id, 0.1);
    setTimeout(updatePlayer, t, state);
}

function Gas(id, amount) {
    var state = playerStates[id];
    if (amount >= 0 && amount <= 1) {
        if (state.velocity < maxSpeed) {
            state.velocity += maxSpeed/amount;
        } else {
            state.velocity = maxSpeed;
        }
    }
}

function Break(id, amount) {
    var state = playerStates[id];
    if (amount >= 0 && amount <= 1) {
        if (state.velocity > 0) {
            state.velocity -= maxSpeed/amount;
        } else {
            state.velocity = 0;
        }
    }
}

function TurnLeft(id, amount) {
    var state = playerStates[id];
    window.console.log(state.direction);
    if (amount >= 0 && amount <= 1) {
        if (state.direction < maxAngle+angleOffset) {
            state.direction += 0.1*amount;
        } else {
            state.direction = maxAngle+angleOffset;
        }
    }
}

function TurnRight(id, amount) {
    var state = playerStates[id];
    if (amount >= 0 && amount <= 1) {
        if (state.direction > -maxAngle+angleOffset) {
            state.direction -= 0.1*amount;
        } else {
            state.direction = -maxAngle+angleOffset;
        }
    }
}

//////////////////////////////////////////////////////////////
///////////////////////// Grid stuff /////////////////////////
//////////////////////////////////////////////////////////////

var gridSideLength = 100;

function addGridTo(group, gridLength) {
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
}

var thisGrid = new THREE.Group();
var nextGrid = new THREE.Group();

function initGrid(scene, gridLength) {
    addGridTo(thisGrid, gridLength);
    addGridTo(nextGrid, gridLength);
    var gridMid = -5;
    thisGrid.position.x += gridMid;
    nextGrid.position.x += gridMid + gridLength;
    scene.add(thisGrid);
    scene.add(nextGrid);
    thisGrid.translateY(-0.1);
    nextGrid.translateY(-0.1);
}

//////////////////////////////////////////////////////////////
///////////////////////// Road stuff /////////////////////////
//////////////////////////////////////////////////////////////

var roadMaterial = new THREE.MeshLambertMaterial({ color: "#111111" });

function makeRoadPiece(x) {
    var roadShape = new THREE.Shape();
    var botMidVector = getMidRoadVector(x);
    var botLeftVector = getLeftRoadVector(botMidVector, roadWidth_);
    var botRightVector = getRightRoadVector(botMidVector, roadWidth_);
    var mid1MidVector = getMidRoadVector(x + 1/3);
    var mid1LeftVector = getLeftRoadVector(mid1MidVector, roadWidth_);
    var mid1RightVector = getRightRoadVector(mid1MidVector, roadWidth_);
    var mid2MidVector = getMidRoadVector(x + 2/3);
    var mid2LeftVector = getLeftRoadVector(mid2MidVector, roadWidth_);
    var mid2RightVector = getRightRoadVector(mid2MidVector, roadWidth_);
    var topMidVector = getMidRoadVector(x + 1);
    var topLeftVector = getLeftRoadVector(topMidVector, roadWidth_);
    var topRightVector = getRightRoadVector(topMidVector, roadWidth_);
    roadShape.moveTo(botMidVector.x, botMidVector.z);
    roadShape.lineTo(botLeftVector.x, botLeftVector.z);
    roadShape.bezierCurveTo(mid1LeftVector.x, mid1LeftVector.z, mid2LeftVector.x, mid2LeftVector.z, topLeftVector.x, topLeftVector.z);
    roadShape.lineTo(topMidVector.x, topMidVector.z);
    roadShape.lineTo(topRightVector.x, topRightVector.z);
    roadShape.bezierCurveTo(mid2RightVector.x, mid2RightVector.z, mid1RightVector.x, mid1RightVector.z, botRightVector.x, botRightVector.z);
    roadShape.lineTo(botMidVector.x, botMidVector.z);
    var extrudeSettings = { amount: 0.01, bevelEnabled: false, bevelSegments: 0, steps: 1, bevelSize: 0, bevelThickness: 0 };
    var geometry = new THREE.ExtrudeGeometry(roadShape, extrudeSettings);
    return new THREE.Mesh(geometry, roadMaterial, 0);
}

function makeAndMoveRoadSegment(x, material) {
    var newRoadSegment = makeRoadPiece(x, material);
    newRoadSegment.rotateX(Math.PI/2);
    return newRoadSegment;
}

var roadWidth_ = 3;

function getLeftRoadVector(midVector, roadWidth) {
    var angle = Math.PI/2 + roadDirection(midVector.x);
    var xL = midVector.x + (roadWidth/2)*Math.sin(angle);
    var zL = midVector.z + (roadWidth/2)*Math.cos(angle);
    return new THREE.Vector3(xL, midVector.y, zL);
}

function getMidRoadVector(p) {
    return new THREE.Vector3(p, 0.01, roadCurve(p));
}

function getRightRoadVector(midVector, roadWidth) {
    var angle = -Math.PI/2 + roadDirection(midVector.x);
    var xL = midVector.x + (roadWidth/2)*Math.sin(angle);
    var zL = midVector.z + (roadWidth/2)*Math.cos(angle);
    return new THREE.Vector3(xL, midVector.y, zL);
}
var roads;
var roadSegments = [];
var roadSegment;

//////////////////////////////////////////////////////////////
///////////////////////// Game Scene /////////////////////////
//////////////////////////////////////////////////////////////

var gameScene = new THREE.Scene();
var playerCar;

var gameCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 1000 );
// OrthographicCamera(window.innerWidth / -2048, window.innerWidth / 2048, window.innerHeight / 2048, window.innerHeight / -2048, -64, 128);

function onResize() {
    gameCamera.aspect = window.innerWidth/window.innerHeight;
    gameCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize, false);

gameCamera.aspect = window.innerWidth/window.innerHeight;
gameCamera.updateProjectionMatrix();

var playerStateClientSide = {
    posx: undefined,
    posy: undefined,
    posz: undefined,
    velocity: undefined,
    acceleration: { amount: undefined, direction: undefined },
    direction: undefined,
    score: undefined,
    decal: undefined,
    carColour: undefined
};

function initControls() {
    document.addEventListener('keydown', function( ev ) {
        switch ( ev.keyCode ) {
            case 37: // left
                TurnLeft(0, 1);
                break;

            case 38: // forward
                Gas(0, 1);
                break;

            case 39: // right
                TurnRight(0, 1);
                break;

            case 40: // back
                Break(0, 1);
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

function renderGameScene() {
    //playerStateClientSide.posx -= 0.003*roadDirection(playerStateClientSide.posx);
    //playerStateClientSide.direction += 0.03;
    //gameCamera.rotation.y += 0.01;
    MoveCar(playerCar, playerStateClientSide);
    MoveCamera(gameCamera, playerCar, playerStateClientSide);
    if (roads - gameCamera.posx <= 50) {
        var oldSegment = roadSegments.shift();
        gameScene.remove(oldSegment);
        roadSegment = makeAndMoveRoadSegment(roads++, roadMaterial);
        roadSegment.receiveShadow = true;
        gameScene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
    playerStateClientSide = getPlayerState(0);
    requestAnimationFrame(renderGameScene);
    renderer.render(gameScene, gameCamera);
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
    gameScene.add(newCar);

    var wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.name = "wheel1";
    wheel1.translateX(-0.095);
    wheel1.translateY(-0.070);
    wheel1.translateZ(-0.195);
    wheel1.rotateY(Math.PI);
    gameScene.add(wheel1);
    newCar.add(wheel1);
    var wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.name = "wheel2";
    wheel2.translateX( 0.095);
    wheel2.translateY(-0.070);
    wheel2.translateZ(-0.195);
    gameScene.add(wheel2);
    newCar.add(wheel2);
    var wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.name = "wheel3";
    wheel3.translateX(-0.095);
    wheel3.translateY(-0.070);
    wheel3.translateZ( 0.165);
    wheel3.rotateY(Math.PI);
    gameScene.add(wheel3);
    newCar.add(wheel3);
    var wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.name = "wheel4";
    wheel4.translateX( 0.095);
    wheel4.translateY(-0.070);
    wheel4.translateZ( 0.165);
    gameScene.add(wheel4);
    newCar.add(wheel4);
    return newCar;
}

function initRoad() {
    for (roads = -5; roads <= 50; roads++) {
        roadSegment = makeAndMoveRoadSegment(roads, roadMaterial);
        roadSegment.receiveShadow = true;
        gameScene.add(roadSegment);
        roadSegments.push(roadSegment);
    }
}

function initLights() {
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 206/360, 0.2, 0.5 );
    hemiLight.position.set( 0, 500, 0 );
    gameScene.add(hemiLight);
    gameScene.add(new THREE.AmbientLight("#0c0c0c"));
    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set( -1, 1.75, 1 );
    dirLight.position.multiplyScalar( 50 );
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
    gameScene.add(dirLight);
}

function initGameScene() {
    playerStateClientSide = getPlayerState(0);
    playerCar = initCar(playerStateClientSide);
    MoveCar(playerCar, playerStateClientSide);
    MoveCamera(gameCamera, playerCar, playerStateClientSide);
    initRoad();
    initGrid(gameScene, gridSideLength);
    initLights();
    initControls();
}

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

function init() {
    initGameScene();
    document.getElementById("game").appendChild(renderer.domElement);
    renderGameScene();
}

(function() {
    initModel = function() {


        var ldr = new THREE.JSONLoader();
        ldr.load(
            "bmw_no_wheels.json",
            function(geometry, materials) {
                geometry.center();
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
                        init();
                    }
                );
            }
        );
    }

})();

//window.onload = initModel;


//updatePlayer(playerStates[0]);

