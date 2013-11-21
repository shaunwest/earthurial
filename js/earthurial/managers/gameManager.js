/**
 * User: shaun
 * Date: 10/26/13 6:16 PM
 */

EARTH.gameManager = {
    inputManager: null,
    board: null,
    score: null,
    sounds: null,
    currentDirection: 0,
    disableClearBonus: false,
    tileSet: null,

    init: function(inputManager, score, tileFactory, fallSpeed, audioManager) {
        this.inputManager = inputManager;
        this.score = score;
        this.audioManager = audioManager;
        this.tileFactory = tileFactory;
        this.fallSpeed = fallSpeed;
        this.isCascading = false;
        this.bonus = score.BONUS_NONE;
    },

    createBoard: function(board, savedBoard) {
        var tempBoardString = "",
            tileFactory = this.tileFactory,
            grid = board.grid,
            width = board.boardWidth, height = board.boardHeight,
            tile, pos;

        for (var i = 0; i < width; i++) {
            grid[i] = [];

            for (var j = 0; j < height; j++) {
                if(savedBoard) {
                    tile = tileFactory.getTile();
                    pos = j + (i * width);
                    tile.type = parseInt(savedBoard.substr(pos, 1));
                } else {
                    tile = this.getRandomTile(i, j, grid, tileFactory);
                    tempBoardString += tile.type.toString();
                }

                tile.x = i * board.tileWidth;
                tile.y = j * board.tileHeight;

                grid[i][j] = tile;
            }
        }

        board.string = tempBoardString;

        this.board = board;
    },

    createUpperTiles: function() {
        var board = this.board,
            grid = board.grid,
            width = board.boardWidth,
            tileFactory = this.tileFactory,
            tile;

        for(var i = 0; i < width; i++) {
            for(var j = 7; j >= 0; j--) {
                if(!grid[i][j]) {
                    tile = this.getRandomTileForUpper(i, j, grid, tileFactory);
                    tile.x = i * board.tileWidth;
                    tile.y = j * board.tileHeight;

                    grid[i][j] = tile;
                }
            }
        }
    },

    createMorpherTile: function(column) {
        var tileFactory = this.tileFactory,
            board = this.board,
            tile = tileFactory.getTileType(5); // morpher

        tile.x = (column * board.tileWidth);
        tile.y = (7 * board.tileHeight); // create in upper section of board

        board.addTile(tile);
        //flareSound.play();
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

    getRandomTileForUpper: function(i, j, board, tileFactory) {
        var tileMatch = Math.floor(Math.random() * 10); // 2 in 10 chance of copying adjacent tile

        if(tileMatch == 0 && 7 - i - 1 >= 0 && board[7 - i - 1][j])
            return tileFactory.getValidTile(board[7 - i - 1][j]);
        else if(tileMatch == 1 && j - 1 >= 0 && board[7 - i][j - 1])
            return tileFactory.getValidTile(board[7 - i][j - 1]);
        else {
            return tileFactory.getSimpleRandomTile();
        }
    },

    update: function(secondsElapsed) {
        var inputManager = this.inputManager,
            score = this.score,
            board = this.board;

        if(inputManager.startSelecting) {
            this.startSelection(inputManager.inputLocation);

        } else if(inputManager.selecting) {
            this.doSelection(inputManager.inputLocation);

        } else if(inputManager.endSelecting) {
            this.endPath();
        }

        if(board.clearCount < board.MAX_CLEAR_COUNT) {
            if(++board.clearCount === board.MAX_CLEAR_COUNT) {
                this.removeTiles();
            }
        }

        if(this.bonus) {
            EARTH.log("BONUS " + this.bonus);
            switch(this.bonus) {
                case score.BONUS_MORPHER:
                    this.createMorpherTile(0);
                    break;
            }

            this.bonus = this.score.BONUS_NONE;
        }

        this.updateTiles(secondsElapsed);

        inputManager.update();
    },

    startSelection: function(inputLocation) {
        var board = this.board,
            score = this.score,
            px = inputLocation.x,
            py = inputLocation.y,
            tile = board.getTileByPxLocation(px, py);

        if(tile) {
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

                //this.audioManager.playNextChime();
            }
        }
    },

    doSelection: function(inputLocation) {
        var board = this.board,
            px = inputLocation.x,
            py = inputLocation.y,
            tile = board.getTileByPxLocation(px, py);

        if(tile) {
            this.doTileSelect(tile);
        }
    },

    updateTiles: function(secondsElapsed) {
        var board = this.board,
            grid = board.grid,
            width = board.boardWidth,
            height = board.boardHeight,
            enableInput = true,
            cascading = false,
            fallSpeed = Math.floor(this.fallSpeed * secondsElapsed),
            tile, gridColumn,
            jPlusOne, jPlusTwo;

        for(var i = 0; i < width; i++) {
            gridColumn = grid[i];

            for(var j = height - 1; j >= 0; j--) {
                tile = gridColumn[j];
                if(tile) {
                    jPlusOne = j + 1;
                    jPlusTwo = j + 2;
                    // If there's an empty space below the tile,
                    // set the tile to that new space
                    if(board.isWithinBounds(i, jPlusOne) && gridColumn[jPlusOne] == null) {
                        gridColumn[j] = null;
                        gridColumn[j + 1] = tile;
                    }

                    // If the tile's py doesn't match it's grid position,
                    // cause the tile to fall
                    if(Math.floor(tile.y / board.tileHeight) != j) {
                        tile.y += Math.min(fallSpeed, (board.tileHeight * j) - tile.y);
                        enableInput = false;
                        cascading = true;
                    }
                }
            }
        }

        this.inputManager.enableInput(enableInput);

        // See if cascading is done. If it is, fill in
        // the upper board.
        if(this.isCascading && cascading == false) {
            this.isCascading = false;

            this.createUpperTiles();
        }
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
                            this.audioManager.playPreviousChime();
                        }

                    }
                    ///this.audioManager.playPreviousChime();
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

                        this.audioManager.playNextChime();

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

                    ///this.audioManager.playNextChime();
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
            this.isCascading = true;

            this.destroyTiles(board.selectedTiles);
            ///dispatchPointEvent(true);
            score.bank();
            score.stats.clearCount += board.selectedTiles.length;

            //for each(var color:String in Tile1.colors) {
            //    if(colorIndexMap[color] != null) {
            //        var colorIndex:int = colorIndexMap[color];
            //        stats[color + "_count"] += colorsUsed[colorIndex].count;
            //    }
            //}

        } else {
            board.selectedTiles.length = 0;
            score.tempPoints = 0;
            ///resetColorsUsed();
        }
    },

    destroyTiles: function(tileSet) {
        var score = this.score;

        this.tileSet = tileSet;
        this.inputManager.enableInput(false);

        if(!this.disableClearBonus && score.bonusStonesEnabled) {
            this.bonus = score.checkForBonus(tileSet.length);
        }

        for(var i = 0; i < tileSet.length; i++) {
            tileSet[i].clearing = true;
        }

        //glowTimer = new Timer(400, 1);
        //glowTimer.addEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);
        //glowTimer.start();

        //this.removeTiles();
        this.board.clearCount = 0;

        ///clearSound.play();
        this.audioManager.playClear();
    },

    removeTiles: function() {
        var board = this.board,
            tileFactory = this.tileFactory,
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

            // Remove the tile from the board
            board.removeTile(tile);

            // Free the tile for later use
            tileFactory.freeTile(tile);
        }

        if(!this.disableClearBonus && tileSet.length > 0) {
           // TODO: figure out if this is even needed
        }

        ///resetColorsUsed();

        /*if(tileWasRemoved) {
            this.startCascade();
        } else {
            this.inputManager.enableInput(true);
        }*/

        tileSet.length = 0;
    },

    resetValues: function() {
        var board = this.board,
            score = this.score;

        score.resetStoneCounts();
        board.selectCount = 0;
        board.totalCount = 0;
        score.tileValue = score.TILE_VALUE;
        board.selectedTile = null;
        this.currentDirection = 0;
        score.pointMultiplier = 0;
        this.disableClearBonus = false;

        this.audioManager.resetChime();
    }
};


