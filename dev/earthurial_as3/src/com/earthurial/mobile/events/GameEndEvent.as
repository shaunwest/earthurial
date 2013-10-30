package com.earthurial.mobile.events
{
	import flash.events.Event;

	public class GameEndEvent extends Event
	{
		public static const END_EVENT:String = "endEvent";
		
		private var _message:String;
		
		public function GameEndEvent(type:String, message:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			this._message = message;
		}
		
		public function get message():String {
			return _message;
		}
	}
}