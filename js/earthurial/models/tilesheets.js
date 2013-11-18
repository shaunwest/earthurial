/**
 * User: shaun
 * Date: 11/14/13 6:02 PM
 */


EARTH.tileSheets = {
    DEFAULT_TILE_WIDTH: 75,
    DEFAULT_TILE_HEIGHT: 75,

    tileSheets: {},

    addTileSheet: function(id, tileSheetAsset, tileWidth, tileHeight) {
        tileWidth = EARTH.def(tileWidth, this.DEFAULT_TILE_WIDTH);
        tileHeight = EARTH.def(tileHeight, this.DEFAULT_TILE_HEIGHT);

        this.tileSheets[id] = this.makeTileSheet(tileSheetAsset, tileWidth, tileHeight);
    },

    makeTileSheet: function(tileSheetAsset, tileWidth, tileHeight) {
        var frameCount = Math.floor(tileSheetAsset.width / tileWidth),
            rowCount = Math.floor(tileSheetAsset.height / tileHeight),
            tileSheet = [];

        for(var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            tileSheet.push(this.makeRow(tileSheetAsset, rowIndex, tileWidth, tileHeight, frameCount));
        }

        return tileSheet;
    },

    makeRow: function(tileSheet, rowIndex, tileWidth, tileHeight, frameCount) {
        var frames = [];

        for(var frameIndex = 0; frameIndex < frameCount; frameIndex++) {
            frames.push(this.makeFrame(tileSheet, rowIndex, frameIndex, tileWidth, tileHeight));
        }

        return frames;
    },

    makeFrame: function(tileSheet, rowIndex, frameIndex, tileWidth, tileHeight) {
        var frame = document.createElement("canvas"),
            frameContext = frame.getContext('2d');

        frame.width = tileWidth;
        frame.height = tileHeight;

        frameContext.drawImage(tileSheet, frameIndex * tileWidth, rowIndex * tileHeight,
            tileWidth, tileHeight,
            0, 0,
            tileWidth, tileHeight);

        return frame;
    }
};
