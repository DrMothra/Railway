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
}

Train.prototype = {
    init: function(trackLength, numStops, tripTime) {
        this.tripTime = tripTime;
        this.numStops = numStops;
        this.interStopDistance = trackLength / numStops;
        this.movementPerSecond = trackLength / tripTime;
        this.interStopTime = this.interStopDistance / this.movementPerSecond;
        this.timeToNextStop = this.interStopTime;
        
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
        this.enginePosition.copy(pos);
    },
    
    setGhostPosition: function(pos) {
        this.ghostPosition.copy(pos);
    },
    
    setTimeToNextStop: function(nextStopTime) {
        this.realTimeToNextStop = nextStopTime;
        this.realTimeInc = this.realTimeToNextStop / this.interStopTime;
        
    },
    
    setDelayTimes: function(current, next) {
        var delay = next - current + this.interStopTime;
        this.delayTime = current;
        this.delayTimeInc = delay/this.interStopTime;
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
        ++this.currentStop;
        if(this.currentStop >= this.numStops) {
            this.animating = false;
            return;
        }
        this.currentTime = this.timeToNextStop;
        this.timeToNextStop += this.interStopTime;
    },

    update: function(delta) {
        if(!this.animating) return;

        this.currentTime += delta;
        this.realTime += (delta * this.realTimeInc);
        this.delayTime += (delta * this.delayTimeInc);
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
