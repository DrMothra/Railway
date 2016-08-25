/**
 * Created by DrTone on 23/08/2016.
 */
//Holds attributes for each train

function Train() {
    this.enginePosition = new THREE.Vector3();
    this.ghostPosition = new THREE.Vector3();
    this.interStopDistance = 0;
    this.movementPerSecond = 0;
    this.interStopTime = 0;
    this.currentTime = 0;
    this.currentStop = 0;
    this.realTime = 0;
    this.timeToNextStop = 0;
    this.realTimeToNextStop = 0;
    this.realTimeInc = 0;
    this.delayTime = 0;
    this.delayTimeInc = 0;
    this.animating = false;
    this.engineSprite = undefined;
    this.ghostSprite = undefined;
    this.tripTime = 0;
    this.startTime = 0;
}

Train.prototype = {
    init: function(trackLength, numStops, tripTime, startTime) {
        this.tripTime = tripTime;
        this.startTime = startTime;
        this.numStops = numStops;
        this.interStopDistance = trackLength / numStops;
        this.movementPerSecond = trackLength / tripTime;
        this.interStopTime = this.interStopDistance / this.movementPerSecond;
        
        //Train visuals
        var textureLoader = new THREE.TextureLoader();
        var trainTex = textureLoader.load("images/engine.png");
        var trainMat = new THREE.SpriteMaterial( {map: trainTex} );
        this.engineSprite = new THREE.Sprite(trainMat);
        this.engineSprite.scale.set(10, 10, 1);

        var ghostMat = new THREE.SpriteMaterial( {map: trainTex, opacity: 0.5});
        this.ghostSprite = new THREE.Sprite(ghostMat);
        this.ghostSprite.scale.set(10, 10, 1);
    },
    
    getTrainIcon: function() {
        return this.engineSprite;
    },
    
    getGhostIcon: function() {
        return this.ghostSprite;
    },

    setEnginePosition: function(pos) {
        this.engineSprite.position.set(pos.x, pos.y, pos.z);
    },
    
    setGhostPosition: function(pos) {
        this.ghostSprite.position.set(pos.x, pos.y, pos.z);
    },
    
    setTimeToNextStop: function(nextStopTime) {
        this.timeToNextStop += this.interStopTime;
        this.realTimeToNextStop = nextStopTime;
        this.realTimeInc = this.realTimeToNextStop / this.interStopTime;
        
    },

    setNextDelay: function(current, next) {
        var delay = next - current + this.interStopTime;
        this.delayTimeInc = delay/this.interStopTime;
    },

    setDelayTime: function(delay) {
        this.delayTime = delay;
    },
    
    getDelayTime: function () {
        return this.delayTime;
    },
    
    toggleAnimation: function() {
        this.animating = !this.animating;
    },

    passedStop: function() {
        return this.currentTime >= this.timeToNextStop;
    },

    gotoNextStop: function() {
        this.currentTime = this.timeToNextStop;
        ++this.currentStop;
        
        if(this.currentStop >= (this.numStops-1)) {
            this.animating = false;
        }
        
        return this.animating;
    },

    update: function(delta) {
        this.currentTime += delta;
        if(this.currentTime >= this.startTime) this.animating = true;

        if(!this.animating) return false;


        this.realTime += (delta * this.realTimeInc);
        this.delayTime += (delta * this.delayTimeInc);

        return true;
    },
    
    getCurrentTime: function() {
        return this.currentTime;
    },
    
    getTripTime: function() {
        return this.tripTime;
    },

    getCurrentStop: function() {
        return this.currentStop;
    },

    running: function () {
        return this.animating;
    },
    
    reset: function() {
        this.animating = false;
        this.currentTime = 0;
        this.currentStop = 0;
        this.realTime = 0;
        this.timeToNextStop = this.interStopTime;
    }
};
