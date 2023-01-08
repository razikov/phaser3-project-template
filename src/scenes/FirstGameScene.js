import sky from './../assets/sky.png';
import ground from './../assets/platform.png';
import star from './../assets/star.png';
import bomb from './../assets/bomb.png';
import dudeSprite from './../assets/dude.png'

class FirstGameScene extends Phaser.Scene
{
    constructor() {
        super('first-game-scene');
        this.platforms = null;
        this.player = null;
        this.stars = null;
        this.score = 0;
        this.scoreText = null;
        this.bombs = null;
    }

    preload() {
        this.load.image('sky', sky);
        this.load.image('ground', ground);
        this.load.image('star', star);
        this.load.image('bomb', bomb);
        this.load.spritesheet(
            'dude',
            dudeSprite,
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        // порядок отрисовки зависит от порядка объявления. Первые снизу
        // координаты размещения изображений по центрам. См image.setOrigin()
        this.add.image(400, 300, 'sky');

        this.platforms = this.physics.add.staticGroup();
        // у статических объектов обязательно вызывать обновление после изменений
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        // this.anims - animation manager глобальный. Созданные анимации доступны всем объектам. Они имеют общие данные, но собственные временные шкалы
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.physics.add.collider(this.player, this.platforms);

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });
        this.stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.bombs = this.physics.add.group();
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);
    }

    update(time, delta) {
        super.update(time, delta);

        let cursors = this.input.keyboard.createCursorKeys();

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            const bomb = this.bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb(player, bomb) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
        let gameOver = true;
    }
}

export default
