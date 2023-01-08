import Phaser from 'phaser'

export default class BombSpawner
{
    /**
     *
     * @param {Phaser.Scene} scene
     * @param {string} bombKey
     */
    constructor(scene, bombKey)
    {
        this.scene = scene;
        this.key = bombKey;

        this._group = this.scene.physics.add.group();
    }

    /**
     *
     * @returns {Phaser.Physics.Arcade.Group}
     */
    get group()
    {
        return this._group;
    }

    /**
     *
     * @param {number} playerX
     * @returns {any}
     */
    spawn(playerX)
    {
        const x = (playerX < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        const bomb = this.group.create(x, 16, this.key);
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        return bomb;
    }
}
