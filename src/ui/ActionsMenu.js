import Menu from "./Menu";
import {SELECTED_ACTION_EVENT} from "../scenes/Const";

export default class ActionsMenu extends Menu
{
    constructor(x, y, scene, heroes) {
        super(x, y, scene, heroes);
        this.addMenuItem('Атака');
    }

    confirm()
    {
        this.scene.events.emit(SELECTED_ACTION_EVENT);
    }
}
