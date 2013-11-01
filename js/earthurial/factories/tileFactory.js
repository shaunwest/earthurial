/**
 * User: shaun
 * Date: 10/26/13 6:51 PM
 */

EARTH.tileFactory = {
    tiles: [],
    tileTypes: {
        green: 0,
        black: 1,
        blue: 2,
        purple: 3,
        red: 4,
        morpher: 5,
        superMorpher: 6,
        spark: 7,
        phoenix: 8
    },

    getTile: function() {
        var tile = this.tiles.pop();

        if(!tile) {
            tile = this.createTile();
        } else {
            tile.x = 0;
            tile.y = 0;
            tile.type = 0;
        }

        return tile;
    },

    getSimpleRandomTile: function() {
        var tile = this.getTile();
        tile.type = Math.floor(Math.random() * 5); // this will return only a basic tile (0-4)

        return tile;
    },

    getValidTile: function(tile) {
        var types = this.tileTypes,
            type = tile.type;

        if(type != types.morpher &&
            type != types.superMorpher &&
            type != types.spark &&
            type != types.phoenix) {
            return tile;
        }
        else {
            return this.getSimpleRandomTile();
        }
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
