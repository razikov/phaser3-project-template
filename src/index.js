import Phaser from 'phaser';
import FirstGameScene from './scenes/FirstGameScene'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: FirstGameScene
};

const game = new Phaser.Game(config);
