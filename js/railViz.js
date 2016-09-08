/**
 * Created by DrTone on 22/02/2016.
 */

var ROT_INC = Math.PI/32;
var NUM_TRAINS_PER_TRACK = 4;
var NUM_TRACKS = 2;

//Camera views
var cameraViews = [
    {
        front: [ new THREE.Vector3(0, 240, 640), new THREE.Vector3(0, 0, 0)],
        right: [ new THREE.Vector3(640, 240, 0), new THREE.Vector3(0, 0, 0)],
        back: [ new THREE.Vector3(0, 240, -640), new THREE.Vector3(0, 0, 0)],
        left: [ new THREE.Vector3(-640, 240, 0), new THREE.Vector3(0, 0, 0)]
    },

    {
        front: [ new THREE.Vector3(0, 240, -60), new THREE.Vector3(0, 0, -700)],
        right: [ new THREE.Vector3(640, 240, -760), new THREE.Vector3(0, 0, -700)],
        back: [ new THREE.Vector3(0, 240, -1440), new THREE.Vector3(0, 0, -700)],
        left: [ new THREE.Vector3(-640, 240, -760), new THREE.Vector3(0, 0, -700)]
    }
];

var viewOrder = ['front', 'right', 'back', 'left'];

function RailApp() {
    BaseApp.call(this);
}

RailApp.prototype = new BaseApp();

RailApp.prototype.init = function(container) {
    BaseApp.prototype.init.call(this, container);

    this.cameraView = 0;
    this.trackView = 0;
    var camView = cameraViews[this.trackView];
    this.setCamera(camView.front);
    this.running = false;
    this.trackOffset = 100;
    this.trainHeight = 7;
    this.tempPos = new THREE.Vector3();
    this.posOffset = new THREE.Vector3(0, this.trainHeight, 0);
    this.currentTrain = 0;
};

RailApp.prototype.update = function() {
    var delta = this.clock.getDelta();

    if(this.running) {
        for(var i=0; i<this.trains.length; ++i) {
            var train = this.trains[i];
            if(train.update(delta)) {
                //Update visuals
                var tripTime = train.getTripTime();
                this.tempPos = this.tubes[0].parameters.path.getPointAt( train.getCurrentTime() / tripTime);
                this.tempPos.add(this.posOffset);
                this.trainSprites[i].position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z);
                
                this.tempPos = this.tubes[0].parameters.path.getPointAt( train.getDelayTime() / tripTime );
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
    var groundWidth = 1000, groundDepth = 2000, i;
    var planeGeom = new THREE.PlaneBufferGeometry(groundWidth, groundDepth, 8, 8);
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
    var tubeMat = new THREE.MeshLambertMaterial( {color:0x0000ff});

    //Tracks
    var trackOffset = -700;
    this.trackGroups = [];
    this.tubeMeshes = [];
    this.tubes = [];
    for(i=0; i<NUM_TRACKS; ++i) {
        this.tubes.push(new THREE.TubeGeometry(sampleClosedSpline, segments, 2, radiusSegments, closed));
        this.tubeMeshes.push(new THREE.Mesh(this.tubes[i], tubeMat));
        this.trackGroups.push(new THREE.Object3D());
        this.trackGroups[i].add(this.tubeMeshes[i]);
        this.trackGroups[i].position.z = i * trackOffset;
        this.scene.add(this.trackGroups[i]);
    }
    this.trackGroups[1].rotation.y = Math.PI/2;
    
    this.pinHeight = 20;

    //this.railGroup = new THREE.Object3D();
    //this.railGroup.name = "railway";

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = trainRoute.routeData.length;

    this.pointerSprites = [];
    var labelPos = new THREE.Vector3(), labelScale = new THREE.Vector3(30, 30, 1);
    var pos = new THREE.Vector3();
    var label;
    //Need to do for each track
    var pointerSprite, track;
    for(track=0; track<NUM_TRACKS; ++track) {
        for(i=0; i<numPointers; ++i) {
            pointerSprite = new THREE.Sprite(pointMat);
            this.pointerSprites.push(pointerSprite);
            this.trackGroups[track].add(pointerSprite);
            pointerSprite.scale.set(30, 30, 1);
            pos = this.tubes[track].parameters.path.getPointAt( i/numPointers );
            pointerSprite.position.set(pos.x, pos.y+this.pinHeight, pos.z);
            labelPos.set(pointerSprite.position.x, 30, pointerSprite.position.z);
            label = spriteManager.create(trainRoute.routeData[i].stationName, labelPos, labelScale, 32, 1, true, false);
            this.trackGroups[track].add(label);
        }
    }

    //Set up trains
    var length = this.tubes[0].parameters.path.getLength();
    this.trains = [];
    //Train materials
    this.defaultTrainMat = new THREE.SpriteMaterial( {color: 0x000000, map: trainTex} );
    this.trainMatSelected = new THREE.SpriteMaterial( {color: 0xd9df18, map: trainTex} );
    var ghostMat = new THREE.SpriteMaterial( {color: 0x000000, map: trainTex, opacity: 0.5});
    var ghostMatSelected = new THREE.SpriteMaterial( {color: 0xd9df18, map: trainTex, opacity: 0.5});
    this.trainSprites = [];
    this.ghostSprites = [];
    var currentTrain, trainSprite, ghostSprite;
    for(track=0; track<NUM_TRACKS; ++track) {
        for(i=0; i<NUM_TRAINS_PER_TRACK; ++i) {
            currentTrain = new Train();
            this.trains.push(currentTrain);
            currentTrain.init(length, i);

            trainSprite = new THREE.Sprite(i === 0 && track === 0 ?  this.trainMatSelected : this.defaultTrainMat);
            this.trainSprites.push(trainSprite);
            this.trackGroups[track].add(trainSprite);
            pos = this.tubes[track].parameters.path.getPointAt(0);
            trainSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z);
            trainSprite.scale.set(10, 10, 1);

            ghostSprite = new THREE.Sprite(i === 0 && track === 0 ? ghostMatSelected : ghostMat);
            this.ghostSprites.push(ghostSprite);
            this.trackGroups[track].add(ghostSprite);
            ghostSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z);
            ghostSprite.scale.set(10, 10, 1);
        }
    }

    
    //$('#delay').html(this.data[this.currentStop].delay);
    //this.ghostSprites[0].material.color.set(0x00ff00);

    //this.scene.add(this.railGroup);
};

