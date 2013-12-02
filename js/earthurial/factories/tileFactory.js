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
        spark: 5,
        morpher: 6,
        superMorpher: 7,
        phoenix: 8
    },

    getTile: function() {
        var tile = this.tiles.pop();

        if(!tile) {
            tile = this.createTile();
        } else {
            this.setDefaultValues(tile);
        }

        return tile;
    },

    setDefaultValues: function(tile) {
        for(var key in EARTH.tile) {
            if(EARTH.tile.hasOwnProperty(key)) {
                tile[key] = EARTH.tile[key];
            }
        }
    },

    getSimpleRandomTile: function() {
        var tile = this.getTile();
        tile.type = Math.floor(Math.random() * 5); // this will return only a basic tile (0-4)

        return tile;
    },

    getTileType: function(type) {
        var tile = this.getTile();
        tile.type = type;

        return tile;
    },

    getValidTile: function(tile) {
        var types = this.tileTypes,
            type = tile.type;

        if(type != types.morpher &&
            type != types.superMorpher &&
            type != types.spark &&
            type != types.phoenix) {
            return this.getTileType(tile.type);
        }
        else {
            return this.getSimpleRandomTile();
        }
    },

    createTile: function() {
        return Object.create(EARTH.tile);
    },

    freeTile: function(tile) {
        this.tiles.push(tile);
    }
};
