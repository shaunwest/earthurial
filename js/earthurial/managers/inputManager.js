/**
 * User: shaun
 * Date: 11/1/13 12:26 AM
 */

EARTH.inputManager = {
    DEFAULT_TOP_OFFSET: 600,

    init: function($inputRegion) {
        this.$inputRegion   = $inputRegion;
        this.$inputContainer= $inputRegion.parent();
        this.down           = false;
        this.startSelecting = false;
        this.selecting      = false;
        this.endSelecting   = false;
        this.inputLocation  = {x: 0, y: 0};
        this.inputEnabled   = true;
        //this.inputStart     = (mode == "touch") ? "touchstart" : "mousedown"; //"touchstart"
        //this.inputEnd       = (mode == "touch") ? "touchend" : "mouseup"; //"touchend"
        //this.inputMove      = (mode == "touch") ? "touchmove" : "mousemove"; //"touchmove"??
        this.topOffset      = this.DEFAULT_TOP_OFFSET;

        this.addListeners();
    },

    enableInput: function(enable) {
        if(this.inputEnabled != enable) {
            this.inputEnabled = enable;
            (enable) ?
                this.addListeners() :
                this.removeListeners();
        }
    },

    addListeners: function($inputRegion) {
        this.down = false;
        this.selecting = false;

        $inputRegion = $inputRegion || this.$inputRegion;

        $inputRegion.on("touchstart mousedown", $.proxy(this.onInputDown, this));
        $inputRegion.on("touchmove mousemove", $.proxy(this.onInputMove, this));
        $("body").on("touchend mouseup", $.proxy(this.onInputUp, this));
    },

    removeListeners: function($inputRegion) {
        $inputRegion = $inputRegion || this.$inputRegion;
        $inputRegion.off();
        $("body").off();
    },

    // FIXME: seems to have issues when the board scales down
    onInputDown: function(event) {
        var touch = (event.originalEvent && event.originalEvent.touches) ? event.originalEvent.touches[0] : null,
            pageX = (touch) ? touch.pageX : event.pageX,
            pageY = (touch) ? touch.pageY : event.pageY;

        if(!this.down) {
            this.startSelecting = true;
            this.down = true;
        }

        this.inputLocation.x = pageX - this.$inputContainer.offset().left;
        this.inputLocation.y = (pageY - (this.$inputContainer.offset().top)) + this.topOffset;

        event.preventDefault();
    },

    onInputMove: function(event) {
        var touch = (event.originalEvent && event.originalEvent.touches) ? event.originalEvent.touches[0] : null,
            pageX = (touch) ? touch.pageX : event.pageX,
            pageY = (touch) ? touch.pageY : event.pageY;

        if(this.down) {
            this.selecting = true;
            this.inputLocation.x = pageX - this.$inputContainer.offset().left;
            this.inputLocation.y = (pageY - (this.$inputContainer.offset().top)) + this.topOffset;
        }

        event.preventDefault();
    },

    onInputUp: function(event) {
        this.down = false;
        if(this.selecting) {
            this.selecting = false;
            this.endSelecting = true;
        }
    },

    update: function() {
        this.startSelecting = false;
        this.endSelecting = false;
    },

    debug: function() {
        return "input on: " + this.inputEnabled + "<br>" +
            "input loc x: " + this.inputLocation.x + ", " + this.inputLocation.y + "<br>" +
            "down: " + this.down + "<br>";
    }
};