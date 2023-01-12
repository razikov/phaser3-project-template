import Phaser from 'phaser';
import fontTexture from './assets/arcade.png';
import fontData from './assets/arcade.xml';
import tiles from './assets/colored.png';
import dungeon from "./Dungeon.js"
import tm from "./TurnManager.js"
import PlayerCharacter from "./PlayerCharacter"

const KEY_FONT = 'arcade';
export const KEY_TILES = 'tiles';
export const TILE_SIZE = 16;

class MyGame extends Phaser.Scene
{
    preload ()
    {
        this.load.bitmapFont(KEY_FONT, fontTexture, fontData);
        this.load.spritesheet(
            KEY_TILES,
            tiles,
            {
                frameWidth: TILE_SIZE,
                frameHeight: TILE_SIZE,
                spacing: 1
            }
        );
    }

    create ()
    {
        dungeon.initialize(this)
        let player = new PlayerCharacter(15, 15)
        tm.addEntity(player)
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        super.update(time, delta);
        if (tm.over()) {
            tm.refresh()
        }
        tm.turn()
    }
}

const config = {
    type: Phaser.AUTO,
    width: 80*16,
    height: 50*16,
    backgroundColor: "#000",
    parent: "game",
    pixelArt: true,
    zoom: 2,
    scene: MyGame,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);
