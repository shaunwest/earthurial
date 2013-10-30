package com.earthurial.mobile.core
{
	import com.earthurial.mobile.events.BonusEvent;
	import com.earthurial.mobile.events.GameEndEvent;
	import com.earthurial.mobile.events.PointEvent;
	import com.earthurial.mobile.events.TimeEvent;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.events.TouchEvent;
	import flash.media.Sound;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	
	import spark.components.Group;
	import spark.core.SpriteVisualElement;
	
	[Event(name="pointEvent", type="com.earthurial.mobile.PointEvent")]
	[Event(name="bonusEvent", type="com.earthurial.mobile.BonusEvent")]
	[Event(name="timeEvent", type="com.earthurial.mobile.TimeEvent")]
	[Event(name="endEvent", type="com.earthurial.mobile.GameEndEvent")]
	
	public class GameManager extends EventDispatcher
	{
		public static const SPARK_CODE:int = 1;
		public static const TIME_CODE:int = 2;
		public static const MORPHER_CODE:int = 3;
		public static const PHOENIX_CODE:int = 4;
		public static const NO_CODE:int = 0;
		
		private const SELECTION_LENGTH:int = 2;
		private const TILE_VALUE:int = 100;
		private const TILE_VALUE_LIMIT:int = 600; //640; //400;
		private const TILE_MULTIPLIER_COUNT:int = 6; //7; //3;
		private const TILE_INCREMENT:int = 100;
		private const SPARK_VALUE:int = 200;
		private const SPARK_RECURSIONS:int = 3;
		private const MORPHER_DESTROY_VALUE:int = 1000;
		
		private const SPARK_BONUS_REQ:int = 3;
		private const MORPHER_BONUS_REQ:int = 4;
		private const PHOENIX_BONUS_REQ:int = 5;
		private const TIME_BONUS_REQ:int = 3;
		
		private const TIME_BONUS_AMOUNT1:int = 10;
		private const TIME_BONUS_AMOUNT2:int = 15;
		private const TIME_BONUS_AMOUNT3:int = 20;
		private const TIME_BONUS_MAX:int = 60;
		
		private const MORPHER_RECURSIONS:int = 2;
		private const SPEED_COUNTER_SECONDS:int = 1;
		
		private var boardContainer:Group;
		private var board:Array;
		private var upperBoard:Array;
		
		private var currentSelectedTile:Tile1;
		private var selectedTiles:ArrayCollection;
		private var tileSet:ArrayCollection;
		private var selectCount:int;
		private var totalCount:int;
		private var speedCount:int;
		
		private var currentDirection:int;
		private var stopInteractions:Boolean;
		private var disableClearBonus:Boolean;
		private var initMouseDrag:Boolean;
		private var mouseDragging:Boolean;
		private var morphing:Boolean;
		private var sparking:Boolean;
		
		private var currentMatchTiles:ArrayCollection;
		private var matchHistory:ArrayCollection;
		
		private var glowTimer:Timer;
		private var speedTimer:Timer;
		
		private var chimes:ArrayCollection;
		private var currentChime:int;
		
		private var totalTimeBonus:int;
		
		private var clearSound:Sound;
		private var fallSound:Sound;
		private var flareSound:Sound;
		private var flareClearSound:Sound;
		private var timeBonusSound:Sound;
		private var morphSound:Sound;
		
		public var stats:Object;
		
		private var gameParameters:Object;
		
		[Bindable]
		public var boardString:String;
		
		[Bindable]
		public var pointMultiplier:int;
		
		[Bindable]
		public var tileValue:int;
		
		[Bindable]
		public var colorsUsed:ArrayCollection;
		private var colorIndexMap:Object;
		
		[Bindable]
		public var currentColor:String;
		
		[Bindable]
		public var tempPoints:int;
		
		[Bindable]
		public var totalScore:int;
		
		public function GameManager(boardContainer:Group, savedBoard:String, gameParameters:Object)
		{
			this.boardContainer = boardContainer;
			this.totalScore = 0;
			this.currentDirection = 0;
			this.pointMultiplier = 1;
			this.currentChime = -1;
			this.gameParameters = gameParameters;
			
			this.stats = {
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
			}
			
			tileValue = TILE_VALUE;
			
			selectedTiles = new ArrayCollection();
			chimes = new ArrayCollection();
			createBoard(savedBoard);
	
			boardContainer.addEventListener(Event.ENTER_FRAME, update);
		}
		
		private function update(event:Event):void {
			for(var i:int = 0; i < board.length; i++) {
				for(var j:int = 0; j < board[i].length; j++) {
					var t:Tile1 = board[i][j];
					t.update();
				}
			}
		}
		
		public function addChime(chime:Sound):void {
			chimes.addItem(chime);
		}
		
		public function addFlareSound(flare:Sound):void {
			flareSound = flare;	
		}
		
		public function addMorphSound(morph:Sound):void {
			morphSound = morph;
		}
		
		public function addFlareClearSound(flareClear:Sound):void {
			flareClearSound = flareClear;
		}
		
		public function addTimeBonusSound(timeBonus:Sound):void {
			timeBonusSound = timeBonus;
		}
		
		private function playNextChime():void {
			currentChime++;
			
			if(currentChime >= chimes.length)
				currentChime = chimes.length - 1;
				
			var chime:Sound = Sound(chimes[currentChime]);
			chime.play();
		}
		
		private function playPreviousChime():void {
			currentChime--;
			
			if(currentChime < 0)
				currentChime = 0;
				
			var chime:Sound = Sound(chimes[currentChime]);
			chime.play();
		}
		
		private function resetChime():void {
			currentChime = -1;
		}
		
		public function addClearSound(clear:Sound):void {
			clearSound = clear;
		}
		
		public function addFallSound(fall:Sound):void {
			fallSound = fall;
		}
		
		public function createBoard(savedBoard:String):void {
			// Build the board	
			var tempBoardString:String = "";
			board = new Array(8);
			for (var i:int = 0; i < 8; i++) {
				board[i] = new Array(8);
				for (var j:int = 0; j < 8; j++) {
					var t:Tile1 = new Tile1();
					t.x = i * t.width;
					t.y = j * t.height;
					/*t.addEventListener(TouchEvent.TOUCH_BEGIN, onTouchBegin);
					t.addEventListener(TouchEvent.TOUCH_OVER, onTouchOver);
					t.addEventListener(TouchEvent.TOUCH_END, onTouchEnd);*/
					t.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
					t.addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
					t.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
					var col:String;
					if(savedBoard != "" && savedBoard != null) {
						var pos:int = j + (i * 8);
						var colorCode:int = int(savedBoard.substr(pos, 1));
						col = Tile1.colors[colorCode];
					} else {
						col = getRandomColor(i, j, board);
						tempBoardString += Tile1.colorMap[col].toString();
					}

					t.setColor(col);
					board[i][j] = t;
					this.boardContainer.addElement(t);
				}	
			}
			
			boardString = tempBoardString;
			
			createUpperBoard();
		}
		
		private function createUpperBoard():void {
			// Build the board	
			var tempBoard:Array = new Array(8);
			for (var i:int = 0; i < 8; i++) {
				tempBoard[i] = new Array(8);
				for (var j:int = 0; j < 8; j++) {
					if(upperBoard == null || upperBoard[i][j] == null) {
						var t:Tile1 = new Tile1();
						t.x = i * t.width;
						t.y = (j * t.height) - 600; //256;			
						t.setColor(getRandomColorForUpper(i, j)); //, tempBoard));
						tempBoard[i][j] = t;
						this.boardContainer.addElement(t);
					} else {
						tempBoard[i][j] = upperBoard[i][j];
					}
				}	
			}
			
			upperBoard = tempBoard;
		}
		
		private function getRandomColor(i:int, j:int, board:Array):String {
			var colorMatch:int = Math.floor(Math.random() * 40); // 2 in 10 chance of copying adjacent color
			
			if(colorMatch == 0 && i - 1 >= 0 && board[i - 1][j] != null)
				return board[i - 1][j].getColor();
			else if(colorMatch == 1 && j - 1 >= 0 && board[i][j - 1] != null)
				return board[i][j - 1].getColor();
			else {
				return getSimpleRandomColor();				
			} 		
		}
		
		private function getRandomColorForUpper(i:int, j:int):String {
			var colorMatch:int = Math.floor(Math.random() * 10); // 2 in 8 chance of copying adjacent color
			
			if(colorMatch == 0 && 7 - i - 1 >= 0 && board[7 - i - 1][j] != null)
				return getValidColor(board[7 - i - 1][j]);
			else if(colorMatch == 1 && j - 1 >= 0 && board[7 - i][j - 1] != null)
				return getValidColor(board[7 - i][j - 1]);
			else {
				return getSimpleRandomColor();				
			} 	
		}
		
		private function getValidColor(tile:Tile1):String {
			var color:String = tile.getColor();
			if(color != "morpher" &&
			   color != "super_morpher" &&
			   color != "spark" &&
			   color != "phoenix")
				return color;
			else
				return getSimpleRandomColor();
		}
		
		private function getSimpleRandomColor():String {
			var colorIndex:int = Math.floor(Math.random() * (Tile1.colors.length)); // NOTE: don't use red
			//var colorIndex:int = Math.floor(Math.random() * 4) + 1;
			return Tile1.colors[colorIndex];	
		}
		
		// TODO: this could probably be removed
		private function movesRemain():Boolean {
			for(var i:int = 0; i < 8; i++) {
				for(var j:int = 0; j < 8; j++) {
					var tile:Tile1 = board[i][j];
					var match:int = 0;
					if(i - 1 >= 0 && board[i - 1][j].getColor() == tile.getColor())
						match++;
						
					if(i + 1 < 8 && board[i + 1][j].getColor() == tile.getColor())
						match++;
						
					if(j - 1 >= 0 && board[i][j - 1].getColor() == tile.getColor())
						match++;
						
					if(j + 1 < 8 && board[i][j + 1].getColor() == tile.getColor())
						match++;
						
					if(match > 0)
						return true;
				}
			}
			
			return false;
		}
		
		private function onMouseDown(event:MouseEvent):void {
		//private function onTouchBegin(event:TouchEvent):void {
			if(!stopInteractions) {
				if(currentSelectedTile != null) {
					
					var tile:Tile1 = Tile1(event.currentTarget);
					if(currentSelectedTile == tile) {
						endPath();
						
					} else {
						doTileSelect(tile);
					}
				} else {
					
					currentSelectedTile = Tile1(event.currentTarget);
					currentSelectedTile.setSelected(true);
					
					tempPoints = 0;
					pointMultiplier = 1;
					tileValue = TILE_VALUE;
					
					selectedTiles.addItem(currentSelectedTile);
					selectCount++;
					totalCount++;
					
					recordColor(currentSelectedTile.getColor());
					currentColor = currentSelectedTile.getColor();
					
					initMouseDrag = true;
					
					playNextChime();
				}
			}
		}
		
		private function recordColor(colorName:String):void {
			if(colorsUsed == null)
				colorsUsed = new ArrayCollection();
			
			if(colorsUsed.length == 0)
				colorIndexMap = new Object();
				
			var colorIndex:int;
			var colorObject:Object;
			if(colorIndexMap[colorName] != null) {
				colorIndex = colorIndexMap[colorName];
				colorObject = colorsUsed[colorIndex];
				colorObject.count++;
				colorsUsed[colorIndex] = colorObject;
			} else {
				colorObject = {color: colorName, count: 1};
				colorsUsed.addItem(colorObject);
				colorIndexMap[colorName] = colorsUsed.length - 1;
			}
		}
		
		private function decrementColor(colorName:String):void {
			if(colorsUsed == null)
				return;
			
			var colorIndex:int;
			var colorObject:Object;
			if(colorIndexMap[colorName] != null) {
				colorIndex = colorIndexMap[colorName];
				colorObject = colorsUsed[colorIndex];
				colorObject.count--;
				colorsUsed[colorIndex] = colorObject;
			}
		}
		
		private function resetColorsUsed():void {
			colorsUsed = new ArrayCollection();
		}
		
		/*private function getUsedColorCount():int {
			var colorCount:int;
			for(var color:String in colorsUsed) {
				colorCount++;
			}
			
			return colorCount;
		}*/
		
		private function getUsedColorCount():int {
			//return colorsUsed.length;
			var count:int = 0;
			for each(var colorObject:Object in colorsUsed) {
				if(colorObject.count > 0)
					count++;
			}
			return count;
		}
		
		private function createMorpherTile(column:int):void {
			var currentTile:Tile1 = upperBoard[column][7];
			this.boardContainer.removeElement(currentTile);
			
			var tile:Tile1 = new Tile1();
			tile.x = (column * tile.width);
			tile.y = (7 * tile.height) - 256;
			//tile.setColor(getSimpleRandomColor());
			tile.setColor("morpher");
			//tile.setSelected(true, false);
			tile.setMorpherHalo(true);
			upperBoard[column][7] = tile;
			this.boardContainer.addElement(tile);
			
			flareSound.play();
		}
		
		private function doMorpher(event:MouseEvent):void {
			
			if(stopInteractions)
				return;
			
			currentSelectedTile = Tile1(event.currentTarget);
			currentSelectedTile.removeEventListener(MouseEvent.CLICK, doMorpher);
			
			var i:int = currentSelectedTile.x / currentSelectedTile.width;
			var j:int = currentSelectedTile.y / currentSelectedTile.height;
			
			var maxDelay:int = 0;
			var delay:int;
			
			stats["morpher_count"]++;
			
			var recursions:int;
			if(currentSelectedTile.getColor() == "super_morpher")
				recursions = MORPHER_RECURSIONS + 1;
			else
				recursions = MORPHER_RECURSIONS;
			
			currentSelectedTile.setMorpherHalo(false);
			currentSelectedTile.setSparkHalo(false);
			currentSelectedTile.applyHalo();
			
			currentSelectedTile.setColor(getSimpleRandomColor());
			
			/*currentSelectedTile.addEventListener(TouchEvent.TOUCH_BEGIN, onTouchBegin);
			currentSelectedTile.addEventListener(TouchEvent.TOUCH_OVER, onTouchOver);
			currentSelectedTile.addEventListener(TouchEvent.TOUCH_END, onTouchEnd);*/
			currentSelectedTile.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
			currentSelectedTile.addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
			currentSelectedTile.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
			
			//var morphColor:String = currentSelectedTile.getColor();
			
			morphSound.play();

			if(i - 1 >= 0) {
				morph(board[i - 1][j], getSimpleRandomColor(), 0, recursions);
			}
			
			if(i + 1 < 8) {
				morph(board[i + 1][j], getSimpleRandomColor(), 0, recursions);
			}
				
			if(j - 1 >= 0) {
				morph(board[i][j - 1], getSimpleRandomColor(), 0, recursions);
			}
				
			if(j + 1 < 8) {
				morph(board[i][j + 1], getSimpleRandomColor(), 0, recursions);
			}
			
			currentSelectedTile = null;
		}
		
		private function createSparkTile(column:int, phoenix:Boolean):void {
			var currentTile:Tile1 = upperBoard[column][7];
			this.boardContainer.removeElement(currentTile);
			
			var tile:Tile1 = new Tile1();
			tile.x = (column * tile.width);
			tile.y = (7 * tile.height) - 256;
			
			if(phoenix) {
				tile.setColor("phoenix");	
			} else {
				tile.setColor("spark");
			}
			
			//tile.setSelected(true, false);
			tile.setSparkHalo(true);
			upperBoard[column][7] = tile;
			this.boardContainer.addElement(tile);
			
			flareSound.play();
		}
		
		private function onSparkClick(event:MouseEvent):void {
			if(!stopInteractions) {
				var tile:Tile1 = Tile1(event.currentTarget);
				tile.removeEventListener(MouseEvent.CLICK, onSparkClick);
				igniteSpark(tile);
			}
		}
		
		private function igniteSpark(tile:Tile1):void {
			currentSelectedTile = tile;

			var i:int = currentSelectedTile.x / currentSelectedTile.width;
			var j:int = currentSelectedTile.y / currentSelectedTile.height;
			
			var maxDelay:int = 6;
			var initialDelay:int;
			var sparkDelay:int;
			
			currentSelectedTile.setFire(true);
			
			selectedTiles.addItem(currentSelectedTile);
			selectCount++;
			tempPoints += TILE_VALUE;
			bank();
			
			var ignoreColor:Boolean;
			var recursions:int;
			if(currentSelectedTile.getColor() == "phoenix") {
				ignoreColor = true;
				initialDelay = -1;
				recursions = 100;
				stats["phoenix_count"]++;
			} else {
				ignoreColor = true;
				initialDelay = 0;
				recursions = SPARK_RECURSIONS;
				stats["spark_count"]++;
			}
			
			currentSelectedTile.setColor(getSimpleRandomColor());
			
			if(i - 1 >= 0) {
				sparkDelay = spark(board[i - 1][j], initialDelay, ignoreColor, recursions);
				if(sparkDelay > maxDelay)
					maxDelay = sparkDelay;
					
				dispatchPointEvent(false);
				bank();
			}
			
			if(i + 1 < 8) {
				sparkDelay = spark(board[i + 1][j], initialDelay, ignoreColor, recursions);
				if(sparkDelay > maxDelay)
					maxDelay = sparkDelay;
				
				dispatchPointEvent(false);
				bank();
			}
				
			if(j - 1 >= 0) {
				sparkDelay = spark(board[i][j - 1], initialDelay, ignoreColor, recursions);
				if(sparkDelay > maxDelay)
					maxDelay = sparkDelay;
					
				dispatchPointEvent(false);
				bank();
			}
				
			if(j + 1 < 8) {
				sparkDelay = spark(board[i][j + 1], initialDelay, ignoreColor, recursions);
				if(sparkDelay > maxDelay)
					maxDelay = sparkDelay;
					
				dispatchPointEvent(false);
				bank();
			}
			
			// remove tiles after timer (using glowDelay) expires
			tileSet = new ArrayCollection(selectedTiles.toArray());
			selectedTiles.removeAll(); //TODO: can probably be moved into resetValues (see clearSet() as well)
			resetValues();
			
			disableClearBonus = true;
			
			glowTimer = new Timer(100, maxDelay);
			glowTimer.addEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);
			glowTimer.start();
			
			flareClearSound.play();
		}
		
		private function doTileSelect(tile:Tile1):void {
			if(currentSelectedTile && !stopInteractions) {
				//var tile:Tile1 = Tile1(event.currentTarget);
				var lastIndex:int = selectedTiles.length - 1;
				var thisTileIndex:int = selectedTiles.getItemIndex(tile);
				
				if(speedTimer != null)
					speedTimer.stop();
				
				// If this isn't the first tile, clear all tiles that have been
				// selected beyond this one.
				if(thisTileIndex > -1) {
					for(var i:int = lastIndex; i > thisTileIndex; i--) {
						var t:Tile1 = Tile1(selectedTiles.getItemAt(i));
						t.setSelected(false);
						selectedTiles.removeItemAt(i);
						//selectCount--;
						decrementColor(t.getColor());
						
						if(i > 1) {
							if(i <= TILE_MULTIPLIER_COUNT)
								tileValue -= TILE_INCREMENT;
							/*if(i <= TILE_MULTIPLIER_COUNT)
								tileValue /= 2;*/
								
							tempPoints -= (tileValue * pointMultiplier);
						}
						if(i > 0) {
							var previousTile:Tile1 = Tile1(selectedTiles.getItemAt(i - 1));
							if(t.getColor() != previousTile.getColor())
								pointMultiplier--;
						}
						playPreviousChime();
					}

					// Figure out new selectCount
					selectCount = 0;
					for(var j:int = thisTileIndex; j >= 0; j--) {
						var t2:Tile1 = Tile1(selectedTiles.getItemAt(i));
						selectCount++;
						if(j > 0) {
							var previousTile2:Tile1 = Tile1(selectedTiles.getItemAt(j - 1));
							if(t2.getColor() != previousTile2.getColor())
								break;
						} else {
							break;
						}
					}
					totalCount = selectCount;
					currentSelectedTile = tile;
				} else if(tile != currentSelectedTile && isAdjacentToTile(tile, currentSelectedTile)) {
					//playNextChime();
					//tile.setSelected(true);
					//selectedTiles.addItem(tile);	
					//selectCount++;
					
					if(currentSelectedTile.getColor() != tile.getColor()) {
						if(selectCount >= SELECTION_LENGTH && selectCount >= 3) {
						/*	//endPath();
							trace("DO NOTHING");
						else {*/
							//clearSet();
							//selectedTiles.removeAll();
							tile.setSelected(true);
							selectedTiles.addItem(tile);
							recordColor(tile.getColor());
							currentColor = tile.getColor();
							pointMultiplier++;
							selectCount = 1;
							currentSelectedTile = tile;
							playNextChime();
						} else {
							return;
						}
					} else {
						tile.setSelected(true);
						selectedTiles.addItem(tile);
						recordColor(tile.getColor());
						selectCount++;
						totalCount++;
						currentSelectedTile = tile;
						playNextChime();
					}
					
					if(selectedTiles.length > 2) {
						tempPoints += (tileValue * pointMultiplier);
						if(tileValue < TILE_VALUE_LIMIT)
							tileValue += TILE_INCREMENT;
						/*if(tileValue < TILE_VALUE_LIMIT)
							tileValue *= 2;*/
					}
				}
				
				//currentSelectedTile = tile;
			}	
		}
		
		private function onMouseOver(event:MouseEvent):void {
		//private function onTouchOver(event:TouchEvent):void {
			if(initMouseDrag) {
				mouseDragging = true;
				var tile:Tile1 = Tile1(event.currentTarget);
				doTileSelect(tile);
			}
		}
		
		private function bank():void {
			totalScore += tempPoints;
			tempPoints = 0;
		}
		
		private function dispatchPointEvent(showZero:Boolean):void {
			if(tempPoints == 0)
				return;
				
			var tile:Tile1 = selectedTiles[selectedTiles.length - 1];
			var pointEvent:PointEvent = new PointEvent(PointEvent.POINT_EVENT, tempPoints, tile.x, tile.y);
			dispatchEvent(pointEvent);  
		}
		
		private function dispatchTimeEvent(amount:int):void {
			dispatchEvent(new TimeEvent(TimeEvent.TIME_EVENT, amount));
		}
		
		private function clearSet():void {
			if((selectedTiles.length == selectCount && selectCount >= SELECTION_LENGTH) || selectCount > 2) {
				destroyTiles(new ArrayCollection(selectedTiles.toArray()));
				dispatchPointEvent(true);
				bank();
				stats["clear_count"] += selectedTiles.length;
				
				for each(var color:String in Tile1.colors) {
					if(colorIndexMap[color] != null) {
						var colorIndex:int = colorIndexMap[color];
						stats[color + "_count"] += colorsUsed[colorIndex].count;
					}
				}
				
				selectedTiles.removeAll(); // TODO: can this move to resetValues()??
			} else {
				selectedTiles.removeAll();
				tempPoints = 0;
				resetColorsUsed();
			}
		}
		
		private function endPath():void {
			unselectTiles();
			clearSet();		
			resetValues();
		}
		
		private function resetValues():void {
			mouseDragging = false;
			initMouseDrag = false;
			selectCount = 0;
			totalCount = 0;
			tileValue = TILE_VALUE;
			currentSelectedTile = null;
			currentDirection = 0;
			pointMultiplier = 0;
			disableClearBonus = false;
			resetChime();
		}
		
		private function onMouseUp(event:MouseEvent):void {
		//private function onTouchEnd(event:TouchEvent):void {
			initMouseDrag = false;
			if(mouseDragging && !stopInteractions) {
				endPath();
			}
		}
		
		private function unselectTiles():void {
			for each(var t:Tile1 in selectedTiles) {
				t.setSelected(false);
			}
		}
		
		private function isAdjacentToTile(tile:Tile1, adjacentTile:Tile1):Boolean {
			var i:int = tile.x / tile.width;
			var j:int = tile.y / tile.height;
			if(i - 1 >= 0 && board[i - 1][j] == adjacentTile)
				return true; 
				
			if(i + 1 <= 7 && board[i + 1][j] == adjacentTile)
				return true;
				
			if(j - 1 >= 0 && board[i][j - 1] == adjacentTile) 
				return true;
				
			if(j + 1 <= 7 && board[i][j + 1] == adjacentTile)
				return true;
				
			return false;
		}
		
		private function isAdjacentToSelected(tile:Tile1):Boolean {
			var i:int = tile.x / tile.width;
			var j:int = tile.y / tile.height;
			if(i - 1 >= 0 && board[i - 1][j].isSelected())
				return true; 
				
			if(i + 1 <= 7 && board[i + 1][j].isSelected())
				return true;
				
			if(j - 1 >= 0 && board[i][j - 1].isSelected()) 
				return true;
				
			if(j + 1 <= 7 && board[i][j + 1].isSelected())
				return true;
				
			return false;
		}
		
		private function destroyTiles(tileSet:ArrayCollection):void {
			this.tileSet = tileSet;
			stopInteractions = true;
			if(!disableClearBonus) {
				// Notify user of bonus
				if(tileSet.length > 0 && getUsedColorCount() >= PHOENIX_BONUS_REQ && !gameParameters.bonus_stones_off) {
					dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "PHOENIX!", PHOENIX_CODE));
				} else if(tileSet.length > 0 && getUsedColorCount() >= MORPHER_BONUS_REQ && !gameParameters.bonus_stones_off) {
					dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Morpher Stone!", MORPHER_CODE));
				} else if(tileSet.length > 0 && getUsedColorCount() >= SPARK_BONUS_REQ && !gameParameters.bonus_stones_off) {
					dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Spark Stone!", SPARK_CODE));	
				} else if(tileSet.length > 0 && getUsedColorCount() >= TIME_BONUS_REQ && totalTimeBonus < TIME_BONUS_MAX && !gameParameters.time_bonus_off) {
					dispatchEvent(new BonusEvent(BonusEvent.BONUS_EVENT, "Time Bonus!", TIME_CODE));
				}	
			}
			
			for each(var tile:Tile1 in tileSet) {
				var i:int = tile.x / tile.width;
				var j:int = tile.y / tile.height;
				if(this.boardContainer.contains(tile)) {
					tile.setGlow(true);
				}
			}
			
			glowTimer = new Timer(400, 1);
			glowTimer.addEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);
			glowTimer.start();
			
			clearSound.play();
		}
		
		private function removeTiles(event:TimerEvent):void {
			var tileWasRemoved:Boolean;
			
			glowTimer.stop();
			glowTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, removeTiles);
			
			for each(var tile:Tile1 in tileSet) {
				var i:int = tile.x / tile.width;
				var j:int = tile.y / tile.height;
				if(this.boardContainer.contains(tile)) {
					/*tile.removeEventListener(TouchEvent.TOUCH_BEGIN, onTouchBegin);
					tile.removeEventListener(TouchEvent.TOUCH_OVER, onTouchOver);
					tile.removeEventListener(TouchEvent.TOUCH_END, onTouchEnd);*/
					tile.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
					tile.removeEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
					tile.removeEventListener(MouseEvent.MOUSE_UP, onMouseUp);
					
					if(tile.getSparkHalo()) {
						tile.setSparkHalo(false);
						tile.applyHalo();
						tile.removeEventListener(MouseEvent.CLICK, onSparkClick);
					} else if(tile.getMorpherHalo()) {
						tile.setMorpherHalo(false);
						tile.applyHalo();
						tile.removeEventListener(MouseEvent.CLICK, doMorpher);
					}
					this.boardContainer.removeElement(tile);
					tileWasRemoved = true;
				}
				board[i][j] = null;
			}
			
			if(!disableClearBonus) {
				/*if(speedCount >= MORPHER_BONUS_REQ - 1) {
					createMorpherTile(tileSet[0].x / tileSet[0].width);
					resetSpeedCounter(null);	
				}*/
				
				if(tileSet.length > 0) {
					/*if(getUsedColorCount() >= TIME_BONUS_REQ) {
						dispatchTimeEvent();
					}*/
					
					var colorCount:int = getUsedColorCount();
					if(colorCount >= PHOENIX_BONUS_REQ) {
						if(!gameParameters.bonus_stones_off)
							createSparkTile(tileSet[tileSet.length - 1].x / tileSet[tileSet.length - 1].width, true);
						if(!gameParameters.time_bonus_off && totalTimeBonus < TIME_BONUS_MAX) {
							dispatchTimeEvent(TIME_BONUS_AMOUNT3);
							totalTimeBonus += TIME_BONUS_AMOUNT3;
						}
					} else if(colorCount >= MORPHER_BONUS_REQ) {
						if(!gameParameters.bonus_stones_off)
							createMorpherTile(tileSet[tileSet.length - 1].x / tileSet[tileSet.length - 1].width);
						if(!gameParameters.time_bonus_off && totalTimeBonus < TIME_BONUS_MAX) {
							dispatchTimeEvent(TIME_BONUS_AMOUNT2);
							totalTimeBonus += TIME_BONUS_AMOUNT2;
						}
					} else if(colorCount >= SPARK_BONUS_REQ) {
						if(!gameParameters.bonus_stones_off)
							createSparkTile(tileSet[tileSet.length - 1].x / tileSet[tileSet.length - 1].width, false);
						if(!gameParameters.time_bonus_off && totalTimeBonus < TIME_BONUS_MAX) {
							dispatchTimeEvent(TIME_BONUS_AMOUNT1);
							totalTimeBonus += TIME_BONUS_AMOUNT1;
						}
					}
				}
			}
			
			resetColorsUsed();
			
			if(tileWasRemoved)
				cascade();
			else
				stopInteractions = false;
				
			tileSet.removeAll();
			
		}
		
		private function cascade():void {
			var newBoardCounts:Array = new Array(8);
			var newBoard:Array = new Array(8);
			for(var i:int = 0; i < 8; i++) {	
				newBoard[i] = new Array(8);
				newBoardCounts[i] = 0;
				for(var j:int = 0; j < 8; j++) {
					var emptyCount:int = 0;
					for(var k:int = j + 1; k < 8; k++) {
						if(board[i][k] == null) {
							emptyCount++;
						}
					}
					
					if(board[i][j] != null) {
						board[i][j].startCascade(emptyCount);
						newBoard[i][j + emptyCount] = board[i][j];
					} else {
						emptyCount++;
					}
					
					if(emptyCount > newBoardCounts[i])
						newBoardCounts[i] = emptyCount;
				}	
			}
			
			for(var m:int = 0; m < 8; m++) {
				var count:int = newBoardCounts[m];
				for(var n:int = 8 - count; n < 8; n++) {
					var t:Tile1 = upperBoard[m][n];
					if(t.getSparkHalo())
						t.addEventListener(MouseEvent.CLICK, onSparkClick);
					else if(t.getMorpherHalo())
						t.addEventListener(MouseEvent.CLICK, doMorpher);
					else {
						t.addEventListener(MouseEvent.MOUSE_DOWN, onMouseDown);
						t.addEventListener(MouseEvent.MOUSE_OVER, onMouseOver);
						t.addEventListener(MouseEvent.MOUSE_UP, onMouseUp);
						/*t.addEventListener(TouchEvent.TOUCH_BEGIN, onTouchBegin);
						t.addEventListener(TouchEvent.TOUCH_OVER, onTouchOver);
						t.addEventListener(TouchEvent.TOUCH_END, onTouchEnd);*/
					}
					t.startCascade(count);
					newBoard[m][-(8 - n - count)] = t;
					upperBoard[m][n] = null;
				}
			}
			
			board = newBoard;
			createUpperBoard();
			
			fallSound.play();
			
			/*if(speedTimer != null) {
				speedTimer.reset();
			} else {
				speedTimer = new Timer(1000 * SPEED_COUNTER_SECONDS, 1);
				speedTimer.addEventListener(TimerEvent.TIMER_COMPLETE, resetSpeedCounter);
			}
			speedCount++;
			speedTimer.start();*/
			
			stopInteractions = false;
			
			if(!movesRemain()) {
				dispatchEvent(new GameEndEvent(GameEndEvent.END_EVENT, "No moves remain"));
			}
		}
		
		private function resetSpeedCounter(event:TimerEvent):void {
			speedTimer.stop();
			speedCount = 0;
		}
		
		private function morph(tile:Tile1, color:String, delay:int, recursions:int):void {
			
			if(recursions <= 0)
				return;
			
			var i:int = tile.x / tile.width;
			var j:int = tile.y / tile.height;
			
			if(tile.getColor() == "morpher" || tile.getColor() == "super_morpher") {
				tile.setColor("super_morpher");
				tile.applyColor();
			} else if(tile.getColor() == "spark") {
				tile.setColor("morpher");
				tile.setMorpherHalo(true);
				tile.applyColor();
				tile.removeEventListener(MouseEvent.CLICK, onSparkClick);
				tile.addEventListener(MouseEvent.CLICK, doMorpher);
			} else
				tile.setMorph(color, delay);
				
			delay++;
			
			if(i - 1 >= 0) {
				var above:Tile1 = board[i - 1][j];
				if(above != null)
					morph(above, color, delay, recursions - 1);
			}
			
			if(i + 1 < 8) {
				var below:Tile1 = board[i + 1][j];
				if(below != null)
			 		morph(below, color, delay, recursions - 1);
			}
				
			if(j - 1 >= 0) {
				var left:Tile1 = board[i][j - 1];
				if(left != null)
			 		morph(left, color, delay, recursions - 1);
			}
			
			if(j + 1 < 8) {
				var right:Tile1 = board[i][j + 1];
				if(right != null)
					morph(right, color, delay, recursions - 1);
			}
		}
		
		private function spark(tile:Tile1, glowDelay:int, ignoreColor:Boolean, recursions:int):int {
			var i:int = tile.x / tile.width;
			var j:int = tile.y / tile.height;
			
			if(recursions <= 0)
				return 0;
			
			var maxGlow:int = 0;
			
			if(tile.getColor() == "spark" || tile.getColor() == "phoenix") {
				if(tile.getColor() == "phoenix") {
					stats["phoenix_count"]++;
					recursions = 100;
					glowDelay = -1;
				} else {
					stats["spark_count"]++;
					recursions = SPARK_RECURSIONS;
				}
				tile.setColor(getSimpleRandomColor());
				glowTime = spark(tile, glowDelay, ignoreColor, recursions);
				if(glowTime > maxGlow)
					maxGlow = glowTime;
			} else if(tile.getColor() == "morpher" || tile.getColor() == "super_morpher") {
				if(tile.getColor() == "super_morpher")
					tempPoints += (5 * MORPHER_DESTROY_VALUE);
				else
					tempPoints += MORPHER_DESTROY_VALUE;
				tile.setColor(getSimpleRandomColor());
				glowTime = spark(tile, glowDelay, ignoreColor, recursions);
				if(glowTime > maxGlow)
					maxGlow = glowTime;
			} else {
				selectedTiles.addItem(tile);
				tempPoints += SPARK_VALUE;
				
				if(glowDelay == -1)
					tile.setFire(true, 0);
				else {
					tile.setFire(true, glowDelay);
					glowDelay++;
					maxGlow = glowDelay;
				}
				
				var glowTime:int;
				
				if(i - 1 >= 0) {
					var above:Tile1 = board[i - 1][j];
					if(above != null) {
						if(!above.getFire() && (ignoreColor || above.getColor() == tile.getColor()))
							glowTime = spark(above, glowDelay, ignoreColor, recursions - 1);
							if(glowTime > maxGlow)
								maxGlow = glowTime;
					}
				}
				
				if(i + 1 < 8) {
					var below:Tile1 = board[i + 1][j];
					if(below != null) {
					 	if(!below.getFire() && (ignoreColor || below.getColor() == tile.getColor()))
							glowTime = spark(below, glowDelay, ignoreColor, recursions - 1);
							if(glowTime > maxGlow)
								maxGlow = glowTime;
					}
				}
					
				if(j - 1 >= 0) {
					var left:Tile1 = board[i][j - 1];
				 	if(left != null) {
					 	if(!left.getFire() && (ignoreColor || left.getColor() == tile.getColor()))
							glowTime = spark(left, glowDelay, ignoreColor, recursions - 1);
							if(glowTime > maxGlow)
								maxGlow = glowTime;
					}
				}
				
				if(j + 1 < 8) {
					var right:Tile1 = board[i][j + 1];
					if(right != null) {
						if(!right.getFire() && (ignoreColor || right.getColor() == tile.getColor()))
							glowTime = spark(right, glowDelay, ignoreColor, recursions - 1);
							if(glowTime > maxGlow)
								maxGlow = glowTime;
					}
				}
			
			}
			return maxGlow;
		}
	}
}