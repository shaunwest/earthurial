package com.earthurial.mobile.events
{
	import flash.events.Event;

	public class TimeEvent extends Event
	{
		public static const TIME_EVENT:String = "timeEvent";
		
		private var _changeAmount:int;
		
		public function TimeEvent(type:String, changeAmount:int, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			_changeAmount = changeAmount;
		}
		
		public function get amount():int {
			return _changeAmount;
		}
	}
}