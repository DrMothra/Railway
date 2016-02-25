/**
 * Created by DrTone on 22/02/2016.
 */




function RailApp() {
    BaseApp.call(this);
}

RailApp.prototype = new BaseApp();

RailApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    this.animating = true;
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.animating) {
        var xPos = this.engineSprite.position.x;
        var zPos = this.engineSprite.position.z;
        delta = zPos > 0 ? delta : -delta;
        this.engineSprite.position.x += (delta * this.movementPerSecond);
        if(this.engineSprite.position.x > this.engineX) {
            this.engineSprite.position.x = this.engineX;
        }
        this.engineSprite.position.z = Math.sqrt(this.b2 * (1 - ((this.engineSprite.position.x * this.engineSprite.position.x)/this.a2)));
        if(delta < 0) {
            this.engineSprite.position.z *= -1;
        }
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
    var yScaleFactor = 0.55;
    ringMesh.scale.y = yScaleFactor;
    ringMesh.rotation.x = -Math.PI/2;
    this.scene.add(ringMesh);

    var textureLoader = new THREE.TextureLoader();
    var trainTex = textureLoader.load("images/engine.png");
    var trainMat = new THREE.SpriteMaterial( {map: trainTex});
    this.engineSprite = new THREE.Sprite(trainMat);
    this.engineSprite.scale.set(10, 10, 1);
    this.engineSprite.position.set(0, 5, (outerRad * yScaleFactor) - 7.5);
    this.engineX = 230;
    this.engineZ = 124.5;
    this.a2 = this.engineX * this.engineX;
    this.b2 = this.engineZ * this.engineZ;
    this.movementPerSecond = 10;
    this.scene.add(this.engineSprite);
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
