/**
 * User: shaun
 * Date: 11/19/13 8:04 PM
 */


EARTH.hudView = {
    init: function(score, time, $scoreEl, $pointsEl, $timerEl) {
        this.scoreModel = score;
        this.timeModel  = time;
        this.lastScore  = -1;
        this.lastTimer  = 0;
        this.lastPoints = -1;
        this.$scoreEl   = $scoreEl;
        this.$timerEl   = $timerEl;
        this.$pointsEl  = $pointsEl;
    },

    draw: function() {
        var totalScore = this.scoreModel.totalScore,
            tempPoints = this.scoreModel.tempPoints,
            timer = this.timeModel.timerCount;

        if(totalScore != this.lastScore) {
            this.$scoreEl.text(EARTH.numberWithCommas(totalScore));
            this.lastScore = totalScore;
        }

        if(timer != this.lastTimer) {
            this.$timerEl.text(timer);
            this.lastTimer = timer;
        }

        if(tempPoints != this.lastPoints) {
            this.$pointsEl.text(EARTH.numberWithCommas(tempPoints));
            this.lastPoints = tempPoints;
        }
    }
};