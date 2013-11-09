/**
 * User: shaun
 * Date: 10/26/13 6:16 PM
 */

EARTH.gameManager = {
    inputManager: null,
    board: null,
    score: null,
    initTrace: false,
    isTracing: false,
    currentDirection: 0,
    disableClearBonus: false,
    tileSet: null,

    init: function(inputManager, score, tileFactory) {
        this.inputManager = inputManager;
        this.score = score;
        this.tileFactory = tileFactory;
        this.isCascading = false;
    },

    createBoard: function(board, savedBoard) {
        var tempBoardString = "",
            tileFactory = this.tileFactory,
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

        this.board = board;

        this.createUpperBoard(board);
    },

    createUpperBoard: function(board) {
        var tempBoard = [],//TODO: PERF - this is going to cause some major GC
            lowerBoard = board.lower,
            upperBoard = board.upper,
            tileFactory = this.tileFactory,
            width = board.boardWidth, height = board.boardHeight,
            tile;

        for (var i = 0; i < width; i++) {
            tempBoard[i] = [];
            for (var j = 0; j < height; j++) {
                if(!upperBoard[i] || !upperBoard[i][j]) {
                    tile = this.getRandomTileForUpper(i, j, lowerBoard, tileFactory);
                    tile.x = i * tile.width;
                    tile.y = (j * tile.height) - 600; //I think this shifts everything up off the visible board
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

        if(tileMatch == 0 && i - 1 >= 0 && board[i - 1][j])
            return tileFactory.getTileType(board[i - 1][j].type);
        else if(tileMatch == 1 && j - 1 >= 0 && board[i][j - 1])
            return tileFactory.getTileType(board[i][j - 1].type);
        else {
            return tileFactory.getSimpleRandomTile();
        }
    },

    getRandomTileForUpper: function(i, j, lowerBoard, tileFactory) {
        var tileMatch = Math.floor(Math.random() * 10); // 2 in 10 chance of copying adjacent tile

        if(tileMatch == 0 && 7 - i - 1 >= 0 && lowerBoard[7 - i - 1][j])
            return tileFactory.getValidTile(lowerBoard[7 - i - 1][j]);
        else if(tileMatch == 1 && j - 1 >= 0 && lowerBoard[7 - i][j - 1])
            return tileFactory.getValidTile(lowerBoard[7 - i][j - 1]);
        else {
            return tileFactory.getSimpleRandomTile();
        }
    },

    update: function(secondsElapsed) {
        var inputManager = this.inputManager,
            board = this.board,
            score = this.score,
            px = inputManager.inputLocation.x,
            py = inputManager.inputLocation.y,
            tile = board.getTileByPxLocation(px, py);

        if(inputManager.startSelecting) {
            if(board.selectedTile) {
                if(board.selectedTile === tile) {
                    this.endPath();
                } else {
                    this.doTileSelect(tile);
                }

            } else {
                board.selectedTile = tile;
                tile.selected = true;

                score.tempPoints = 0;
                score.pointMultiplier = 1;

                score.tileValue = score.TILE_VALUE;

                board.selectedTiles.push(tile);
                board.selectCount++;
                board.totalCount++;

                score.recordType(board.selectedTile.type);
                board.currentType = tile.type;

                this.initTrace = true; // was initMouseDrag

                ///playNextChime();
            }
        }

        if(this.isCascading) {
            this.cascadeTiles(board.upper);
            this.cascadeTiles(board.lower);
        }

        inputManager.update();
    },

    doTileSelect: function(tile) {
        var board = this.board,
            score = this.score,
            selectedTile = board.selectedTile,
            selectedTiles = board.selectedTiles;

        if(selectedTile) {
            var lastIndex = selectedTiles.length - 1;
            var thisTileIndex = selectedTiles.indexOf(tile);

            ///if(speedTimer != null)
            ///    speedTimer.stop();

            // If this isn't the first tile, clear all tiles that have been
            // selected beyond this one.
            if(thisTileIndex > -1) {
                for(var i = lastIndex; i > thisTileIndex; i--) {
                    var t = selectedTiles[i];
                    t.selected = false;
                    selectedTiles.splice(i, 1); // remove tile
                    score.decrementType(t.type);

                    if(i > 1) {
                        if(i <= score.TILE_MULTIPLIER_COUNT) {
                            score.tileValue -= score.TILE_INCREMENT;
                        }

                        score.tempPoints -= (score.tileValue * score.pointMultiplier);
                    }
                    if(i > 0) {
                        var previousTile = selectedTiles[i - 1];
                        if(t.type !== previousTile.type) {
                            score.pointMultiplier--;
                        }

                    }
                    ///playPreviousChime();
                }

                // Figure out new selectCount
                board.selectCount = 0;
                for(var j = thisTileIndex; j >= 0; j--) {
                    var t2 = selectedTiles[i];
                    board.selectCount++;
                    if(j > 0) {
                        var previousTile2 = selectedTiles[j - 1];
                        if(t2.type !== previousTile2.type) {
                            break;
                        }

                    } else {
                        break;
                    }
                }

                board.totalCount = board.selectCount;
                board.selectedTile = tile;

            } else if(tile !== selectedTile && board.isAdjacentToTile(tile, selectedTile)) {
                if(selectedTile.type !== tile.type) {
                    if(board.selectCount >= board.SELECTION_LENGTH && board.selectCount >= 3) {
                        tile.selected = true;
                        selectedTiles.push(tile);
                        score.recordType(tile.type);
                        board.currentType = tile.type;
                        board.selectCount = 1;
                        board.selectedTile = tile;

                        score.pointMultiplier++;
                        ///playNextChime();
                    } else {
                        return;
                    }
                } else {
                    tile.selected = true;
                    selectedTiles.push(tile);

                    score.recordType(tile.type);

                    board.selectCount++;
                    board.totalCount++;
                    board.selectedTile = tile;
                    ///playNextChime();
                }

                if(selectedTiles.length > 2) {
                    score.tempPoints += (score.tileValue * score.pointMultiplier);
                    if(score.tileValue < score.TILE_VALUE_LIMIT) {
                        score.tileValue += score.TILE_INCREMENT;
                    }
                }
            }
        }
    },

    cascadeTiles: function(grid) {
        var board = this.board,
            width = board.boardWidth,
            height = board.boardHeight,
            cascading = false,
            tile;

        for(var i = 0; i < width; i++) {
            for(var j = 0; j < height; j++) {
                tile = grid[i][j];
                if(tile.falling) {
                    if(board.isEmpty(grid, i, j + 1)) {
                        if(j * board.tileHeight == j + 1) {
                            tile.falling = false;
                            grid[i][j] = null;
                            grid[i][j + 1] = tile;

                        } else {
                            tile.y++;
                            cascading = true;
                        }
                    }
                }
            }
        }

        this.isCascading = cascading;
    },

    endPath: function() {
        this.deselectTiles();
        this.clearSet();
        this.resetValues();
    },

    deselectTiles: function() {
        var selectedTiles = this.board.selectedTiles,
            length = selectedTiles.length,
            t;

        for(var i = 0; i < length; i++) {
            t = selectedTiles[i];
            t.selected = false;
        }
    },

    clearSet: function() {
        var board = this.board,
            score = this.score;

        if((board.selectedTiles.length == board.selectCount && board.selectCount >= board.SELECTION_LENGTH) || board.selectCount > 2) {
            this.destroyTiles(board.selectedTiles);
            ///dispatchPointEvent(true);
            ///bank();
            score.stats.clearCount += board.selectedTiles.length;

            //for each(var color:String in Tile1.colors) {
            //    if(colorIndexMap[color] != null) {
            //        var colorIndex:int = colorIndexMap[color];
            //        stats[color + "_count"] += colorsUsed[colorIndex].count;
            //    }
            //}

            board.selectedTiles.length = 0; // OLDTODO: can this move to resetValues()??
        } else {
            board.selectedTiles.length = 0;
            score.tempPoints = 0;
            ///resetColorsUsed();
        }
    },

    destroyTiles: function(tileSet) {
        var tile;

        this.tileSet = tileSet;
        this.inputManager.enableInput(false);

        if(!this.disableClearBonus) {
            // Notify user of bonus
            //if(tileSet.length > 0 && getUsedColorCount() >= PHOENIX_BONUS_REQ && !gameParameters.bonus_stones_off) {
            //    dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "PHOENIX!", PHOENIX_CODE));
            //} else if(tileSet.length > 0 && getUsedColorCount() >= MORPHER_BONUS_REQ && !gameParameters.bonus_stones_off) {
            //    dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Morpher Stone!", MORPHER_CODE));
            //} else if(tileSet.length > 0 && getUsedColorCount() >= SPARK_BONUS_REQ && !gameParameters.bonus_stones_off) {
            //    dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Spark Stone!", SPARK_CODE));
            //} else if(tileSet.length > 0 && getUsedColorCount() >= TIME_BONUS_REQ && totalTimeBonus < TIME_BONUS_MAX && !gameParameters.time_bonus_off) {
            //    dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Time Bonus!", TIME_CODE));
            //}
        }

        // TODO: what is this for?
        for(var i = 0; i < tileSet.length; i++) {
            tile = tileSet[i];
            tile.glowing = true;
        }

        //glowTimer = new Timer(400, 1);
        //glowTimer.addEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);
        //glowTimer.start();
        this.removeTiles();

        ///clearSound.play();
    },

    removeTiles: function() {
        var board = this.board,
            tileSet = this.tileSet,
            tileWasRemoved = false,
            tile;

        //glowTimer.stop();
        //glowTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);

        for(var i = 0; i < tileSet.length; i++) {
            tile = tileSet[i];
            //if(this.boardContainer.contains(tile)) {
            //    if(tile.getSparkHalo()) {
            //        tile.setSparkHalo(false);
            //        tile.applyHalo();
            //        tile.removeEventListener(MouseEvent.CLICK, onSparkClick);
            //    } else if(tile.getMorpherHalo()) {
            //        tile.setMorpherHalo(false);
            //        tile.applyHalo();
            //        tile.removeEventListener(MouseEvent.CLICK, doMorpher);
            //    }
            //    this.boardContainer.removeElement(tile);
                tileWasRemoved = true;
            //}
            board.removeTile(tile);
        }

        if(!this.disableClearBonus) {
            // See AS3 code
        }

        ///resetColorsUsed();

        if(tileWasRemoved) {
            this.startCascade();
        } else {
            this.inputManager.enableInput(true);
        }

        tileSet.length = 0;
    },

    startCascade: function() {

    },

    /*startCascade: function() {
        var newBoardCounts = [], newBoard = [],
            board = this.board,
            lower = board.lower, upper = board.upper,
            width = board.boardWidth, height = board.boardHeight;

        this.isCascading = true;

        for(var i = 0; i < width; i++) {
            newBoard[i] = [];
            newBoardCounts[i] = 0;
            for(var j = 0; j < height; j++) {
                var emptyCount = 0;
                for(var k = j + 1; k < height; k++) {
                    if(lower[i][k] == null) {
                        emptyCount++;
                    }
                }

                if(lower[i][j] != null) {
                    ///lower[i][j].startCascade(emptyCount);
                    lower[i][j].falling = true;
                    newBoard[i][j + emptyCount] = lower[i][j];
                } else {
                    emptyCount++;
                }

                if(emptyCount > newBoardCounts[i]) {
                    newBoardCounts[i] = emptyCount;
                }
            }
        }

        for(var m = 0; m < width; m++) {
            var count = newBoardCounts[m];
            for(var n = height - count; n < height; n++) {
                var t = upper[m][n];
                ////t.startCascade(count);
                t.falling = true;
                newBoard[m][-(8 - n - count)] = t;
                upper[m][n] = null;
            }
        }

        this.board.lower = newBoard;
        this.createUpperBoard(this.board);

        ///fallSound.play();

        this.inputManager.enableInput(true);

        //if(!movesRemain()) {
        //    dispatchEvent(new GameEndEvent(GameEndEvent.END_EVENT, "No moves remain"));
        //}
    },*/

    resetValues: function() {
        var board = this.board,
            score = this.score;

        this.isTracing = false;
        this.initTrace = false;

        board.selectCount = 0;
        board.totalCount = 0;
        score.tileValue = score.TILE_VALUE;
        board.selectedTile = null;
        this.currentDirection = 0;
        score.pointMultiplier = 0;
        this.disableClearBonus = false;

        /// resetChime();
    }
};


