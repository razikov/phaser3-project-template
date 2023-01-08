import {
    DELAY_EVENT,
    KEY_BATTLE_SCENE,
    KEY_DRAGON_BLUE,
    KEY_DRAGON_ORANGE,
    KEY_PLAYER,
    KEY_UI_SCENE, KEY_WORLD_SCENE,
    PLAYER_SELECT_EVENT
} from './Const'
import PlayerCharacter from "../core/PlayerCharacter";
import Enemy from "../core/Enemy";

export default class BattleScene extends Phaser.Scene
{
    constructor()
    {
        super(KEY_BATTLE_SCENE);
    }

    preload()
    {

    }

    create()
    {
        this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

        this.startBattle();

        this.sys.events.on('wake', this.startBattle, this);
    }

    nextTurn() {
        if (this.checkEndBattle()) {
            this.endBattle();
            return;
        }

        do {
            this.index++;
            // если юнитов больше нет, то начинаем сначала с первого
            if (this.index >= this.units.length) {
                this.index = 0;
            }
        } while (!this.units[this.index].living);

        // если это герой игрока
        if (this.units[this.index] instanceof PlayerCharacter) {
            this.events.emit(PLAYER_SELECT_EVENT, this.index);
        } else { // иначе если это юнит врага
            // выбираем случайного героя
            const r = Math.floor(Math.random() * this.heroes.length);
            // и вызываем функцию атаки юнита врага
            this.units[this.index].attack(this.heroes[r]);
            // добавляем задержку на следующий ход, чтобы был плавный игровой процесс
            this.time.addEvent({ delay: DELAY_EVENT, callback: this.nextTurn, callbackScope: this });
        }
    }

    checkEndBattle() {
        let victory = true;
        // если все враги умерли - мы победили
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].living) {
                victory = false;
            }
        }

        let gameOver = true;
        // если все герои умерли - мы проиграли
        for (let i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].living) {
                gameOver = false;
            }
        }

        return victory || gameOver;
    }

    endBattle() {
        // очищаем состояния, удаляем спрайты
        this.heroes.length = 0;
        this.enemies.length = 0;
        for (let i = 0; i < this.units.length; i++) {
            // ссылки на экземпляры юнитов
            this.units[i].destroy();
        }

        this.units.length = 0;
        // скрываем UI
        this.scene.sleep(KEY_UI_SCENE);
        // возвращаемся в WorldScene и скрываем BattleScene
        this.scene.switch(KEY_WORLD_SCENE);
    }

    receivePlayerSelection(action, target) {
        if (action === 'attack') {
            this.units[this.index].attack(this.enemies[target]);
        }

        this.time.addEvent({ delay: DELAY_EVENT, callback: this.nextTurn, callbackScope: this });
    }

    exitBattle() {
        this.scene.sleep(KEY_UI_SCENE);
        this.scene.switch(KEY_WORLD_SCENE);
    }

    startBattle() {
        // персонаж игрока - warrior (воин)
        const warrior = new PlayerCharacter(this, 250, 50, KEY_PLAYER, 1, 'Воин', 100, 20);
        this.add.existing(warrior);

        // персонаж игрока - mage (маг)
        const mage = new PlayerCharacter(this, 250, 100, KEY_PLAYER, 4, 'Маг', 80, 8);
        this.add.existing(mage);

        const dragonBlue = new Enemy(this, 50, 50, KEY_DRAGON_BLUE, null, 'Дракон', 50, 3);
        this.add.existing(dragonBlue);

        const dragonOrange = new Enemy(this, 50, 100, KEY_DRAGON_ORANGE, null, 'Дракон2', 50, 3);
        this.add.existing(dragonOrange);

        // массив с героями
        this.heroes = [ warrior, mage ];
        // массив с врагами
        this.enemies = [ dragonBlue, dragonOrange ];
        // массив с обеими сторонами, которые будут атаковать
        this.units = this.heroes.concat(this.enemies);

        // Одновременно запускаем сцену UI Scene
        this.scene.launch(KEY_UI_SCENE);

        this.index = -1; // Текущий активный юнит
    }
}
