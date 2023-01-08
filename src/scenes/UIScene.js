import {ENEMY_EVENT, KEY_BATTLE_SCENE, KEY_UI_SCENE, PLAYER_SELECT_EVENT, SELECTED_ACTION_EVENT} from './Const';
import HeroesMenu from "../ui/HeroesMenu";
import ActionsMenu from "../ui/ActionsMenu";
import EnemiesMenu from "../ui/EnemiesMenu";
import Message from "../ui/Message";

export default class UIScene extends Phaser.Scene
{
    constructor()
    {
        super(KEY_UI_SCENE);

        this.graphics = undefined;
    }

    preload()
    {

    }

    create()
    {
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);
        this.graphics.strokeRect(2, 150, 90, 100);
        this.graphics.fillRect(2, 150, 90, 100);
        this.graphics.strokeRect(95, 150, 90, 100);
        this.graphics.fillRect(95, 150, 90, 100);
        this.graphics.strokeRect(188, 150, 130, 100);
        this.graphics.fillRect(188, 150, 130, 100);

        this.menus = this.add.container();

        this.heroesMenu = new HeroesMenu(195, 153, this);
        this.actionsMenu = new ActionsMenu(100, 153, this);
        this.enemiesMenu = new EnemiesMenu(8, 153, this);

        // текущее выбранное меню
        this.currentMenu = this.actionsMenu;

        // добавление меню в контейнер
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.battleScene = this.scene.get(KEY_BATTLE_SCENE);

        this.input.keyboard.on('keydown', this.onKeyInput, this);
        // this.cursors = this.input.keyboard.createCursorKeys();

        this.battleScene.events.on(PLAYER_SELECT_EVENT, this.onPlayerSelect, this);

        this.events.on(SELECTED_ACTION_EVENT, this.onSelectedAction, this);

        this.events.on(ENEMY_EVENT, this.onEnemy, this);

        this.sys.events.on('wake', this.createMenu, this);

        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);

        this.createMenu()
    }

    // update(time, delta) {
    //     super.update(time, delta);
    //
    //     if (this.cursors.up.isDown) {
    //         this.currentMenu.moveSelectionUp();
    //     } else if (this.cursors.down.isDown) {
    //         this.currentMenu.moveSelectionDown();
    //     } else if (this.cursors.space.isDown) {
    //         this.currentMenu.confirm();
    //     }
    // }

    remapHeroes() {
        const heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    }

    remapEnemies() {
        const enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    }

    onKeyInput(event) {
        if (this.currentMenu && this.currentMenu.selected) {
            if (event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if (event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if (event.code === "ArrowRight" || event.code === "Shift") {

            } else if (event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }
    }

    onPlayerSelect(id) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    }

    onSelectedAction() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    }

    onEnemy(index) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection('attack', index);
    }

    createMenu() {
        // перестроение пунктов меню для героев
        this.remapHeroes();
        // перестроение пунктов меню для врагов
        this.remapEnemies();
        // первый шаг
        this.battleScene.nextTurn();
    }
}
