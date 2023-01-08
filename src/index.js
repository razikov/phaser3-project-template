import Phaser from 'phaser';
import FirstGameScene from './scenes/FirstGameScene'

const config = {
    type: Phaser.AUTO,
    // parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true
        }
    },
    scene: FirstGameScene
};

const game = new Phaser.Game(config);
