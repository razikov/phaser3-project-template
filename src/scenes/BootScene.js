import tiles from './../assets/map/spritesheet.png'
import map from './../assets/map/map.json'
import player from './../assets/RPG_assets.png'
import dragonOrrange from './../assets/dragonorrange.png'
import dragonBlue from './../assets/dragonblue.png'
import {
    KEY_TILES,
    KEY_MAP,
    KEY_PLAYER,
    KEY_BOOT_SCENE,
    KEY_WORLD_SCENE,
    KEY_DRAGON_ORANGE,
    KEY_DRAGON_BLUE, KEY_BATTLE_SCENE
} from './Const'

export default class BootScene extends Phaser.Scene
{
    constructor()
    {
        super(KEY_BOOT_SCENE);
    }

    preload()
    {
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 20,
            text: 'Загрузка...',
            style: {
                font: '10px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '10px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xAAAAAA, 1);
            progressBar.fillRect(100, 110, 120 * value, 20);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
            console.log(file.src);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        this.load.image(KEY_TILES, tiles);

        this.load.tilemapTiledJSON(KEY_MAP, map);
        this.load.spritesheet(KEY_PLAYER, player, { frameWidth: 16, frameHeight: 16 });
        this.load.image(KEY_DRAGON_BLUE, dragonBlue);
        this.load.image(KEY_DRAGON_ORANGE, dragonOrrange);
        for (let i = 0; i < 500; i++) {
            this.load.image('dragon'+i, dragonOrrange);
        }
    }

    create()
    {
        this.scene.start(KEY_WORLD_SCENE);
    }
}
