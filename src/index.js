import Phaser from 'phaser';
import ship from './assets/spaceShips_001.png';
import otherShip from './assets/enemyBlack5.png';
import star from './assets/star_gold.png';
import {io} from "socket.io-client";
import {
    CURRENT_PLAYERS_EVENT, LEAVE_PLAYER,
    NEW_PLAYER_EVENT,
    PLAYER_MOVED_EVENT,
    PLAYER_MOVEMENT_EVENT,
    SCORE_UPDATE_EVENT, STAR_COLLECTED_EVENT, STAR_LOCATION_EVENT
} from "./const";

class MyGame extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        this.load.image('ship', ship);
        this.load.image('otherPlayer', otherShip);
        this.load.image('star', star);
    }
      
    create ()
    {
        const self = this;
        this.socket = io();
        this.otherPlayers = this.physics.add.group();

        this.socket.on(CURRENT_PLAYERS_EVENT, function (players) {
            console.log(CURRENT_PLAYERS_EVENT, players);
            Object.keys(players).forEach(function (id) {
                if (players[id].playerId === self.socket.id) {
                    self.addPlayer(players[id]);
                } else {
                    self.addOtherPlayers(players[id]);
                }
            });
        });

        this.socket.on(NEW_PLAYER_EVENT, function (playerInfo) {
            self.addOtherPlayers(playerInfo);
        });

        this.socket.on(PLAYER_MOVED_EVENT, function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    otherPlayer.setRotation(playerInfo.rotation);
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                }
            });
        });

        this.socket.on(LEAVE_PLAYER, function (playerId) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerId === otherPlayer.playerId) {
                    otherPlayer.destroy();
                }
            });
        });

        this.socket.on(STAR_LOCATION_EVENT, function (starLocation) {
            if (self.star) self.star.destroy();
            self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
            self.physics.add.overlap(self.ship, self.star, function () {
                this.socket.emit(STAR_COLLECTED_EVENT);
            }, null, self);
        });

        this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
        this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

        this.socket.on(SCORE_UPDATE_EVENT, function (scores) {
            self.blueScoreText.setText('Синие: ' + scores.blue);
            self.redScoreText.setText('Красные: ' + scores.red);
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        super.update(time, delta);

        if (this.ship) {
            if (this.cursors.left.isDown) {
                this.ship.setAngularVelocity(-150);
            } else if (this.cursors.right.isDown) {
                this.ship.setAngularVelocity(150);
            } else {
                this.ship.setAngularVelocity(0);
            }

            if (this.cursors.up.isDown) {
                this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
            } else {
                this.ship.setAcceleration(0);
            }

            this.physics.world.wrap(this.ship, 5);

            // генерация события движения
            const x = this.ship.x;
            const y = this.ship.y;
            const r = this.ship.rotation;
            if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
                this.socket.emit(PLAYER_MOVEMENT_EVENT, { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
            }

            // сохраняем данные о старой позиции
            this.ship.oldPosition = {
                x: this.ship.x,
                y: this.ship.y,
                rotation: this.ship.rotation
            };
        }
    }

    addPlayer(playerInfo)
    {
        this.ship = this.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (playerInfo.team === 'blue') {
            this.ship.setTint(0x0000ff);
        } else {
            this.ship.setTint(0xff0000);
        }
        this.ship.setDrag(100);
        this.ship.setAngularDrag(100);
        this.ship.setMaxVelocity(200);
    }

    addOtherPlayers(playerInfo)
    {
        let otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (playerInfo.team === 'blue') {
            otherPlayer.setTint(0x0000ff);
        } else {
            otherPlayer.setTint(0xff0000);
        }
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: MyGame
};

const game = new Phaser.Game(config);
