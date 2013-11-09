/**
 * User: shaun
 * Date: 10/31/13 8:16 PM
 */


EARTH.boardView = {
    init: function(canvas, board, tileSheet) {
        this.canvas     = canvas;
        this.board      = board;
        this.tileSheet  = tileSheet;
    },

    // TODO: only areas that have changed should be redrawn?
    draw: function() {
        var lowerBoard = this.board.lower,
            width = lowerBoard.length,
            height = lowerBoard[0].length,
            canvas = this.canvas,
            context = canvas.getContext('2d'),
            tileSheet = this.tileSheet,
            tile;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0; i < width; i++) {
            for(var j = 0; j < height; j++) {
                tile = lowerBoard[i][j];
                if(tile) {
                    this.drawTile(tile, tileSheet, context);
                }
            }
        }
    },

    drawTile: function(tile, tileSheet, context) {
        var tileImage = (tile.selected) ? tileSheet[tile.type][1] : tileSheet[tile.type][0];
        if(tileImage) {
            context.drawImage(tileImage, tile.x, tile.y);
        } else {
            EARTH.log("boardView: tile image is not defined.");
        }
    }
};