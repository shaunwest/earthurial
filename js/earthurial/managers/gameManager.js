/**
 * User: shaun
 * Date: 10/26/13 6:16 PM
 */

EARTH.gameManager = {
  SPARK_RECURSIONS: 3,

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
    this.isClearing = false;
    this.bonus = score.BONUS_NONE;

    this.gameQueue = EARTH.gameQueue;
    this.gameQueue.init();
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
      tile = tileFactory.getTileType(tileFactory.tileTypes.morpher);

    tile.x = (column * board.tileWidth);
    tile.y = (7 * board.tileHeight); // create in upper section of board

    board.addTile(tile);

    this.audioManager.playSparkAppear();
  },

  createSparkTile: function(column) {
    var tileFactory = this.tileFactory,
      board = this.board,
      tile = tileFactory.getTileType(tileFactory.tileTypes.spark);

    tile.x = (column * board.tileWidth);
    tile.y = (7 * board.tileHeight); // create in upper section of board

    board.addTile(tile);

    this.audioManager.playSparkAppear();
  },

  doSpark: function(sparkTile, radius) {
    var board = this.board,
      score = this.score,
      by = board.getRow(sparkTile),
      bx = board.getColumn(sparkTile),
      sparkFlag = false,
      tiles;

    for(var i = 0; i <= radius; i++) {
      tiles = this.getTileRadius(bx, by, i);
      if(tiles.length > 0) {
        score.tempPoints = tiles.length * 1000;
        score.bank();
        score.stats.clearCount += tiles.length;
        this.gameQueue.enqueue($.proxy(this.destroyTiles, this, tiles), 100);
        sparkFlag = true;
      }
    }

    if(sparkFlag) {
      this.audioManager.playSparkActive();
    }
  },

  doMorpher: function(morpherTile, radius) {
    var board = this.board,
      by = board.getRow(morpherTile),
      bx = board.getColumn(morpherTile),
      flag = false,
      tiles;

    for(var i = 0; i <= radius; i++) {
      tiles = this.getTileRadius(bx, by, i);
      if(tiles.length > 0) {
        this.gameQueue.enqueue($.proxy(this.morphTiles, this, tiles), 100);
        flag = true;
      }
    }

    if(flag) {
      this.audioManager.playSparkActive();
    }
  },

  getTileRadius: function(bx, by, radius) {
    var board = this.board,
      minX = bx - radius, //Math.max(bx - radius, 0),
      minY = by - radius, //Math.max(by - radius, 8),
      maxX = bx + radius, //Math.min(bx + radius, 7),
      maxY = by + radius, //Math.min(by + radius, 15),
      tiles = [],
      tile;

    for(var i = minX; i <= maxX; i++) {
      for(var j = minY; j <= maxY; j++) {
        if(i == maxX || i == minX || j == maxY || j == minY) {
          tile = board.getTile(i, j);
          if(tile) {
            tiles.push(tile);
          }
        }
      }
    }

    return tiles;
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

    if(tileMatch == 0 && 7 - i - 1 >= 0 && board[7 - i - 1][j]) {
      return tileFactory.getValidTile(board[7 - i - 1][j]);

    } else if(tileMatch == 1 && j - 1 >= 0 && board[7 - i][j - 1]) {
      return tileFactory.getValidTile(board[7 - i][j - 1]);

    } else {
      return tileFactory.getSimpleRandomTile();
    }
  },

  update: function(secondsElapsed) {
    var inputManager = this.inputManager,
      board = this.board,
      score = this.score,
      tileLocation = null;

    if(inputManager.startSelecting) {
      this.startSelection(inputManager.inputLocation);
    } else if(inputManager.selecting) {
      this.doSelection(inputManager.inputLocation);
    } else if(inputManager.endSelecting) {
      this.endPath();
    }

    if(this.bonus) {
      tileLocation = board.getTileLocationByPxLocation(inputManager.inputLocation.x, inputManager.inputLocation.y);

      EARTH.log("BONUS " + this.bonus + " " + tileLocation);
      switch(this.bonus) {
        case score.BONUS_MORPHER:
          this.createMorpherTile(tileLocation.bx);
          break;
        case score.BONUS_SPARK:
          this.createSparkTile(tileLocation.bx);
          break;
      }

      this.bonus = this.score.BONUS_NONE;
    }

    this.updateTiles(secondsElapsed);

    this.gameQueue.update(secondsElapsed);
    inputManager.update();
  },

  startSelection: function(inputLocation) {
    var board = this.board,
      score = this.score,
      tileTypes = this.tileFactory.tileTypes,
      px = inputLocation.x,
      py = inputLocation.y,
      tile = board.getTileByPxLocation(px, py);

    if(tile) {
      if(tile.type == tileTypes.spark) {
        this.doSpark(tile, 2);

      } else if(tile.type == tileTypes.morpher) {
        this.doMorpher(tile, 2);

      } else {
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
    }
  },

  doSelection: function(inputLocation) {
    var board = this.board,
      px = inputLocation.x,
      py = inputLocation.y,
      tile = board.getTileByPxLocation(px, py);

    if(tile && tile.type != this.tileFactory.tileTypes.spark) {
      this.doTileSelect(tile);
    }
  },

  updateTiles: function(secondsElapsed) {
    var board = this.board,
      grid = board.grid,
      width = board.boardWidth,
      height = board.boardHeight,
      enableInput = true,
      cascadingFlag = false,
      clearingFlag = false,
      fallSpeed = Math.floor(this.fallSpeed * secondsElapsed),
      tile, gridColumn,
      tilesToRemove = [],
      jPlusOne, jPlusTwo;


    for(var i = 0; i < width; i++) {
      gridColumn = grid[i];

      for(var j = height - 1; j >= 0; j--) {
        tile = gridColumn[j];
        if(tile) {
          if(this.isCascading) {
            jPlusOne = j + 1;
            jPlusTwo = j + 2;
            // If there's an empty space below the tile,
            // set the tile to that new space
            if(board.isWithinBounds(i, jPlusOne) && gridColumn[jPlusOne] == null) {
              gridColumn[j] = null;
              gridColumn[j + 1] = tile;
              cascadingFlag = true;
            }

            // If the tile's py doesn't match its grid position,
            // cause the tile to fall
            if(Math.floor(tile.y / board.tileHeight) != j) {
              tile.y += Math.min(fallSpeed, (board.tileHeight * j) - tile.y);
              enableInput = false;
              cascadingFlag = true;
            }

          } else if(this.isClearing) {
            if(tile.clearCount > 0) {
              clearingFlag = true;
              if(--tile.clearCount == 0) {
                tile.cleared = true;
                tilesToRemove.push(tile);
              }
            }
          }
        }
      }
    }

    // If we're cascading, check if it's done. If it is, fill in
    // the upper board.
    if(this.isCascading && cascadingFlag === false) {
      this.isCascading = false;
      this.createUpperTiles();
      this.inputManager.enableInput(true);
    }

    // If we're clearing, remove cleared tiles or initiate cascading
    // if we're done clearing.
    if(this.isClearing) {
      if(tilesToRemove.length > 0) {
        this.removeTiles(tilesToRemove);

      } else if(clearingFlag === false) {
        this.isClearing = false;
        this.isCascading = true;
      }
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
      ///  speedTimer.stop();

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
              //this.audioManager.playPreviousChime();
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

            //this.audioManager.playNextChime();

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
      this.destroyTiles(board.selectedTiles);
      this.audioManager.playClear();
      ///dispatchPointEvent(true);
      score.bank();
      score.stats.clearCount += board.selectedTiles.length;

      //for each(var color:String in Tile1.colors) {
      //  if(colorIndexMap[color] != null) {
      //    var colorIndex:int = colorIndexMap[color];
      //    stats[color + "_count"] += colorsUsed[colorIndex].count;
      //  }
      //}

    } else {
      board.selectedTiles.length = 0;
      score.tempPoints = 0;
      ///resetColorsUsed();
    }
  },

  // Mark tiles to clear themselves
  destroyTiles: function(tileSet) {
    var score = this.score;

    this.inputManager.enableInput(false);

    if(!this.disableClearBonus && score.bonusStonesEnabled) {
      this.bonus = score.checkForBonus(tileSet.length);
    }

    /*score.tempPoints = tileSet.length * 1000;
    score.bank();
    score.stats.clearCount += tileSet.length;*/

    for(var i = 0; i < tileSet.length; i++) {
      tileSet[i].clearCount = this.board.MAX_CLEAR_COUNT;
    }

    this.isClearing = true;
    tileSet.length = 0;
  },

  morphTiles: function(tileSet) {
    var score = this.score;

    //this.inputManager.enableInput(false);

    if(!this.disableClearBonus && score.bonusStonesEnabled) {
      this.bonus = score.checkForBonus(tileSet.length);
    }

    for(var i = 0; i < tileSet.length; i++) {
      tileSet[i].type = this.tileFactory.tileTypes.green;
    }

    tileSet.length = 0;
  },

  // Remove tiles from the board
  removeTiles: function(tiles) {
    var board = this.board,
      tileFactory = this.tileFactory,
      tile;

    for(var i = 0; i < tiles.length; i++) {
      tile = tiles[i];

      // Remove the tile from the board
      board.removeTile(tile);

      // Free the tile for later use
      tileFactory.freeTile(tile);
    }

    if(!this.disableClearBonus && tiles.length > 0) {
       // TODO: figure out if this is even needed
    }

    tiles.length = 0;
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
  }
};


