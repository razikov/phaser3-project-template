import Menu from "./Menu";
import {ENEMY_EVENT} from "../scenes/Const";

export default class EnemiesMenu extends Menu
{
    constructor(x, y, scene, heroes) {
        super(x, y, scene, heroes);
    }

    confirm()
    {
        this.scene.events.emit(ENEMY_EVENT, this.menuItemIndex);
    }
}
