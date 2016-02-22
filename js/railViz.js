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

    var box = new THREE.BoxGeometry(5, 5, 5);
    var boxMat = new THREE.MeshLambertMaterial( {color: 0xff0000});
    var boxMesh = new THREE.Mesh(box, boxMat);

    this.scene.add(boxMesh);
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
