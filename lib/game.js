
var carModel;
var wheelGeometry, wheelMaterial;
var carBox;
var meter;
var floorLevel;
var idleSpeed;


//////////////////////////////////////////////////////////////
///////////////////// Shared functions ///////////////////////
//////////////////////////////////////////////////////////////

roadCurve = function(x) {
    /* Given an X position, returns the Z position. */
    if (x < 0) {
        return roadCurve(0);
    }
    x *= 10;
    var y;
    y = 2 * (Math.sin ((1/2) * Math.PI * (x/32-4)) + Math.sin ((1/3) * Math.PI * (x/32-4)) + 2*Math.sin ((1/5) * Math.PI * (x/32-4)));
    return y;
};

roadCurveDerivative = function(x) {
    if (x < 0) {
        return roadCurveDerivative(0);
    }
    x *= 10;
    var y;
    y = 0.0261799*(12*Math.cos(0.019635*(x-128))+10*Math.cos(0.0327249*(x-128))+15*Math.cos(0.0490874*x));
    return y;
};

roadDirection = function(x) {
    /* Given an X position, returns the slope (= direction of the tangent). */
    if (x < 0) {
        return roadDirection(0);
    }
    return -Math.atan2(roadCurveDerivative(x), 1);
};

getMidRoadVector = function(p) {
    /* A vector that given an X value makes a vector object on the road line. */
    return new THREE.Vector3(p, 0.01, roadCurve(p));
};

getPointOnLeftLineForX = function(pointOnMidlineForX) {
    /* A vector that given an X value makes a vector object on the road line of the left boundary. */
    var angle = roadDirection(pointOnMidlineForX.x);
    var xL = pointOnMidlineForX.x + (roadWidth/2)*Math.sin(angle);
    var yL = pointOnMidlineForX.y + (roadWidth/2)*Math.cos(angle);
    return new THREE.Vector3(xL, yL, pointOnMidlineForX.z);
};

getPointOnRightLineForX = function(pointOnMidlineForX) {
    /* A vector that given an X value makes a vector object on the road line of the right boundary. */
    var angle = -Math.PI + roadDirection(pointOnMidlineForX.x);
    var xL = pointOnMidlineForX.x + (roadWidth/2)*Math.sin(angle);
    var yL = pointOnMidlineForX.y + (roadWidth/2)*Math.cos(angle);
    return new THREE.Vector3(xL, yL, pointOnMidlineForX.z);
};

calcDistance = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2,2));
};




