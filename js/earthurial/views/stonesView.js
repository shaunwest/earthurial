/**
 * User: shaun
 * Date: 11/18/13 7:22 PM
 */


EARTH.stonesView = {
    init: function(score, config) {
        this.score  = score;
        this.stones = [
            {visible: false, $el: config.greenStone},
            {visible: false, $el: config.blackStone},
            {visible: false, $el: config.blueStone},
            {visible: false, $el: config.purpleStone},
            {visible: false, $el: config.redStone}
        ]
    },

    show: function(index) {
        this.stones[index].$el.css("visibility", "visible");
    },

    hide: function(index) {
        this.stones[index].$el.css("visibility", "hidden");
    },

    draw: function() {
        var stones = this.stones,
            stoneCounts = this.score.stats.stoneCounts,
            numStoneTypes = stoneCounts.length,
            stone;

        for(var i = 0; i < numStoneTypes; i++) {
            stone = stones[i];
            if(stoneCounts[i] > 0) {
                if(!stone.visible) {
                    stone.visible = true;
                    stone.$el.css("visibility", "visible");
                }
            } else if(stone.visible) {
                stone.visible = false;
                stone.$el.css("visibility", "hidden");
            }
        }
    }
};
