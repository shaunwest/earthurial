package com.earthurial.mobile.events
{
	import flash.events.Event;

	public class BonusEvent extends Event
	{
		public static const BONUS_EVENT:String = "bonusEvent";
		
		private var _message:String;
		private var _messageCode:int;
		
		public function BonusEvent(type:String, message:String, code:int = 0, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
			_message = message;
			_messageCode = code;
		}
		
		public function get message():String {
			return _message;
		}
		
		public function get messageCode():int {
			return _messageCode;
		}
		
		public function set messageCode(value:int):void {
			_messageCode = value;
		}
	}
}