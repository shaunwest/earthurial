package com.earthurial.mobile.core
{
	import flash.display.Bitmap;
	import flash.display.Sprite;
	import flash.events.TimerEvent;
	import flash.filters.GlowFilter;
	import flash.utils.Timer;
	
	import spark.core.SpriteVisualElement;
	
	public class Tile1 extends SpriteVisualElement
	{	
		private static const MAX_CASCADE_STEPS:int = 5; //4;
		private static const FALL_SPEED:int = 75 / MAX_CASCADE_STEPS;
		
		public static var colorMap:Object = {'green':0, 'black':1, 'blue':2, 'purple':3, 'red':4};
		public static var colors:Array = ["green", "black", "blue", "purple", "red"];
		
		private var selected:Boolean;
		private var color:String = "purple";
		private var cascadeTimer:Timer;
		private var delayTimer:Timer;
		private var fadeTimer:Timer;
		private var glowing:Boolean;
		private var flaming:Boolean;
		private var sparkHalo:Boolean;
		private var morpherHalo:Boolean;
		private var newColor:String;
		private var haloFlasher:Timer;
		
		private var stepCount:int;
		
		private var currentImage:Bitmap;
		
		private var redHaloFilter:GlowFilter;
		private var orangeHaloFilter:GlowFilter;
		
		public function Tile1():void {
			super();
			
			//currentImage = new Bitmap();
			//addChild(currentImage);
			cacheAsBitmap = true;
			
			redHaloFilter = new GlowFilter();
			redHaloFilter.color = 0xFFF000;
			redHaloFilter.strength = 5;
			
			orangeHaloFilter = new GlowFilter();
			orangeHaloFilter.color = 0xFF0000;
			orangeHaloFilter.strength = 5;
			
			applyColor();
			applySelected();
			applyHalo();
		}

		public function setColor(color:String):void {
			this.color = color;
			applyColor();
		}
		
		public function getColor():String {
			return this.color;
		}
		
		public function applyColor(color:String = null):void {
			if(color != null)
				this.color = color;
			
			//this.currentImage.source = AssetManager.getAsset(this.color);
			setImage(AssetManager.getAsset(this.color));
		}
		
		private function setImage(asset:Class):void {
			var bitmap:Bitmap = new asset();
			//currentImage.bitmapData = bitmap.bitmapData;
			this.graphics.clear();
			this.graphics.beginBitmapFill(bitmap.bitmapData, null, false, true);
			this.graphics.drawRect(0, 0, 75, 75);
			this.graphics.endFill();
			
			this.width = 75;
			this.height = 75;
			
		}
		
		public function applySelected():void {
			if(selected) {
				//this.currentImage.source = AssetManager.getAsset(color + "_selected");
				setImage(AssetManager.getAsset(color + "_selected"));
			} else {
				//this.currentImage.source = AssetManager.getAsset(color);
				setImage(AssetManager.getAsset(color));
			}
		}
		
		public function setSelected(selected:Boolean, apply:Boolean = true):void {
			this.selected = selected;
			if(apply)
				applySelected();
		}
		
		public function setFire(enabled:Boolean, delay:int = 0):void {
			this.flaming = enabled;
			
			if(enabled) {
				//currentImage.source = AssetManager.getAsset("fire");
				setImage(AssetManager.getAsset(color));
			}
			//	fire.visible = true;
			
			setEffect(enabled, delay);
		}
		
		public function setMorph(color:String, delay:int = 0):void {
			newColor = color;
			delayTimer = new Timer(delay * 100, 1);
			delayTimer.addEventListener(TimerEvent.TIMER_COMPLETE, morphColor);
			delayTimer.start();
		}
		
		private function morphColor(event:TimerEvent):void {
			applyColor(newColor);
		}
		
		public function setMorpherHalo(enabled:Boolean):void {
			this.morpherHalo = enabled;
		}
		
		public function getMorpherHalo():Boolean {
			return this.morpherHalo;
		}
		
		public function applyHalo():void {
			if(morpherHalo)
				this.filters = [orangeHaloFilter];
			else if(sparkHalo)
				this.filters = [redHaloFilter];
			else
				this.filters = null;
			
			if(morpherHalo || sparkHalo) {
				haloFlasher = new Timer(1000, 0);
				haloFlasher.addEventListener(TimerEvent.TIMER, flashHalo);
				haloFlasher.start();
			}
		}
		
		private function flashHalo(event:TimerEvent):void {
			if(morpherHalo) {
				if(this.filters.length == 0)
					this.filters = [orangeHaloFilter];
				else
					this.filters = [];
			} else if(sparkHalo) {
				if(this.filters.length == 0)
					this.filters = [redHaloFilter];
				else
					this.filters = [];
			}
		}
		
		public function setSparkHalo(enabled:Boolean):void {
			this.sparkHalo = enabled;
		}
		
		public function getSparkHalo():Boolean {
			return this.sparkHalo;
		}
		
		public function setGlow(enabled:Boolean, delay:int = 0):void {
			this.glowing = enabled;
			
			if(enabled) {
				//currentImage.source = AssetManager.getAsset("glow");
				setImage(AssetManager.getAsset("glow"));
			}
			//glow.visible = true;
			
			setEffect(enabled, delay);
		}
		
		private function setEffect(enabled:Boolean, delay:int = 0):void {
			if(enabled) {
				delayTimer = new Timer(delay * 100, 1);
				delayTimer.addEventListener(TimerEvent.TIMER_COMPLETE, startFade);
				delayTimer.start();
			} else {
				this.alpha = 1.0;
				
				//currentImage.source = AssetManager.getAsset(color);
				setImage(AssetManager.getAsset(color));
				fadeComplete(null);
			}
		}
		
		public function getGlow():Boolean {
			return glowing;
		}
		
		public function getFire():Boolean {
			return flaming;
		}
		
		private function startFade(event:TimerEvent):void {
			delayTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, startFade);
			fadeTimer = new Timer(100, 5);
			fadeTimer.addEventListener(TimerEvent.TIMER, fadeOut);
			fadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, fadeComplete);
			fadeTimer.start();
		}
		
		private function fadeOut(event:TimerEvent):void {
			this.alpha -= 0.2;
		}
		
		private function fadeComplete(event:TimerEvent):void {
			fadeTimer.stop();
			fadeTimer.removeEventListener(TimerEvent.TIMER, fadeOut);
			fadeTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, fadeComplete);
		}
		
		public function isSelected():Boolean {
			return selected;
		}
		
		public function startCascade(count:int):void {
			if(count > 0) {
				stepCount = MAX_CASCADE_STEPS * count;
			}
		}
		
		public function update():void {
			if(stepCount > 0) {
				this.y += FALL_SPEED;
				stepCount--;
			}
		}
		
		/*public function startCascade(count:int):void {
		if(count > 0) {
		cascadeTimer = new Timer(0);
		cascadeTimer.repeatCount = 4 * count;
		cascadeTimer.addEventListener(TimerEvent.TIMER, doCascade);
		cascadeTimer.addEventListener(TimerEvent.TIMER_COMPLETE, cascadeFinished);
		cascadeTimer.reset();
		cascadeTimer.start();
		}
		}
		
		public function doCascade(event:TimerEvent):void {
		this.y+=8;
		}
		
		public function cascadeFinished(event:TimerEvent):void {
		cascadeTimer.removeEventListener(TimerEvent.TIMER, doCascade);
		cascadeTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, cascadeFinished);
		cascadeTimer.stop();
		}*/
	}
}