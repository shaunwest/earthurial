/**
 * User: shaun
 * Date: 11/13/13 9:06 PM
 */


EARTH.audioManager = {
    init: function(sounds, ready) {
        //this.currentChime   = -1;
        this.sounds         = sounds;
        this.gameSfx        = sounds.sounds["gameSfx"];

        /*this.chimes         = [
            {start: 0.0,    end: 0.65}, //.81
            {start: 0.85,   end: 1.40}, //1.64
            {start: 1.65,   end: 2.30}, //2.46
            {start: 2.5,    end: 3.40},
            {start: 3.55,   end: 4.94},
            {start: 4.95,   end: 6.25}, //6.47
            {start: 6.5,    end: 7.66},
            {start: 7.7,    end: 8.35}, //8.47
            {start: 8.5,    end: 9.15}, //9.30
            {start: 9.35,   end: 10.13}
        ];*/

        this.segments = {
            clear: {start: 0.1, end: 0.8},
            sparkAppear: {start: 1.0, end: 1.395},
            sparkActive: {start: 2.013, end: 2.980}
        };

        this.enableAudioPlayers($("#playButton").get(0), [this.gameSfx], ready);
    },

    onPlay: function(e) {
        var gameSfx = this.gameSfx,
            end = this.end;

        if(end == 0 || gameSfx.currentTime >= end) {
            gameSfx.pause();
        }
    },

    playClear: function() {
        this.playSegment(this.segments.clear);
    },

    playSparkAppear: function() {
        this.playSegment(this.segments.sparkAppear);
    },

    playSparkActive: function() {
        this.playSegment(this.segments.sparkActive);
    },

    playSegment: function(segment) {
        var gameSfx = this.gameSfx;

        gameSfx.currentTime = segment.start;
        this.end = segment.end;

        if(gameSfx.paused) {
            gameSfx.play();
        }
    },


    /*playNextChime: function() {
        var gameSfx = this.gameSfx,
            chimes = this.chimes,
            currentChime = this.currentChime + 1;

        if(currentChime >= chimes.length) {
            currentChime = chimes.length - 1;
        }

        gameSfx.currentTime = chimes[currentChime].start;
        this.end = chimes[currentChime].end;

        if(gameSfx.paused)
            gameSfx.play();

        this.currentChime = currentChime;
    },

    playPreviousChime: function() {
        var gameSfx = this.gameSfx,
            chimes = this.chimes,
            currentChime = this.currentChime - 1;

        if(currentChime < 0) {
            currentChime = 0;
        }

        gameSfx.currentTime = chimes[currentChime].start;
        this.end = chimes[currentChime].end;

        if(gameSfx.paused)
            gameSfx.play();

        this.currentChime = currentChime;
    },*/

    /*resetChime: function() {
        this.currentChime = -1;
    },*/

    // This supposedly enables audio on an HTML audio element on iOS...
    // http://blog.gopherwoodstudios.com/2012/07/enabling-html5-audio-playback-on-ios.html
    enableAudioPlayers: function(element, audioPlayers, onEnd){
        var self = this,
            callbacks = [],
            playerCount = audioPlayers.length,
            readyCount = 0,
            click = false;

        click = function(e){
            var audioPlayer,
                forceStop = function () {
                    this.removeEventListener('play', forceStop, false);
                    this.pause();

                    element.removeEventListener('click', click, false);
                    readyCount++;
                    if(onEnd && readyCount == playerCount) {
                        onEnd();
                        self.gameSfx.addEventListener('timeupdate', $.proxy(self.onPlay, self), false);
                    }

                },
                progress  = function () {
                    this.removeEventListener('canplaythrough', progress, false);
                    if (this.callback) this.callback();
                };

            for(var i = 0; i < playerCount; i++) {
                audioPlayer = audioPlayers[i];
                audioPlayer.addEventListener('play', forceStop, false);
                audioPlayer.addEventListener('canplaythrough', progress, false);
                try {
                    audioPlayer.play();
                } catch (e) {
                    audioPlayer.callback = self.getCallback(audioPlayer, callbacks[i]);
                    /*callback = function () {
                        callback = false;
                        audioPlayer.play();
                    };*/
                }
            }

            $("#gameOverlay").fadeOut();
            $("#gameDisplay").fadeIn();
        };
        element.addEventListener('click', click, false);
        //element.addEventListener('click', click, false);
    },

    getCallback: function(audioPlayer, callback) {
        return function() {
            callback = false;
            audioPlayer.play();
        }
    }
};