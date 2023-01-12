import level from "./room1.js"
import {KEY_TILES, TILE_SIZE} from "./index";

let dungeon = {
    sprites: {
        floor: 0,
        wall: 826,
    },
    initialize: function (scene) {
        this.scene = scene
        scene.level = level.map(r => r.map(t => t === 1 ? this.sprites.wall : this.sprites.floor))

        const config = {
            data: scene.level,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        }
        const map = scene.make.tilemap(config)
        const tileset = map.addTilesetImage('tiles', KEY_TILES, TILE_SIZE, TILE_SIZE, 0, 1)
        this.map = map.createLayer(0, tileset, 0, 0)
    }
}

export default dungeon
