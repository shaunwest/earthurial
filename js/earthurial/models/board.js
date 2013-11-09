/**
 * User: shaun
 * Date: 10/31/13 9:32 PM
 */

EARTH.board = {
    SELECTION_LENGTH: 2,

    lower: [],
    upper: [],
    string: "",
    boardWidth: 8,
    boardHeight: 8,
    tileWidth: 75,
    tileHeight: 75,
    selectedTile: null,
    selectedTiles: [],
    selectCount: 0,
    totalCount: 0,
    currentType: -1,

    getTileByPxLocation: function(px, py) {
        var bx = Math.floor(px / this.tileWidth),
            by = Math.floor(py / this.tileHeight);

        return this.lower[bx][by];
    },

    removeTile: function(tile) {
        var bx = Math.floor(tile.x / this.tileWidth),
            by = Math.floor(tile.y / this.tileHeight);

        this.lower[bx][by] = null;
    },

    isAdjacentToTile: function(tile, adjacentTile) {
        var board = this.lower,
            bx = Math.floor(tile.x / this.tileWidth),
            by = Math.floor(tile.y / this.tileHeight);

        if(bx - 1 >= 0 && board[bx - 1][by] === adjacentTile)
            return true;

        if(bx + 1 < this.boardWidth && board[bx + 1][by] === adjacentTile)
            return true;

        if(by - 1 >= 0 && board[bx][by - 1] === adjacentTile)
            return true;

        if(by + 1 < this.boardHeight && board[bx][by + 1] === adjacentTile)
            return true;

        return false;
    },

    isEmpty: function(board, bx, by) {
        if(bx >= 0 && bx < this.boardWidth && by >= 0 && by < this.boardHeight && board[bx][by] == null) {
            return true;
        }
        return false;
    },

    debug: function() {
        return "Select count: " + this.selectedTiles.length + "<br>";
    }
};
