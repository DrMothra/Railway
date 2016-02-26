/**
 * Created by DrTone on 22/02/2016.
 */




function RailApp() {
    BaseApp.call(this);
}

RailApp.prototype = new BaseApp();

RailApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    //Journey data - read from file later
    this.data = [
        { stationName: "D10837", time: 0, delay: 1 },
        { stationName: "D50845", time: 0, delay: 1 },
        { stationName: "D50901", time: 2, delay: 1.5 },
        { stationName: "D50905", time: 3, delay: 1 },
        { stationName: "D50913", time: 3, delay: 1 },
        { stationName: "D50921", time: 4, delay: 0 },
        { stationName: "D52203", time: 7, delay: 0 },
        { stationName: "D52205", time: 8, delay: -1 },
        { stationName: "D52211", time: 8, delay: -0.5 },
        { stationName: "OXDX55", time: 9, delay: 0 },
        { stationName: "OXDX56", time: 10, delay: 0 },
        { stationName: "OXDX57", time: 11, delay: 0 },
        { stationName: "OXDX58", time: 12, delay: -0.5 },
        { stationName: "OXDX59", time: 15, delay: 0 },
        { stationName: "OX0014", time: 16, delay: 0.5 },
        { stationName: "OX0016", time: 17, delay: 0 },
        { stationName: "OX0018", time: 17, delay: -1 },
        { stationName: "OX0020", time: 18, delay: -1 },
        { stationName: "OXA072", time: 20, delay: -2 },
        { stationName: "OX0072", time: 20, delay: -2 },
        { stationName: "OXCOUT", time: 24, delay: 0 }
    ];

    this.animating = false;
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.animating) {
        var xPos = this.engineSprite.position.x;
        var zPos = this.engineSprite.position.z;
        this.engineSprite.position.x += (delta * this.movementPerSecond * this.sector);
        if(this.engineSprite.position.x > this.engineX) {
            this.engineSprite.position.x = this.engineX;
            this.sector = -1;
        }
        if(this.engineSprite.position.x < -this.engineX) {
            this.engineSprite.position.x = -this.engineX;
            this.sector = 1;
        }
        this.engineSprite.position.z = Math.sqrt(this.a2 - (this.engineSprite.position.x * this.engineSprite.position.x));
        this.engineSprite.position.z *= this.sector;
    }
    BaseApp.prototype.update.call(this);
};

RailApp.prototype.createScene = function() {
    BaseApp.prototype.createScene.call(this);

    var halfWidth = 100, depth = 100;
    var points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(new THREE.Vector3(halfWidth, 0, 0));
    points.push(new THREE.Vector3(halfWidth, 0, -depth));
    points.push(new THREE.Vector3(-halfWidth, 0, -depth));
    points.push(new THREE.Vector3(-halfWidth, 0, 0));
    points.push(new THREE.Vector3(0, 0, 0));

    var innerRad = 225, outerRad = 240, segments = 30;
    var ringGeom = new THREE.RingGeometry(innerRad, outerRad, segments);
    var ringMat = new THREE.MeshBasicMaterial( {color: 0x373737} );
    var ringMesh = new THREE.Mesh(ringGeom,  ringMat);
    //var yScaleFactor = 0.55;
    //ringMesh.scale.y = yScaleFactor;
    ringMesh.rotation.x = -Math.PI/2;
    this.scene.add(ringMesh);

    //Scene parameters
    this.engineX = 230;
    this.engineZ = 124.5;
    this.a2 = this.engineX * this.engineX;
    this.b2 = this.engineZ * this.engineZ;
    this.movementPerSecond = 10;
    this.sector = 1;

    var textureLoader = new THREE.TextureLoader();
    var trainTex = textureLoader.load("images/engine.png");
    var pointTex = textureLoader.load("images/pin.png");

    var trainMat = new THREE.SpriteMaterial( {map: trainTex} );
    this.engineSprite = new THREE.Sprite(trainMat);
    this.scene.add(this.engineSprite);
    this.engineSprite.scale.set(10, 10, 1);
    this.engineSprite.position.set(0, 5, outerRad - 7.5);

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = this.data.length;
    var pointerAngle = 0, pointerRadius = 220, angleInc = (2 * Math.PI) / numPointers;

    this.pointerSprites = [];
    for(var i=0; i<numPointers; ++i, pointerAngle += angleInc) {
        this.pointerSprites.push(new THREE.Sprite(pointMat));
        this.scene.add(this.pointerSprites[i]);
        this.pointerSprites[i].scale.set(30, 30, 1);
        this.pointerSprites[i].position.set(Math.sin(pointerAngle)*pointerRadius, 15, Math.cos(pointerAngle)*pointerRadius);
    }

    var labelPos = new THREE.Vector3(0, 25, 220), labelScale = new THREE.Vector3(30, 30, 1);
    var label = spriteManager.create("D10837", labelPos, labelScale, 32, 1, true, false);
    this.scene.add(label);
};

RailApp.prototype.createGUI = function() {
    this.guiControls = new function () {
        this.ScaleX = 1.0;
        this.ScaleY = 10.0;
        this.ScaleZ = 1.0;
        this.LightX = 0.0;
        this.LightY = 200;
        this.LightZ = 0;
    };
};

$(document).ready(function() {
    //Init
    var container = document.getElementById("WebGL-output");
    var app = new RailApp();
    app.init(container);
    app.createScene();
    app.createGUI();

    app.run();
});
