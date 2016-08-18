/**
 * Created by DrTone on 22/02/2016.
 */

var ROT_INC = Math.PI/32;

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
    this.tripTime *= 2;
    this.animating = false;
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.animating) {
        this.currentTime += delta;
        this.realTime += (delta * this.realTimeInc);
        this.delayTime += (delta * this.delayTimeInc);
        $('#minutes').html(this.realTime < 10 ? '0' + Math.floor(this.realTime) : Math.floor(this.realTime));
        var pos = this.tube.parameters.path.getPointAt( this.currentTime / this.tripTime );
        this.engineSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);

        pos = this.tube.parameters.path.getPointAt( this.delayTime / this.tripTime );
        this.ghostSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);

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
    }

    BaseApp.prototype.update.call(this);
};

RailApp.prototype.createScene = function() {
    BaseApp.prototype.createScene.call(this);

    //Ground plane
    var planeGeom = new THREE.PlaneBufferGeometry(1000, 1000, 8, 8);
    var planeMat = new THREE.MeshLambertMaterial( {color: 0x1D701D});
    var plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI/2;
    this.scene.add(plane);

    //Spline
    var width = 200, depth = 275;
    var sampleClosedSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, depth/2),
        new THREE.Vector3(width, 0, depth),
        new THREE.Vector3(width, 0, -depth/10),
        new THREE.Vector3(0, 0, -depth/2),
        new THREE.Vector3(-width, 0, -depth/10),
        new THREE.Vector3(-width, 0, depth/2),
        new THREE.Vector3(-width/1.5, 0, depth*1.3)
    ]);

    sampleClosedSpline.type = 'catmullrom';
    sampleClosedSpline.closed = true;
    var segments = 100, radiusSegments = 3, closed = true;
    var tube = new THREE.TubeGeometry(sampleClosedSpline, segments, 2, radiusSegments, closed);
    var tubeMat = new THREE.MeshLambertMaterial( {color:0x0000ff});
    var tubeMesh = new THREE.Mesh(tube, tubeMat);
    var trackGroup = new THREE.Object3D();
    trackGroup.add(tubeMesh);
    trackGroup.position.z = -100;
    this.scene.add(trackGroup);

    var pos = tube.parameters.path.getPointAt( 0 );
    this.trackOffset = -100;
    this.trainHeight = 7;
    this.pinHeight = 20;
    this.tube = tube;

    this.railGroup = new THREE.Object3D();
    this.railGroup.name = "railway";

    var textureLoader = new THREE.TextureLoader();
    var trainTex = textureLoader.load("images/engine.png");
    var pointTex = textureLoader.load("images/pin.png");

    var trainMat = new THREE.SpriteMaterial( {map: trainTex} );
    this.engineSprite = new THREE.Sprite(trainMat);
    this.railGroup.add(this.engineSprite);
    this.engineSprite.scale.set(10, 10, 1);
    this.engineSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);

    var ghostMat = new THREE.SpriteMaterial( {map: trainTex, opacity: 0.5});
    this.ghostSprite = new THREE.Sprite(ghostMat);
    this.railGroup.add(this.ghostSprite);
    this.ghostSprite.scale.set(10, 10, 1);
    this.ghostSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = this.data.length;

    this.pointerSprites = [];
    var labelPos = new THREE.Vector3(), labelScale = new THREE.Vector3(30, 30, 1);
    var label;
    for(var i=0; i<numPointers; ++i) {
        this.pointerSprites.push(new THREE.Sprite(pointMat));
        this.railGroup.add(this.pointerSprites[i]);
        this.pointerSprites[i].scale.set(30, 30, 1);
        pos = tube.parameters.path.getPointAt( i/numPointers );
        this.pointerSprites[i].position.set(pos.x, pos.y+this.pinHeight, pos.z+this.trackOffset);
        labelPos.set(this.pointerSprites[i].position.x, 30, this.pointerSprites[i].position.z);
        label = spriteManager.create(this.data[i].stationName, labelPos, labelScale, 32, 1, true, false);
        this.railGroup.add(label);
    }

    var trackLength = tube.parameters.path.getLength();
    this.interStopDistance = trackLength / numPointers;
    this.movementPerSecond = trackLength / this.tripTime;
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

    this.scene.add(this.railGroup);
};

RailApp.prototype.startStopAnimation = function() {
    this.animating = !this.animating;
    $('#startStop').html(this.animating ? "Stop" : "Start");
};

RailApp.prototype.reset = function() {
    //Reset everything
    //Camera
    this.controls.reset();
    this.camera.position.set(0, 155, 450 );
    var lookAt = new THREE.Vector3(0, 0, 0);
    this.controls.setLookAt(lookAt);

    //Animations
    this.animating = false;
    $('#startStop').html("Start");

    //Output
    $('#hours').html("00");
    $('#minutes').html("00");

    //Train parameters
    this.currentTime = 0;
    this.currentStop = 0;
    this.realTime = 0;
    this.timeToNextStop = this.interStopTime;
    this.realTimeToNextStop = this.data[this.currentStop+1].time;
    $('#delay').html(this.data[this.currentStop].delay);
    var delay = this.data[this.currentStop+1].delay - this.data[this.currentStop].delay + this.interStopTime;
    this.delayTime = this.data[this.currentStop].delay;
    this.delayTimeInc = delay/this.interStopTime;

    //Train positions
    var angle = (this.currentTime/this.roundTripTime) * 2 * Math.PI;
    var xPos = Math.sin(angle)*this.trainRadius;
    var zPos = Math.cos(angle)*this.trainRadius;
    this.engineSprite.position.set(xPos, 5, zPos);
    angle = (this.data[this.currentStop].delay/this.roundTripTime) * 2 * Math.PI;
    xPos = Math.sin(angle)*this.trainRadius;
    zPos = Math.cos(angle)*this.trainRadius;
    this.ghostSprite.position.set(xPos, 5, zPos);
    this.railGroup.rotation.y = 0;

    //Redraw
    this.renderer.render( this.scene, this.camera );
};

RailApp.prototype.rotateTrackLeft = function() {
    this.railGroup.rotation.y += ROT_INC;
};

RailApp.prototype.rotateTrackRight = function() {
    this.railGroup.rotation.y -= ROT_INC;
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

    $('#startStop').on("click", function() {
        app.startStopAnimation();
    });

    $('#reset').on("click", function() {
        app.reset();
    });

    $('#rotateLeft').on("click", function() {
        app.rotateTrackLeft();
    });

    $('#rotateRight').on("click", function() {
        app.rotateTrackRight();
    });

    app.run();
});
