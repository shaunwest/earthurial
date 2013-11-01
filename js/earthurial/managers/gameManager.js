/**
 * User: shaun
 * Date: 10/26/13 6:16 PM
 */

EARTH.gameManager = {
    selectedTiles: [],

    // TODO: add mouse/touch handler for tiles
    createBoard: function(board, savedBoard, tileFactory) {
        var tempBoardString = "",
            lowerBoard = board.lower,
            width = board.boardWidth, height = board.boardHeight,
            tile, pos;

        for (var i = 0; i < width; i++) {
            lowerBoard[i] = [];

            for (var j = 0; j < height; j++) {
                if(savedBoard) {
                    tile = tileFactory.getTile();
                    pos = j + (i * width);
                    tile.type = parseInt(savedBoard.substr(pos, 1));
                } else {
                    tile = this.getRandomTile(i, j, lowerBoard, tileFactory);
                    tempBoardString += tile.type.toString();
                }

                tile.x = i * board.tileWidth;
                tile.y = j * board.tileHeight;

                lowerBoard[i][j] = tile;
            }
        }

        board.string = tempBoardString;

        this.createUpperBoard(board, tileFactory);
    },

    createUpperBoard: function(board, tileFactory) {
        var tempBoard = [],//TODO: PERF - this is going to cause some major GC
            lowerBoard = board.lower,
            upperBoard = board.upper,
            width = board.boardWidth, height = board.boardHeight,
            tile;

        for (var i = 0; i < width; i++) {
            tempBoard[i] = [];
            for (var j = 0; j < height; j++) {
                if(upperBoard[i][j] == null) {
                    tile = this.getRandomTileForUpper(i, j, lowerBoard, tileFactory);
                    tile.x = i * tile.width;
                    tile.y = (j * tile.height) - 600; //TODO uh, what is this 600?
                    tempBoard[i][j] = tile;
                } else {
                    tempBoard[i][j] = upperBoard[i][j];
                }
            }
        }

        board.upper = tempBoard;
    },

    getRandomTile: function(i, j, board, tileFactory) {
        var tileMatch = Math.floor(Math.random() * 40); // 2 in 40 chance of copying adjacent tile

        if(tileMatch == 0 && i - 1 >= 0 && board[i - 1][j] != null)
            return board[i - 1][j];
        else if(tileMatch == 1 && j - 1 >= 0 && board[i][j - 1] != null)
            return board[i][j - 1];
        else {
            return tileFactory.getSimpleRandomTile();
        }
    },

    getRandomTileForUpper: function(i, j, lowerBoard, tileFactory) {
        var tileMatch = Math.floor(Math.random() * 10); // 2 in 10 chance of copying adjacent tile

        if(tileMatch == 0 && 7 - i - 1 >= 0 && lowerBoard[7 - i - 1][j] != null)
            return tileFactory.getValidTile(lowerBoard[7 - i - 1][j]);
        else if(tileMatch == 1 && j - 1 >= 0 && lowerBoard[7 - i][j - 1] != null)
            return tileFactory.getValidTile(lowerBoard[7 - i][j - 1]);
        else {
            return tileFactory.getSimpleRandomTile();
        }
    },

    update: function() {

    }
};


