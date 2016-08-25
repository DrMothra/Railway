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
    //Train 1 - P0347220151021
    this.trainRoutes = [
        {
            id: "P0347220151021",
            startTime: 0,
            routeData: [
                {stationName: "D10837", time: 0, delay: 1},
                {stationName: "D50845", time: 0, delay: 1},
                {stationName: "D50901", time: 2, delay: 1.5},
                {stationName: "D50905", time: 3, delay: 1},
                {stationName: "D50913", time: 3, delay: 1},
                {stationName: "D50921", time: 4, delay: 0},
                {stationName: "D52203", time: 7, delay: 0},
                {stationName: "D52205", time: 8, delay: -1},
                {stationName: "D52211", time: 8, delay: -0.5},
                {stationName: "OXDX55", time: 9, delay: 0},
                {stationName: "OXDX56", time: 10, delay: 0},
                {stationName: "OXDX57", time: 11, delay: 0},
                {stationName: "OXDX58", time: 12, delay: -0.5},
                {stationName: "OXDX59", time: 15, delay: 0},
                {stationName: "OX0014", time: 16, delay: 0.5},
                {stationName: "OX0016", time: 17, delay: 0},
                {stationName: "OX0018", time: 17, delay: -1},
                {stationName: "OX0020", time: 18, delay: -1},
                {stationName: "OXA072", time: 20, delay: -2},
                {stationName: "OX0072", time: 20, delay: -2},
                {stationName: "OXCOUT", time: 24, delay: 0}
            ]
        },

        {
            id: "P0063120151021",
            startTime: 5,
            routeData: [
                {stationName: "D10837", time: 0, delay: 1},
                {stationName: "D50845", time: 0, delay: 1},
                {stationName: "D50901", time: 2, delay: 1.5},
                {stationName: "D50905", time: 3, delay: 1},
                {stationName: "D50913", time: 3, delay: 1},
                {stationName: "D50921", time: 4, delay: 0},
                {stationName: "D52203", time: 7, delay: 0},
                {stationName: "D52205", time: 8, delay: -1},
                {stationName: "D52211", time: 8, delay: -0.5},
                {stationName: "OXDX55", time: 9, delay: 0},
                {stationName: "OXDX56", time: 10, delay: 0},
                {stationName: "OXDX57", time: 11, delay: 0},
                {stationName: "OXDX58", time: 12, delay: -0.5},
                {stationName: "OXDX59", time: 15, delay: 0},
                {stationName: "OX0014", time: 16, delay: 0.5},
                {stationName: "OX0016", time: 17, delay: 0},
                {stationName: "OX0018", time: 17, delay: -1},
                {stationName: "OX0020", time: 18, delay: -1},
                {stationName: "OXA072", time: 20, delay: -2},
                {stationName: "OX0072", time: 20, delay: -2},
                {stationName: "OXCOUT", time: 24, delay: 0}
            ]
        },

        {
            id: "P0063120151021",
            startTime: 10,
            routeData: [
                {stationName: "D10837", time: 0, delay: 1},
                {stationName: "D50845", time: 0, delay: 1},
                {stationName: "D50901", time: 2, delay: 1.5},
                {stationName: "D50905", time: 3, delay: 1},
                {stationName: "D50913", time: 3, delay: 1},
                {stationName: "D50921", time: 4, delay: 0},
                {stationName: "D52203", time: 7, delay: 0},
                {stationName: "D52205", time: 8, delay: -1},
                {stationName: "D52211", time: 8, delay: -0.5},
                {stationName: "OXDX55", time: 9, delay: 0},
                {stationName: "OXDX56", time: 10, delay: 0},
                {stationName: "OXDX57", time: 11, delay: 0},
                {stationName: "OXDX58", time: 12, delay: -0.5},
                {stationName: "OXDX59", time: 15, delay: 0},
                {stationName: "OX0014", time: 16, delay: 0.5},
                {stationName: "OX0016", time: 17, delay: 0},
                {stationName: "OX0018", time: 17, delay: -1},
                {stationName: "OX0020", time: 18, delay: -1},
                {stationName: "OXA072", time: 20, delay: -2},
                {stationName: "OX0072", time: 20, delay: -2},
                {stationName: "OXCOUT", time: 24, delay: 0}
            ]
        }
    ];

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
            var currentStop = train.getCurrentStop();
            if(train.update(delta)) {
                //Update visuals
                var currentTime = train.getCurrentTime();
                var currentDelay = this.trainRoutes[i].routeData[currentStop].delay;
                var tripTime = train.getTripTime();
                this.tempPos = this.tube.parameters.path.getPointAt( currentTime / tripTime);
                this.tempPos.add(this.posOffset);
                train.setEnginePosition(this.tempPos);
                //DEBUG
                var delayTime = train.getDelayTime();
                console.log("Delay time = ", delayTime);
                this.tempPos = this.tube.parameters.path.getPointAt( (currentTime + currentDelay + delayTime) / tripTime );
                this.tempPos.add(this.posOffset);
                train.setGhostPosition(this.tempPos);

                if(train.passedStop()) {
                    if(train.gotoNextStop()) {
                        ++currentStop;
                        train.setTimeToNextStop(this.trainRoutes[i].routeData[currentStop+1].time - this.trainRoutes[i].routeData[currentStop].time);
                        train.setNextDelay(this.trainRoutes[i].routeData[currentStop].delay, this.trainRoutes[i].routeData[currentStop+1].delay);
                        train.setDelayTime(0);
                    }
                }
            }
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

    var textureLoader = new THREE.TextureLoader();
    var pointTex = textureLoader.load("images/pin.png");

    var pointMat = new THREE.SpriteMaterial( {map: pointTex} );
    var numPointers = this.trainRoutes[0].routeData.length;

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
        label = spriteManager.create(this.trainRoutes[0].routeData[i].stationName, labelPos, labelScale, 32, 1, true, false);
        this.railGroup.add(label);
    }

    //Set up trains
    var length = tube.parameters.path.getLength(), stops, tripTime, startTime;
    var currentDelay, nextDelay;
    this.trains = [];
    for(i=0; i<this.trainRoutes.length; ++i) {
        this.trains.push(new Train());
        stops = this.trainRoutes[i].routeData.length;
        tripTime = this.trainRoutes[i].routeData[stops-1].time - this.trainRoutes[i].routeData[0].time;
        startTime = this.trainRoutes[i].startTime;
        this.trains[i].init(length, stops, tripTime, startTime);

        this.trains[i].setTimeToNextStop(this.trainRoutes[i].routeData[1].time);

        this.railGroup.add(this.trains[i].getTrainIcon());
        pos = tube.parameters.path.getPointAt(0);
        this.trains[i].setEnginePosition(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);

        this.railGroup.add(this.trains[i].getGhostIcon());
        this.trains[i].setGhostPosition(pos.x, pos.y+this.trainHeight, pos.z+this.trackOffset);
        
        currentDelay = this.trainRoutes[i].routeData[0].delay;
        nextDelay = this.trainRoutes[i].routeData[1].delay;
        this.trains[i].setNextDelay(currentDelay, nextDelay);
        this.trains[i].setDelayTime(0);
    }

    //$('#delay').html(this.data[this.currentStop].delay);

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
