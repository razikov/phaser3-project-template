import Phaser from 'phaser';
import BootScene from './scenes/BootScene'
import WorldScene from './scenes/WorldScene'
import BattleScene from './scenes/BattleScene'
import UIScene from './scenes/UIScene'

const config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: [
        BootScene,
        WorldScene,
        BattleScene,
        UIScene
    ]
};

const game = new Phaser.Game(config);
