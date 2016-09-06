/**
 * Created by DrTone on 22/02/2016.
 */

var ROT_INC = Math.PI/32;
var NUM_TRAINS = 4;

function RailApp() {
    BaseApp.call(this);
}

RailApp.prototype = new BaseApp();

RailApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    this.running = false;
    this.trackOffset = -100;
    this.trainHeight = 7;
    this.tempPos = new THREE.Vector3();
    this.posOffset = new THREE.Vector3(0, this.trainHeight, this.trackOffset);
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.running) {
        for(var i=0; i<this.trains.length; ++i) {
            var train = this.trains[i];
            if(train.update(delta)) {
                //Update visuals
                var tripTime = train.getTripTime();
                this.tempPos = this.tube.parameters.path.getPointAt( train.getCurrentTime() / tripTime);
                this.tempPos.add(this.posOffset);
                this.trainSprites[i].position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z);
                
                this.tempPos = this.tube.parameters.path.getPointAt( train.getDelayTime() / tripTime );
                this.tempPos.add(this.posOffset);
                this.ghostSprites[i].position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z);

                if(train.passedStop()) {
                    train.gotoNextStop();
                }
            }
        }
    }

    BaseApp.prototype.update.call(this);
};

RailApp.prototype.createScene = function() {
    BaseApp.prototype.createScene.call(this);

    var textureLoader = new THREE.TextureLoader();
    var pointTex = textureLoader.load("images/pin.png");
    var trainTex = textureLoader.load("images/engineWhite.png");
    
    //Ground plane
    var planeGeom = new THREE.PlaneBufferGeometry(1000, 1000, 8, 8);
    var planeMat = new THREE.MeshLambertMaterial( {color: 0x1d701d});
    var plane = new THREE.Mesh(planeGeom, planeMat);
    plane.rotation.x = -Math.PI/2;
    this.scene.add(plane);

    //Track
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
    
    this.pinHeight = 20;
    this.tube = tube;

    this.railGroup = new THREE.Object3D();
    this.railGroup.name = "railway";

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = trainRoute.routeData.length;

    this.pointerSprites = [];
    var labelPos = new THREE.Vector3(), labelScale = new THREE.Vector3(30, 30, 1);
    var pos = new THREE.Vector3();
    var label, i;
    //Need to do for each track
    for(i=0; i<numPointers; ++i) {
        this.pointerSprites.push(new THREE.Sprite(pointMat));
        this.railGroup.add(this.pointerSprites[i]);
        this.pointerSprites[i].scale.set(30, 30, 1);
        pos = tube.parameters.path.getPointAt( i/numPointers );
        this.pointerSprites[i].position.set(pos.x, pos.y+this.pinHeight, pos.z+this.trackOffset);
        labelPos.set(this.pointerSprites[i].position.x, 30, this.pointerSprites[i].position.z);
        label = spriteManager.create(trainRoute.routeData[i].stationName, labelPos, labelScale, 32, 1, true, false);
        this.railGroup.add(label);
    }

    //Set up trains
    var length = tube.parameters.path.getLength();
    this.trains = [];
    //Train materials
    var trainMat = new THREE.SpriteMaterial( {color: 0x000000, map: trainTex} );
    var trainMatSelected = new THREE.SpriteMaterial( {color: 0xd9df18, map: trainTex} );
    var ghostMat = new THREE.SpriteMaterial( {color: 0x000000, map: trainTex, opacity: 0.5});
    var ghostMatSelected = new THREE.SpriteMaterial( {color: 0xd9df18, map: trainTex, opacity: 0.5});
    this.trainSprites = [];
    this.ghostSprites = [];
    
    for(i=0; i<NUM_TRAINS; ++i) {
        this.trains.push(new Train());
        this.trains[i].init(length, i);

        this.trainSprites.push(new THREE.Sprite(i === 0 ? trainMatSelected : trainMat));
        this.railGroup.add(this.trainSprites[i]);
        pos = tube.parameters.path.getPointAt(0);
        this.trainSprites[i].position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);
        this.trainSprites[i].scale.set(10, 10, 1);

        this.ghostSprites.push(new THREE.Sprite(i === 0 ? ghostMatSelected : ghostMat));
        this.railGroup.add(this.ghostSprites[i]);
        this.ghostSprites[i].position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);
        this.ghostSprites[i].scale.set(10, 10, 1);
    }
    
    //$('#delay').html(this.data[this.currentStop].delay);
    //this.ghostSprites[0].material.color.set(0x00ff00);

    this.scene.add(this.railGroup);
};

RailApp.prototype.startStopAnimation = function() {
    this.running = !this.running;
    $('#startStop').html(this.running ? "Stop" : "Start");
};

RailApp.prototype.reset = function() {
    //Reset everything
    //Camera
    this.controls.reset();
    this.camera.position.set(0, 155, 450 );
    var lookAt = new THREE.Vector3(0, 0, 0);
    this.controls.setLookAt(lookAt);

    //Animations
    this.running = false;
    $('#startStop').html("Start");

    //Output
    $('#hours').html("00");
    $('#minutes').html("00");

    //Train parameters

    this.realTimeToNextStop = this.data[this.currentStop+1].time;
    $('#delay').html(this.data[this.currentStop].delay);
    var delay = this.data[this.currentStop+1].delay - this.data[this.currentStop].delay + this.interStopTime;
    this.delayTime = this.data[this.currentStop].delay;
    this.delayTimeInc = delay/this.interStopTime;

    //Train positions
    var pos = this.tube.parameters.path.getPointAt( 0 );
    this.engineSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);
    this.ghostSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);


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
