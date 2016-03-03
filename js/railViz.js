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

    this.tripTime = this.data[this.data.length-1].time;
    this.animating = false;
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.animating) {
        this.currentTime += delta;
        this.realTime += (delta * this.realTimeInc);
        this.delayTime += (delta * this.delayTimeInc);
        $('#minutes').html(this.realTime < 10 ? '0' + Math.floor(this.realTime) : Math.floor(this.realTime));
        //DEBUG
        //console.log("Real time = ", this.realTime);

        if(this.currentTime >= this.timeToNextStop) {
            this.currentTime = this.timeToNextStop;
            ++this.currentStop;
            $('#delay').html(this.data[this.currentStop].delay);
            if(this.currentStop >= (this.data.length-1)) {
                //DEBUG
                //console.log("Finished");
                this.animating = false;
                return;
            }

            //DEBUG
            //console.log("Arrived at stop ", this.currentStop);

            this.timeToNextStop += this.interStopTime;
            this.realTimeToNextStop = this.data[this.currentStop+1].time - this.data[this.currentStop].time;
            this.realTimeInc = this.realTimeToNextStop / this.interStopTime;
            var delay = this.data[this.currentStop+1].delay - this.data[this.currentStop].delay + this.interStopTime;
            this.delayTimeInc = delay/this.interStopTime;
        }
        var angle = (this.currentTime/this.roundTripTime) * 2 * Math.PI;
        var xPos = Math.sin(angle)*this.trainRadius;
        var zPos = Math.cos(angle)*this.trainRadius;
        this.engineSprite.position.set(xPos, 5, zPos);
        angle = (this.delayTime/this.roundTripTime) * 2 * Math.PI;
        xPos = Math.sin(angle)*this.trainRadius;
        zPos = Math.cos(angle)*this.trainRadius;
        this.ghostSprite.position.set(xPos, 5, zPos);
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
    this.sector = 1;

    var textureLoader = new THREE.TextureLoader();
    var trainTex = textureLoader.load("images/engine.png");
    var pointTex = textureLoader.load("images/pin.png");

    var trainMat = new THREE.SpriteMaterial( {map: trainTex} );
    this.engineSprite = new THREE.Sprite(trainMat);
    this.scene.add(this.engineSprite);
    this.engineSprite.scale.set(10, 10, 1);
    this.engineSprite.position.set(0, 5, outerRad - 7.5);

    var ghostMat = new THREE.SpriteMaterial( {map: trainTex, opacity: 0.5});
    this.ghostSprite = new THREE.Sprite(ghostMat);
    this.scene.add(this.ghostSprite);
    this.ghostSprite.scale.set(10, 10, 1);
    this.ghostSprite.position.set(0, 5, this.trainRadius - 7.5);

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = this.data.length;
    var pointerAngle = 0, angleInc = (2 * Math.PI) / numPointers, pointerRadius = 220;
    var circumference = 2 * Math.PI * pointerRadius;

    this.pointerSprites = [];
    var labelPos = new THREE.Vector3(), labelScale = new THREE.Vector3(30, 30, 1);
    var label;
    for(var i=0; i<numPointers; ++i, pointerAngle += angleInc) {
        this.pointerSprites.push(new THREE.Sprite(pointMat));
        this.scene.add(this.pointerSprites[i]);
        this.pointerSprites[i].scale.set(30, 30, 1);
        this.pointerSprites[i].position.set(Math.sin(pointerAngle)*pointerRadius, 15, Math.cos(pointerAngle)*pointerRadius);
        labelPos.set(this.pointerSprites[i].position.x, 25, this.pointerSprites[i].position.z);
        label = spriteManager.create(this.data[i].stationName, labelPos, labelScale, 32, 1, true, false);
        this.scene.add(label);
    }

    this.trainRadius = 230;
    this.roundTripTime = this.tripTime * 2;
    this.interStopDistance = circumference / numPointers;
    this.movementPerSecond = circumference / this.roundTripTime;
    this.interStopTime = this.interStopDistance / this.movementPerSecond;
    this.currentTime = 0;
    this.currentStop = 0;
    this.realTime = 0;
    this.timeToNextStop = this.interStopTime;
    this.realTimeToNextStop = this.data[this.currentStop+1].time;
    this.realTimeInc = this.realTimeToNextStop / this.interStopTime;
    $('#delay').html(this.data[this.currentStop].delay);
    //Ghost engine
    var delay = this.data[this.currentStop+1].delay - this.data[this.currentStop].delay + this.interStopTime;
    this.delayTime = this.data[this.currentStop].delay;
    this.delayTimeInc = delay/this.interStopTime;
    var angle = (this.data[this.currentStop].delay/this.roundTripTime) * 2 * Math.PI;
    var xPos = Math.sin(angle)*this.trainRadius;
    var zPos = Math.cos(angle)*this.trainRadius;
    this.ghostSprite.position.set(xPos, 5, zPos);
};

RailApp.prototype.startStopAnimation = function(status) {
    this.animating = status;
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

    var status = false;
    $('#controls').on("click", function() {
        status = !status;
        app.startStopAnimation(status);
    });

    app.run();
});
