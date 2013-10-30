package com.earthurial.mobile.events
{
	import flash.events.Event;

	public class PointEvent extends Event
	{
		public static const POINT_EVENT:String = "pointEvent";
		
		private var _pointValue:int;
		private var _x:int;
		private var _y:int;
		
		public function PointEvent(type:String, pointValue:int, x:int, y:int, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			_pointValue = pointValue;
			_x = x;
			_y = y;
		}
		
		public function get pointValue():int {
			return _pointValue;
		}
		
		public function get x():int {
			return _x;
		}
		
		public function get y():int {
			return _y;
		}
	}
}