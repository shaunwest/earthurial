/**
 * User: shaun
 * Date: 10/26/13 6:16 PM
 */

EARTH.gameManager = {
    stats: {
        clear_count: 0,
        spark_count: 0,
        morpher_count: 0,
        phoenix_count: 0,
        red_count: 0,
        black_count: 0,
        blue_count: 0,
        green_count: 0,
        purple_count: 0,
        win_count: 0,
        lose_count: 0
    },
    board: [],
    upperBoard: [],
    selectedTiles: [],
    boardString: "",

    // TODO: add mouse/touch handler for tiles
    // TODO: tile class
    createBoard: function(savedBoard) {
        var tempBoardString = "",
            board = [],
            t, col, pos, colorCode;

        for (var i = 0; i < 8; i++) {
            board[i] = [];

            for (var j = 0; j < 8; j++) {
                t = new Tile1();
                t.x = i * t.width;
                t.y = j * t.height;

                if(savedBoard != "" && savedBoard != null) {
                    pos = j + (i * 8);
                    colorCode = parseInt(savedBoard.substr(pos, 1));
                    col = Tile1.colors[colorCode];
                } else {
                    col = this.getRandomColor(i, j, board);
                    tempBoardString += Tile1.colorMap[col].toString();
                }

                t.setColor(col);
                board[i][j] = t;

                // TODO: Add to board
                //this.boardContainer.addElement(t);
            }
        }

        this.boardString = tempBoardString;

        this.createUpperBoard();
    },

    createUpperBoard: function() {
        var tempBoard = [],
            upperBoard = this.upperBoard,
            t;

        for (var i = 0; i < 8; i++) {
            tempBoard[i] = [];
            for (var j = 0; j < 8; j++) {
                if(upperBoard == null || upperBoard[i][j] == null) {
                    t = new Tile1();
                    t.x = i * t.width;
                    t.y = (j * t.height) - 600;
                    t.setColor(this.getRandomColorForUpper(i, j));
                    tempBoard[i][j] = t;

                    // TODO: add to board
                    //this.boardContainer.addElement(t);
                } else {
                    tempBoard[i][j] = upperBoard[i][j];
                }
            }
        }

        this.upperBoard = tempBoard;
    },

    getRandomColor: function(i, j, board) {
        var colorMatch = Math.floor(Math.random() * 40); // 2 in 10 chance of copying adjacent color

        if(colorMatch == 0 && i - 1 >= 0 && board[i - 1][j] != null)
            return board[i - 1][j].getColor();
        else if(colorMatch == 1 && j - 1 >= 0 && board[i][j - 1] != null)
            return board[i][j - 1].getColor();
        else {
            return this.getSimpleRandomColor();
        }
    },

    getRandomColorForUpper: function(i, j) {
        var board = this.board,
            colorMatch = Math.floor(Math.random() * 10); // 2 in 8 chance of copying adjacent color

        if(colorMatch == 0 && 7 - i - 1 >= 0 && board[7 - i - 1][j] != null)
            return this.getValidColor(board[7 - i - 1][j]);
        else if(colorMatch == 1 && j - 1 >= 0 && board[7 - i][j - 1] != null)
            return this.getValidColor(board[7 - i][j - 1]);
        else {
            return this.getSimpleRandomColor();
        }
    },

    getSimpleRandomColor: function() {
        var colorIndex = Math.floor(Math.random() * (Tile1.colors.length)); // NOTE: don't use red
        return Tile1.colors[colorIndex];
    },

    getValidColor: function(tile) {
        var color = tile.getColor();

        if(color != "morpher" &&
            color != "super_morpher" &&
            color != "spark" &&
            color != "phoenix") {
            return color;
        }
        else {
            return this.getSimpleRandomColor();
        }
    },

    update: function() {

    }
};


