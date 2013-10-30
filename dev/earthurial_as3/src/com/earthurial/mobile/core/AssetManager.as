package com.earthurial.mobile.core {
	
	import flash.display.Bitmap;
	
	public class AssetManager
	{			
		[Embed(source="assets/tiles/red_tile1.png")]
		private static var red_lo:Class;

		[Embed(source="assets/tiles/red_tile_hi1.png")]
		private static var red_hi:Class;
		
		[Embed(source="assets/tiles/green_tile1.png")]
		private static var green_lo:Class;

		[Embed(source="assets/tiles/green_tile_hi1.png")]
		private static var green_hi:Class;
		
		[Embed(source="assets/tiles/black_tile2.png")]
		private static var black_lo:Class;

		[Embed(source="assets/tiles/black_tile_hi2.png")]
		private static var black_hi:Class;
		
		[Embed(source="assets/tiles/blue_tile2.png")]
		private static var blue_lo:Class;

		[Embed(source="assets/tiles/blue_tile_hi2.png")]
		private static var blue_hi:Class;
		
		[Embed(source="assets/tiles/purple_tile1.png")]
		private static var purple_lo:Class;

		[Embed(source="assets/tiles/purple_tile_hi1.png")]
		private static var purple_hi:Class;
		
		[Embed(source="assets/tiles/morpher_tile.png")]
		private static var morpher:Class;
		
		[Embed(source="assets/tiles/super_morpher_tile.png")]
		private static var super_morpher:Class;

		[Embed(source="assets/tiles/spark_tile.png")]
		private static var spark:Class;

		[Embed(source="assets/tiles/phoenix_tile.png")]
		private static var phoenix:Class;
		
		[Embed(source="assets/tiles/tile_glow.png")]
		private static var glow:Class;
		
		[Embed(source="assets/tiles/tile_fire.png")]
		private static var fire:Class;
		
		[Embed(source="assets/achievements/phoenix_achievement.png")]
		private static var achievementPhoenix:Class;
		
		[Embed(source="assets/achievements/spark_achievement.png")]
		private static var achievementSpark:Class;
		
		[Embed(source="assets/achievements/morpher_achievement.png")]
		private static var achievementMorpher:Class;
		
		[Embed(source="assets/achievements/no_achievement.png")]
		private static var achievementNone:Class;
		
		[Embed(source="assets/achievements/achievement_star_0.png")]
		private static var achievementStar0:Class;
		
		[Embed(source="assets/achievements/achievement_star_1.png")]
		private static var achievementStar1:Class;
		
		[Embed(source="assets/achievements/achievement_star_2.png")]
		private static var achievementStar2:Class;
		
		[Embed(source="assets/achievements/achievement_star_3.png")]
		private static var achievementStar3:Class;

		private static var assetDict:Object;
		
		public static function init():void
		{	
			assetDict = new Object();
			
			assetDict["red"] = red_lo; //redImage;
			assetDict["red_selected"] = red_hi; //redImageHi;
			
			assetDict["green"] = green_lo; //greenImage;
			assetDict["green_selected"] = green_hi; //greenImageHi;
			
			assetDict["black"] = black_lo; //blackImage;
			assetDict["black_selected"] = black_hi; //blackImageHi;
			
			assetDict["blue"] = blue_lo; //blueImage;
			assetDict["blue_selected"] = blue_hi; //blueImageHi;
			
			assetDict["purple"] = purple_lo; //purpleImage;
			assetDict["purple_selected"] = purple_hi; //purpleImageHi;
			
			assetDict["spark"] = spark; //sparkImage;
			assetDict["phoenix"] = phoenix; //phoenixImage;
			assetDict["morpher"] = morpher;
			assetDict["super_morpher"] = super_morpher;
			
			assetDict["glow"] = glow; //glowImage;
			assetDict["fire"] = fire; //fireImage;
			
			assetDict["achievement_phoenix"] = achievementPhoenix;
			assetDict["achievement_spark"] = achievementSpark;
			assetDict["achievement_morpher"] = achievementMorpher;
			assetDict["achievement_none"] = achievementNone;
			
			assetDict["achievement_star_0"] = achievementStar0;
			assetDict["achievement_star_1"] = achievementStar1;
			assetDict["achievement_star_2"] = achievementStar2;
			assetDict["achievement_star_3"] = achievementStar3;
		}
		
		public static function getAsset(name:String):Class {
			return assetDict[name];
		}
	}
}