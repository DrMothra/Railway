/**
 * Created by DrTone on 22/02/2016.
 */




function RailApp() {
    BaseApp.call(this);
}

RailApp.prototype = new BaseApp();

RailApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);
};

RailApp.prototype.update = function() {
    var clicked = this.mouseDown;

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

    var spline = new THREE.CatmullRomCurve3(points);
    var mat = new THREE.LineBasicMaterial( {color: 0x303030});
    var geom = new THREE.Geometry();
    geom.vertices = spline.getPoints(50);
    var splineObject = new THREE.Line(geom, mat);
    this.scene.add(splineObject);

    var textureLoader = new THREE.TextureLoader();
    var trainTex = textureLoader.load("images/engine.png");
    var trainMat = new THREE.SpriteMaterial( {map: trainTex});
    var engineSprite = new THREE.Sprite(trainMat);
    engineSprite.scale.set(10, 10, 1);
    engineSprite.position.y = 5;
    this.scene.add(engineSprite);
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
