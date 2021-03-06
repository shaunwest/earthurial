/**
 * User: shaun
 * Date: 10/31/13 9:32 PM
 */

EARTH.board = {
  SELECTION_LENGTH: 2,
  DEFAULT_WIDTH: 8,
  DEFAULT_HEIGHT: 16,
  MAX_CLEAR_COUNT: 9,

  grid: [],
  string: "",
  boardWidth: this.DEFAULT_WIDTH,
  boardHeight: this.DEFAULT_HEIGHT,
  tileWidth: 75,
  tileHeight: 75,
  selectedTile: null,
  selectedTiles: [],
  selectCount: 0,
  totalCount: 0,
  currentType: -1,
  //clearCount: this.MAX_CLEAR_COUNT,

  getRow: function(tile) {
    return Math.floor(tile.y / this.tileHeight);
  },

  getColumn: function(tile) {
    return Math.floor(tile.x / this.tileWidth);
  },

  getTileLocationByPxLocation: function(px, py) {
    return {
      bx: Math.floor(px / this.tileWidth),
      by: Math.floor(py / this.tileHeight)
    };
  },

  getTileByPxLocation: function(px, py) {
    var bx = Math.floor(px / this.tileWidth),
      by = Math.floor(py / this.tileHeight);

    if(bx < this.boardWidth && by < this.boardHeight) {
      return this.grid[bx][by];
    }
    return null;
  },

  getTile: function(bx, by) {
    if(bx >= 0 && by >= 0 && bx < this.boardWidth && by < this.boardHeight) {
      return this.grid[bx][by];
    }
  },

  removeTile: function(tile) {
    var bx = Math.floor(tile.x / this.tileWidth),
      by = Math.floor(tile.y / this.tileHeight);

    this.grid[bx][by] = null;
  },

  addTile: function(tile) {
    var bx = Math.floor(tile.x / this.tileWidth),
      by = Math.floor(tile.y / this.tileHeight);

    this.grid[bx][by] = tile;
  },

  isAdjacentToTile: function(tile, adjacentTile) {
    var board = this.grid,
      bx = Math.floor(tile.x / this.tileWidth),
      by = Math.floor(tile.y / this.tileHeight);

    if(bx - 1 >= 0 && board[bx - 1][by] === adjacentTile) {
      return true;
    }

    if(bx + 1 < this.boardWidth && board[bx + 1][by] === adjacentTile) {
      return true;
    }

    if(by - 1 >= 0 && board[bx][by - 1] === adjacentTile) {
      return true;
    }

    if(by + 1 < this.boardHeight && board[bx][by + 1] === adjacentTile) {
      return true;
    }

    return false;
  },

  isEmpty: function(bx, by) {
    if(bx >= 0 && bx < this.boardWidth && by >= 0 && by < this.boardHeight && this.grid[bx][by] == null) {
      return true;
    }
    return false;
  },

  isWithinBounds: function(bx, by) {
    if(bx >= 0 && bx < this.boardWidth && by >= 0 && by < this.boardHeight) {
      return true;
    }
    return false;
  },

  debug: function() {
    return "Select count: " + this.selectedTiles.length + "<br>";
  }
};
