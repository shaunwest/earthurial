/**
 * User: shaun
 * Date: 11/14/13 6:02 PM
 */


EARTH.sounds = {
    sounds: {},

    addSound: function(id, soundAsset) {
        this.sounds[id] = soundAsset;
    },

    addSoundToGroup: function(groupId, index, soundAsset) {
        var sounds = this.sounds;
        if(!sounds[groupId]) {
            sounds[groupId] = [];
        }

        sounds[groupId][index] = soundAsset;
    }
};