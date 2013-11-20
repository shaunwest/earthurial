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
        var grid = this.board.grid,
            width = this.board.boardWidth,
            height = this.board.boardHeight,
            canvas = this.canvas,
            context = canvas.getContext('2d'),
            tileSheet = this.tileSheet,
            tile;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0; i < width; i++) {
            for(var j = 8; j < height; j++) {
                tile = grid[i][j];
                if(tile) {
                    this.drawTile(tile, tileSheet, context);
                }
            }
        }
    },

    getTileImage: function(tile, tileSheet) {
        if(tile.clearing) {
            return tileSheet[this.board.clearCount][2];
        } else if(tile.selected) {
            return tileSheet[tile.type][1];
        } else {
            return tileSheet[tile.type][0];
        }
    },

    drawTile: function(tile, tileSheet, context) {
        var tileImage = this.getTileImage(tile, tileSheet); //(tile.selected) ? tileSheet[tile.type][1] : tileSheet[tile.type][0];
        if(tileImage) {
            context.drawImage(tileImage, tile.x, tile.y);
        } else {
            EARTH.log("boardView: tile image is not defined.");
        }
    }
};