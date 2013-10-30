/**
 * User: shaun
 * Date: 10/26/13 6:51 PM
 */

EARTH.tileFactory = {
    tiles: [],

    getTile: function() {
        var tile = this.tiles.pop();

        return (tile) ? tile : this.createTile();
    },

    createTile: function() {
        var tile = Object.create(EARTH.tile);
        this.tiles.push(tile);
        return tile;
    },

    freeTile: function(tile) {
        this.tiles.push(tile);
    }
};
