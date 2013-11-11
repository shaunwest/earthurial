/**
 * User: shaun
 * Date: 11/1/13 12:37 AM
 */


EARTH.timeManager = {
    ONE_SECOND: 1000,
    MINIMUM_FRAME_LENGTH: 0.048,
    TIMER_START: 61,

    init: function(targetFps, updateFunc, drawFunc) {
        this.targetFps      = targetFps;
        this.updateFunc     = updateFunc;
        this.drawFunc       = drawFunc;
        this.frameFunc      = $.proxy(this.frame, this);
        this.fps            = 0;
        this.ticks          = 0;
        this.frameCount     = 1;
        this.maxFrameCount  = 30;
        this.elapsedTotal   = 0;
        this.timerCount     = this.TIMER_START;
        this.lastUpdateTime = new Date();
        this.averageElapsed = 0;
        this.elapsedSeconds = 0;
        this.frameLength    = Math.floor(this.ONE_SECOND / this.targetFps);
        this.frameTimerId   = 0;
        this.oneSecTimerId  = 0;
        this.running        = false;
        this.timeout        = 0;
        this.timeoutCount   = 0;
        this.timeoutFunc    = null;
        this.$reportFps     = null;

        this.initRequestAnimationFrame(this.frameLength);
    },

    start: function() {
        if(!this.running && this.updateFunc && this.drawFunc) {
            this.running = true;
            this.oneSecTimerId = window.setInterval($.proxy(this.oneSecondTick, this), this.ONE_SECOND);
            this.frame();
        }
    },

    stop: function() {
        this.running = false;
        window.clearInterval(this.oneSecTimerId);
        window.cancelAnimationFrame(this.frameTimerId);
    },

    setTimeout: function(seconds, func, cancel) {
        if(this.timeout == 0 || cancel == true) {
            this.timeout = seconds;
            this.timeoutFunc = func;
        }
    },

    frame: function() {
        var now = +new Date(),
            secondsElapsed = Math.min(
                (now - this.lastUpdateTime) / this.ONE_SECOND,
                this.MINIMUM_FRAME_LENGTH
            );

        this.timerCount -= secondsElapsed;
        this.lastUpdateTime = now;

        secondsElapsed = this.getAverageElapsed(secondsElapsed);

        if(this.timeout) {
            this.timeoutCount += secondsElapsed;
            if(this.timeoutCount >= this.timeout) {
                this.timeout = 0;
                this.timeoutCount = 0;
                this.timeoutFunc();
            }
        }

        this.updateFunc(secondsElapsed);
        this.drawFunc();

        this.ticks++;

        if(this.running) {
            this.frameTimerId = window.requestAnimationFrame(this.frameFunc);
        }
    },

    getAverageElapsed: function(elapsedSeconds) {
        if(++this.frameCount == this.maxFrameCount + 1) {
            this.averageElapsed = this.elapsedTotal / this.frameCount;
            this.frameCount = 1;
            this.elapsedTotal = 0;
        }

        this.elapsedTotal += elapsedSeconds;

        return (this.averageElapsed == 0) ? elapsedSeconds : this.averageElapsed;
    },

    oneSecondTick: function() {
        this.fps = this.ticks.toString();
        if(this.$reportFps) {
            this.$reportFps.text(this.fps);
        }
        this.ticks = 0;
        this.elapsedSeconds++;
    },

    initRequestAnimationFrame: function(frameLength) {
        var vendors = ['ms', 'moz', 'webkit', 'o'];

        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return window.setTimeout(callback, frameLength);
            };
        }

        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function(id) {
                window.clearTimeout(id);
            };
        }
    }
};