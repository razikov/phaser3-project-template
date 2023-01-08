import {KEY_BATTLE_SCENE, KEY_MAP, KEY_PLAYER, KEY_TILES, KEY_WORLD_SCENE} from './Const'

export default class WorldScene extends Phaser.Scene
{
    constructor()
    {
        super(KEY_WORLD_SCENE);

        this.player = undefined;
    }

    preload()
    {

    }

    create()
    {
        const map = this.make.tilemap({ key: KEY_MAP });

        const tiles = map.addTilesetImage('spritesheet', KEY_TILES);

        const grass = map.createStaticLayer('Grass', tiles, 0, 0);
        const obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
        obstacles.setCollisionByExclusion([-1]);

        this.player = this.createPlayer()

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();

        // ограничиваем камеру размерами карты
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // заставляем камеру следовать за игроком
        this.cameras.main.startFollow(this.player);
        // своего рода хак, чтобы предотвратить появление полос в тайлах
        this.cameras.main.roundPixels = true;

        this.physics.add.collider(this.player, obstacles);

        this.spawns = this.createSpawns()
        this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, null, this);

        this.sys.events.on('wake', this.wake, this);
    }

    update(time, delta)
    {
        super.update(time, delta);

        this.player.body.setVelocity(0);

        // горизонтальное перемещение
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-80);
            this.player.anims.play('left', true);
            this.player.flipX = true; // Разворачиваем спрайты персонажа вдоль оси X
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(80);
            this.player.anims.play('right', true);
            this.player.flipX = false; // Отменяем разворот спрайтов персонажа вдоль оси X
        } else if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-80);
            this.player.anims.play('up', true);
        } else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(80);
            this.player.anims.play('down', true);
        } else {
            this.player.anims.stop();
        }
    }

    createPlayer()
    {
        const player = this.physics.add.sprite(50, 100, KEY_PLAYER, 6);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(KEY_PLAYER, { frames: [1, 7, 1, 13]}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(KEY_PLAYER, { frames: [1, 7, 1, 13] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(KEY_PLAYER, { frames: [2, 8, 2, 14]}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers(KEY_PLAYER, { frames: [ 0, 6, 0, 12 ] }),
            frameRate: 10,
            repeat: -1
        });

        return player;
    }

    createSpawns()
    {
        const spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });

        for (let i = 0; i < 30; i++) {
            let x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
            let y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
            // параметры: x, y, width, height
            spawns.create(x, y, 20, 20);
        }

        return spawns;
    }

    onMeetEnemy(player, zone)
    {
        zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);

        this.cameras.main.flash(300);

        // начало боя
        this.scene.switch(KEY_BATTLE_SCENE);
    }

    wake()
    {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }
}
