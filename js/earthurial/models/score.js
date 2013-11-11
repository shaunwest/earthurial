/**
 * User: shaun
 * Date: 10/31/13 9:37 PM
 */

EARTH.score = {
    TILE_MULTIPLIER_COUNT: 6,
    TILE_INCREMENT: 100,
    TILE_VALUE: 100,
    TILE_VALUE_LIMIT: 600,

    totalScore: 0,
    tileValue: 0,
    tempPoints: 0,
    pointMultiplier: 1,

    stats: {
        clearCount: 0,
        sparkCount: 0,
        morpherCount: 0,
        phoenixCount: 0,
        redCount: 0,
        blackCount: 0,
        blueCount: 0,
        greenCount: 0,
        purpleCount: 0,
        winCount: 0,
        loseCount: 0
    },

    bank: function() {
        this.totalScore += this.tempPoints;
        this.tempPoints = 0;
    },

    // record the numbers of each type used
    recordType: function(type) {
    },

    // decrease the number of usages of a given type
    decrementType: function(type) {
    },

    debug: function() {
        return  "Score: " + this.totalScore + "<br>" +
                "Tile Value: " + this.tileValue + "<br>" +
                "Points: " + this.tempPoints + "<br>" +
                "Multiplier: " + this.pointMultiplier + "<br>";
    }
};
