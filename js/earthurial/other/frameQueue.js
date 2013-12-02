/**
 * User: shaun
 * Date: 11/25/13 7:23 PM
 */


EARTH.frameQueue = {
    init: function() {
        this.queue  = [];
    },

    enqueue: function(func) {
        this.queue.push(func);
    },

    dequeue: function() {
        this.queue.shift()();
    },

    update: function() {
        if(!this.isEmpty()) {
            this.dequeue();
        }
    },

    isEmpty: function() {
        return (this.queue.length == 0);
    }
};