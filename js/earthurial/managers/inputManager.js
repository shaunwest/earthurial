/**
 * User: shaun
 * Date: 11/1/13 12:26 AM
 */

EARTH.inputManager = {
    init: function($inputRegion) {
        this.$inputRegion   = $inputRegion;
        this.$inputContainer= $inputRegion.parent();
        this.up             = true;
        this.selecting      = false;
        this.startSelecting = false;
        this.endSelecting   = false;
        this.inputLocation  = {x: 0, y: 0};
        this.inputEnabled   = true;
        this.inputStart     = "mousedown"; //"touchstart"
        this.inputEnd       = "mouseup"; //"touchend"

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
        this.up = true;

        $inputRegion = $inputRegion || this.$inputRegion;

        $inputRegion.on(this.inputStart, $.proxy(this.onInputDown, this));
        $inputRegion.on(this.inputEnd, $.proxy(this.onInputUp, this));
    },

    removeListeners: function($inputRegion) {
        $inputRegion = $inputRegion || this.$inputRegion;
        $inputRegion.off();
    },

    // FIXME: seems to have issues when the board scales down
    onInputDown: function(event) {
        var touch = (event.originalEvent && event.originalEvent.touches) ? event.originalEvent.touches[0] : null,
            pageX = (touch) ? touch.pageX : event.pageX,
            pageY = (touch) ? touch.pageY : event.pageY;

        if(this.up) {
            this.startSelecting = true;
            this.up = false;
        }

        this.inputLocation.x = pageX - this.$inputContainer.offset().left;
        this.inputLocation.y = pageY - this.$inputContainer.offset().top;
    },

    onInputUp: function(event) {
        this.up = true;
        this.endSelecting = true;
    },

    update: function() {
        this.startSelecting = false;
    },

    debug: function() {
        return "input on: " + this.inputEnabled + "<br>" +
            "up: " + this.up + "<br>";
    }
};