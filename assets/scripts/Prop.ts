import { Global } from "./Global";
import { Utils } from "./Utils";
import { TProp } from "./Enum";

/**
 * @module 道具
 */
// ============================ 导入

// ============================ 类型定义


// ============================ 常量定义
const {ccclass, property} = cc._decorator;


// ============================ 变量定义


// ============================ 类定义
@ccclass
export default class Prop extends cc.Component {
    @property
    selfType: TProp = 'coin';

    /**初始X */
    initX: number = 0;
    /**初始Y */
    initY: number = 0;
    /**初始角度 */
    initAngle: number = 0;
    /**图片路径 */
    imgSprite: cc.SpriteFrame;


    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.setPosition(cc.v2(this.initX, this.initY));
        this.node.angle = this.initAngle;
        cc.loader.loadRes('textures/ui_rank', cc.SpriteAtlas, (err:any, atlas: cc.SpriteAtlas) => {
            if (err) return;

            this.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('icon_third');
            this.node.opacity = 255;
        });
    }

    // start () {

    // }

    // update (dt) {}

    /**
     * 初始化
     */
    init = (x: number, y: number, angle: number, selfType: TProp) => {
        this.initX = x;
        this.initY = y;
        this.initAngle = Utils.getRotateAngle(angle);
        this.selfType = selfType;        
    }

    onCollisionEnter (other: cc.BoxCollider, self: cc.BoxCollider) {
        const oComponent = other.getComponent('Enemy') || other.getComponent('Prop')

        if (oComponent) return;

        this.node.destroy();
    }
}


// ============================ 组件定义


// ============================ 方法定义


// ============================ 导出


// ============================ 立即执行

