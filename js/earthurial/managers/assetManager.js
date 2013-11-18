/**
 * User: shaun
 * Date: 10/26/13 7:00 PM
 */


EARTH.assetManager = {
    onReady: function(ready) {
        this.ready = ready;
    },

    load: function(config) {
        this.loadCount = 0;

        if(config.hasOwnProperty("sounds")) {
            this.loadSounds(config.sounds);
        }

        if(config.hasOwnProperty("tileSheets")) {
            this.loadTileSheets(config.tileSheets);
        }
    },

    assetReady: function() {
        this.loadCount--;
        if(this.loadCount == 0) {
            if(typeof this.ready === "function") {
                this.ready();
            }
        }
    },

    loadSounds: function(sounds) {
        var soundAssets = sounds.assets,
            assetCount = soundAssets.length,
            assetInfo;

        this.soundsModel = sounds.model;
        this.loadCount += assetCount;

        for(var i = 0; i < assetCount; i++) {
            assetInfo = soundAssets[i];
            if(assetInfo.hasOwnProperty("paths")) {
                this.loadCount += (assetInfo['paths'].length - 1);
                this.loadSoundGroup(assetInfo['id'], assetInfo['paths']);
            } else {
                this.loadSound(assetInfo['id'], assetInfo['path']);
            }
        }
    },

    loadSoundGroup: function(id, sounds) {
        for(var i = 0; i < sounds.length; i++) {
            this.loadSound(id, sounds[i], i);
        }
    },

    // There will probably need to be just one audio
    // player for all sounds, and it will need to be
    // enabled for iOS
    loadSound: function(id, path, index) {
        var soundAsset = new Audio();

        /*soundAsset.addEventListener(
            "canplaythrough",
            $.proxy(function() {
                if(typeof index !== "undefined") {
                    this.soundsModel.addSoundToGroup(id, index, soundAsset);
                } else {
                    this.soundsModel.addSound(id, soundAsset);
                }
                this.assetReady();
            }, this),
            true
        );*/

        soundAsset.addEventListener(
            "error",
            $.proxy(function(e) {
                switch (e.target.error.code) {
                    case e.target.error.MEDIA_ERR_ABORTED:
                        EARTH.log('You aborted the video playback.');
                        break;
                    case e.target.error.MEDIA_ERR_NETWORK:
                        EARTH.log('A network error caused the audio download to fail.');
                        break;
                    case e.target.error.MEDIA_ERR_DECODE:
                        EARTH.log('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
                        break;
                    case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        EARTH.log('The audio could not be loaded, either because the server or network failed or because the format is not supported.');
                        break;
                    default:
                        EARTH.log('An unknown error occurred.');
                        break;
                }
                alert("Audio load error!");
                EARTH.log("assetManager: asset load aborted");
            }),
            true
        );

        // DEBUG
        soundAsset.src = path;

        if(typeof index !== "undefined") {
            this.soundsModel.addSoundToGroup(id, index, soundAsset);
        } else {
            this.soundsModel.addSound(id, soundAsset);
        }
        this.assetReady();
    },

    loadTileSheets: function(tileSheets) {
        var tileSheetAssets = tileSheets.assets,
            assetCount = tileSheetAssets.length,
            assetInfo;

        this.tileSheetsModel = tileSheets.model;
        this.loadCount += assetCount;

        for(var i = 0; i < assetCount; i++) {
            assetInfo = tileSheetAssets[i];
            this.loadTileSheet(assetInfo.id, assetInfo.path, assetInfo.tileWidth, assetInfo.tileHeight);
        }
    },

    loadTileSheet: function(id, path, tileWidth, tileHeight) {
        var tileSheetAsset = new Image();



        tileSheetAsset.src = path;
        tileSheetAsset.onload = $.proxy(function() {
            /*this.tileSheets[id] = this.makeTileSheet(tileSheetAsset, tileWidth, tileHeight);*/
            this.tileSheetsModel.addTileSheet(id, tileSheetAsset, tileWidth, tileHeight);
            this.assetReady();
        }, this);
    }


};