RailApp.prototype.changeView = function(viewName) {
    if(!viewName) {
        console.log("No camera view name!");
        return;
    }

    viewName === 'next' ? ++this.cameraView : --this.cameraView;

    if(this.cameraView >= viewOrder.length) this.cameraView = 0;
    if(this.cameraView < 0) this.cameraView = viewOrder.length - 1;

    var camView = cameraViews[this.trackView];
    this.setCamera(camView[viewOrder[this.cameraView]]);
};

RailApp.prototype.changeTrack = function(track) {
    if(track === undefined) {
        console.log("No track selected!");
        return;
    }

    if(track != this.trackView) {
        $('#track' + track).addClass('active');
        $('#track' + this.trackView).removeClass('active');
        var camView = cameraViews[track];
        this.setCamera(camView[viewOrder[this.cameraView]]);
    }
    this.trackView = track;
};

RailApp.prototype.selectTrain = function(train) {
    if(train === undefined) {
        console.log("No train specified!");
        return;
    }
    var trainTxt = train.slice(-1);
    var train = parseInt(trainTxt, 10);
    if(isNaN(train)) {
        console.log("Invalid train number");
        return;
    }
    $('#trainID').html("00" + train);
    this.trainSprites[--train].material = this.trainMatSelected;
    this.trainSprites[this.currentTrain].material = this.defaultTrainMat;
    this.currentTrain = train;
};

RailApp.prototype.startStopAnimation = function() {
    this.running = !this.running;
    $('#startStop').html(this.running ? "Stop" : "Start");
};

RailApp.prototype.reset = function() { //Reset everything
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
    var pos = this.tubes[0].parameters.path.getPointAt( 0 );
    this.engineSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);
    this.ghostSprite.position.set(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);


    //Redraw
    this.renderer.render( this.scene, this.camera );
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

    $('#track0').on("click", function() {
        app.changeTrack(0);
    });

    $('#track1').on("click", function() {
        app.changeTrack(1);
    });

    $('#nextView').on("click", function() {
        app.changeView('next');
    });

    $('#previousView').on("click", function() {
        app.changeView('previous');
    });

    $('.dropdown-menu li a').on('click', function () {
        // do something…
        app.selectTrain($(this).text());
    });

    app.run();
});
