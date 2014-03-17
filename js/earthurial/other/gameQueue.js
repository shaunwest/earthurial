/**
 * User: shaun
 * Date: 11/25/13 7:23 PM
 */


EARTH.gameQueue = {
    init: function() {
        this.queue  = [];
    },

    // FIXME: new object instantiated every time. Bad for GC.
    enqueue: function(func, wait) {
        this.queue.push({func: func, wait: wait});
    },

    peek: function() {
        if(!this.isEmpty()) {
            return this.queue[0];
        }
    },

    dequeue: function() {
        if(!this.isEmpty()) {
            this.queue.shift().func();
        }
    },

    update: function(secondsElapsed) {
        var current;
        if(current = this.peek()) {
            current.wait -= (secondsElapsed * 1000);
            if(current.wait <= 0) {
                this.dequeue();
            }
        }
    },

    isEmpty: function() {
        return (this.queue.length == 0);
    }
};