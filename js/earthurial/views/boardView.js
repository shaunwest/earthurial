/**
 * User: shaun
 * Date: 10/31/13 8:16 PM
 */


EARTH.boardView = {
    canvas: null,
    board: null,
    tileSheet: null,

    init: function(canvas, board, tileSheet) {
        this.canvas     = canvas;
        this.board      = board;
        this.tileSheet  = tileSheet;
    },

    draw: function() {
        var lowerBoard = this.board.lower,
            width = lowerBoard.length,
            height = lowerBoard[0].length,
            context = this.canvas.getContext('2d'),
            tileSheet = this.tileSheet;

        for(var i = 0; i < width; i++) {
            for(var j = 0; j < height; j++) {
                this.drawTile(lowerBoard[i][j], tileSheet, context);
            }
        }
    },

    drawTile: function(tile, tileSheet, context) {
        var tileImage = tileSheet[tile.type][0];
        context.drawImage(tileImage, tile.x, tile.y);
    }
};