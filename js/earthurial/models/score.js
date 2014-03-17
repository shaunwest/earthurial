/**
 * User: shaun
 * Date: 10/31/13 9:37 PM
 */

EARTH.score = {
    TILE_MULTIPLIER_COUNT   : 6,
    TILE_INCREMENT          : 100,
    TILE_VALUE              : 100,
    TILE_VALUE_LIMIT        : 600,

    SPARK_BONUS_REQ         : 2,
    MORPHER_BONUS_REQ       : 3,
    PHOENIX_BONUS_REQ       : 5,
    TIME_BONUS_REQ          : 4,

    BONUS_SPARK             : 1,
    BONUS_TIME              : 2,
    BONUS_MORPHER           : 3,
    BONUS_PHOENIX           : 4,
    BONUS_NONE              : 0,

    TIME_BONUS_MAX          : 60,

    SPARK_VALUE             : 200,
    MORPHER_DESTROY_VALUE   : 1000,

    totalScore              : 0,
    tileValue               : 0,
    tempPoints              : 0,
    pointMultiplier         : 1,
    totalTimeBonus          : 0,

    bonusStonesEnabled      : true,

    stats: {
        stoneCounts: [
            0,  // green
            0,  // black
            0,  // blue
            0,  // purple
            0   // red
        ],
        clearCount          : 0,
        sparkCount          : 0,
        morpherCount        : 0,
        phoenixCount        : 0,
        redCount            : 0,
        blackCount          : 0,
        blueCount           : 0,
        greenCount          : 0,
        purpleCount         : 0,
        winCount            : 0,
        loseCount           : 0
    },

    usedTypeCount: function() {
        var count = 0,
            stoneCounts = this.stats.stoneCounts,
            numStoneTypes = stoneCounts.length;

        for(var i = 0; i < numStoneTypes; i++) {
            if(stoneCounts[i] > 0) {
                count++;
            }
        }
        return count;
    },

    // Return the bonus type (if there is a bonus!)
    checkForBonus: function(numTilesSelected) {
        var usedTypeCount = this.usedTypeCount();

        if(numTilesSelected > 0 && usedTypeCount >= this.PHOENIX_BONUS_REQ) {
            return this.BONUS_PHOENIX;

        } else if(numTilesSelected > 0 && usedTypeCount >= this.MORPHER_BONUS_REQ) {
            return this.BONUS_MORPHER;

        } else if(numTilesSelected > 0 && usedTypeCount >= this.SPARK_BONUS_REQ) {
            return this.BONUS_SPARK;

        } else if(numTilesSelected > 0 && usedTypeCount >= this.TIME_BONUS_REQ && this.totalTimeBonus < this.TIME_BONUS_MAX) {
            return this.BONUS_TIME;
        }

        return this.BONUS_NONE;
    },

    resetStoneCounts: function() {
        var stoneCounts = this.stats.stoneCounts;

        for(var i = 0; i < stoneCounts.length; i++) {
            stoneCounts[i] = 0;
        }
    },

    bank: function() {
        this.totalScore += this.tempPoints;
        this.tempPoints = 0;
    },

    // record the numbers of each type used
    recordType: function(type) {
        this.stats.stoneCounts[type]++;
    },

    // decrease the number of usages of a given type
    decrementType: function(type) {
        this.stats.stoneCounts[type]--;
    },

    debug: function() {
        return  "Score: " + this.totalScore + "<br>" +
                "Tile Value: " + this.tileValue + "<br>" +
                "Points: " + this.tempPoints + "<br>" +
                "Multiplier: " + this.pointMultiplier + "<br>";
    }
};
