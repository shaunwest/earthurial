/**
 * User: shaun
 * Date: 10/26/13 6:54 PM
 */

if (!Object.create) {
    Object.create = (function(){
        function F(){}

        return function(o){
            if (arguments.length != 1) {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o
            return new F()
        }
    })()
}

EARTH.def = function(arg, defaultValue) {
    return typeof arg === 'undefined' ? defaultValue : arg;
};