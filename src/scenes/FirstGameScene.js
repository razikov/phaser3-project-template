import sky from './../assets/sky.png';
import ground from './../assets/platform.png';
import star from './../assets/star.png';
import bomb from './../assets/bomb.png';
import dudeSprite from './../assets/dude.png'
import ScoreLabel from '../ui/ScoreLabel'
import BombSpawner from "./BombSpawner";

const GROUND_KEY = 'ground'
const SKY_KEY = 'sky'
const STAR_KEY = 'star'
const BOMB_KEY = 'bomb'
const DUDE_KEY = 'dude'

export default class FirstGameScene extends Phaser.Scene
{
    constructor()
    {
        super('first-game-scene');
        this.platforms = undefined;
        this.player = undefined;
        this.stars = undefined;
        this.cursors = undefined;
        this.scoreLabel = undefined;
        this.bombSpawner = undefined;
        this.gameOver = false;
    }

    preload()
    {
        this.load.image(SKY_KEY, sky);
        this.load.image(GROUND_KEY, ground);
        this.load.image(STAR_KEY, star);
        this.load.image(BOMB_KEY, bomb);
        this.load.spritesheet(
            DUDE_KEY,
            dudeSprite,
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create()
    {
        // порядок отрисовки зависит от порядка объявления. Первые снизу
        // координаты размещения изображений по центрам. См image.setOrigin()
        this.add.image(400, 300, SKY_KEY);

        this.platforms = this.createPlatforms();
        this.player = this.createPlayer();
        this.stars = this.createStars();
        this.scoreLabel = this.createScoreLabel(16, 16, 0);

        this.bombSpawner = new BombSpawner(this, BOMB_KEY);
        const bombGroup = this.bombSpawner.group;

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(bombGroup, this.platforms);
        this.physics.add.collider(this.player, bombGroup, this.hitBomb, null, this);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    createPlatforms()
    {
        const platforms = this.physics.add.staticGroup();

        // у статических объектов обязательно вызывать обновление после изменений
        platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody();
        platforms.create(600, 400, GROUND_KEY);
        platforms.create(50, 250, GROUND_KEY);
        platforms.create(750, 220, GROUND_KEY);

        return platforms;
    }

    update(time, delta)
    {
        if (this.gameOver) {
            return;
        }

        super.update(time, delta);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    collectStar(player, star)
    {
        star.disableBody(true, true);

        this.scoreLabel.add(10);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            this.bombSpawner.spawn(player.x);
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.gameOver = true;
    }

    createPlayer()
    {
        const player = this.physics.add.sprite(100, 450, DUDE_KEY);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        // this.anims - глобальный animation manager. Созданные анимации доступны всем объектам. Они имеют общие данные, но собственные временные шкалы
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: DUDE_KEY, frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        return player;
    }

    createStars()
    {
        const stars = this.physics.add.group({
            key: STAR_KEY,
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        return stars;
    }

    createScoreLabel(x, y, score) {
        const style = { fontSize: '32px', fill: '#000' }
        const label = new ScoreLabel(this, x, y, score, style);

        this.add.existing(label);

        return label;
    }
}
