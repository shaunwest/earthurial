/**
 * User: shaun
 * Date: 11/13/13 9:06 PM
 */


EARTH.audioManager = {
    init: function(sounds) {
        this.currentChime   = -1;
        this.sounds         = sounds;
        this.chimes         = sounds.sounds["chimes"];
    },

    play: function(assetId) {
        var asset = this.sounds.sounds[assetId];
        asset.play();
    },

    playFromSequence: function(sequenceId, index) {
        var asset = this.sounds.sounds[sequenceId][index];
        asset.play();
    },

    playNextChime: function() {
        var chimes = this.chimes,
            currentChime = this.currentChime + 1;

        if(currentChime >= chimes.length) {
            currentChime = chimes.length - 1;
        }

        chimes[currentChime].currentTime = 0;
        chimes[currentChime].play();

        this.currentChime = currentChime;
    },

    playPreviousChime: function() {
        var chimes = this.chimes,
            currentChime = this.currentChime - 1;

        if(currentChime < 0) {
            currentChime = 0;
        }

        chimes[currentChime].currentTime = 0;
        chimes[currentChime].play();

        this.currentChime = currentChime;
    },

    resetChime: function() {
        this.currentChime = -1;
    },

    // This supposedly enables audio on an HTML audio element on iOS...
    // http://blog.gopherwoodstudios.com/2012/07/enabling-html5-audio-playback-on-ios.html
    enableAudio: function(element, audio, onEnd){
        var callback = false,
            click    = false;

        click = function(e){
            var forceStop = function () {
                    audio.removeEventListener('play', forceStop, false);
                    audio.pause();
                    element.removeEventListener('touchstart', click, false);
                    if(onEnd) onEnd();
                },
                progress  = function () {
                    audio.removeEventListener('canplaythrough', progress, false);
                    if (callback) callback();
                };

            audio.addEventListener('play', forceStop, false);
            audio.addEventListener('canplaythrough', progress, false);
            try {
                audio.play();
            } catch (e) {
                callback = function () {
                    callback = false;
                    audio.play();
                };
            }
        };
        element.addEventListener('touchstart', click, false);
    }
};