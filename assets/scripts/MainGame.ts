/**
 * @module 游戏主逻辑
 */
// ============================ 导入
import { Utils } from "./Utils";
import { EBaseSetting } from "./Enum";
import { CFG_TIME_SPEED } from "./config/timeSpeedCfg";
import { Global } from "./Global";

// ============================ 常量定义
const {ccclass, property} = cc._decorator;

// ============================ 变量定义


// ============================ 类定义

@ccclass
export default class MainGame extends cc.Component {
    // 界面可编辑节点
    /**地表 */
    @property(cc.Node)
    surface: cc.Node = null;
    /**中景 */
    @property(cc.Node)
    prospect: cc.Node = null;

    // 预制体
    /**玩家 */
    @property(cc.Prefab)
    playerFab: cc.Prefab = null;
    /**敌人 */
    @property(cc.Prefab)
    enemyFab: cc.Prefab = null;
    /**道具 */
    @property(cc.Prefab)
    propFab: cc.Prefab = null;
    /**障碍物 */
    @property(cc.Prefab)
    obstacleFab: cc.Prefab = null;

    /**玩家节点 */
    player: cc.Node;
    /**敌人节点 */
    enemy: cc.Node;
    /**道具池 */
    propPool: cc.NodePool = new cc.NodePool();
    /**障碍池 */
    obstaclePool: cc.NodePool = new cc.NodePool();
    /**游戏是否暂停 */
    isPaused: boolean = false;
    /**转动开始时间 */
    startRotateTime: number = 0;
    /**上次转动时间 */
    lastRotateTime: number = 0;

    // // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.createPlayer();
        this.createEnemey();
        this.createProp();
        this.createObstacle();

        this.schedule(this.createProp, 2);

        this.bindListener();

        Global.initSpeed = CFG_TIME_SPEED[0].speed;
        Global.speedRatio = 1; 
        Global.meterPerAngle = this.calcMeterPerAngle(
            this.calcRelativeSurfaceAngle(this.player, 'Player'),
            this.calcRelativeSurfaceAngle(this.enemy, 'Enemy')
        );

    }

    start () {
        this.startGame();
    }

    update (dt) {
        this.updateRotate();
    }

    /**
     * 开始游戏
     */
    startGame = () => {
        this.isPaused = false;
        this.startRotateTime = Date.now();
        this.lastRotateTime = Date.now();
    }

    /**
     * 暂停游戏
     */
    pauseGame = () => {
        this.isPaused = true;

        this.surface.stopAllActions();
        this.prospect.stopAllActions();
    }

    /**
     * 绑定监听
     */
    bindListener = () => {
        const player = this.player.getComponent('Player');
        const enemy = this.enemy.getComponent('Enemy');

        player.mainGame = this;
        enemy.mainGame = this;

        this.node.on(cc.Node.EventType.TOUCH_START, () => {

            if (!this.isPaused) {
                player.jump();
            }
        });
    }

    /**
     * 节点旋转
     */
    nodeRotateBy = (node: cc.Node, duration: number = 2, angle: number = 360) => {
        const repeatRotateBy = cc.repeatForever(cc.rotateBy(duration, angle));

        node.runAction(repeatRotateBy);
    }

    /**
     * 计算相对于水平面角度
     */
    calcRelativeSurfaceAngle = (node: cc.Node, componentType: string) => {
        const component = node.getComponent(componentType);
        const pos = (this.node as cc.Node).convertToWorldSpaceAR(node.getPosition());
        const angle = 180 + Utils.getTowPointerAngle({ x: pos.x, y: pos.y }, { x: 375, y: 1334 });

        component.relativeAngle = angle;

        return angle;
    };
    
    /**
     * 获取 米/度
     */
    calcMeterPerAngle = (angle1: number, angle2: number): number => {
        return Math.abs(Math.abs(angle1) - Math.abs(angle2)) / EBaseSetting.INIT_DISTANCE;
    }

    /**
     * 生成玩家
     */
    createPlayer = () => {
        this.player = cc.instantiate(this.playerFab);
        this.node.addChild(this.player);
    }

    /**
     * 生成敌人
     */
    createEnemey = () => {
        this.enemy = cc.instantiate(this.enemyFab);
        this.node.addChild(this.enemy);
    }

    /**
     * 创建道具
     */
    createProp = () => {
        let prop: cc.Node = this.propPool.size() > 0 ?
                                Global.propPool.get() :
                                cc.instantiate(this.propFab);

        const parentAngle = Utils.convertAngle(-this.surface.angle + EBaseSetting.SECTOR_LEVLE_ANGLE);
        const x = Math.cos(parentAngle * Math.PI / 180) * EBaseSetting.PROP_RADIUS_MAX;
        const y = Math.sin(parentAngle * Math.PI / 180) * EBaseSetting.PROP_RADIUS_MAX;


        // const 

        // surface的中心点就在中间 而且原点与圆点与中心点重合故可以这样计算坐标
        prop.getComponent('Prop').init(x, y, 0, 'coin');

        this.surface.addChild(prop);
        
        // setTimeout(() => {
            
        //     prop.setPosition(cc.v2(Math.cos(parentAngle * Math.PI / 180) * EBaseSetting.PROP_RADIUS_MAX, Math.sin(parentAngle * Math.PI / 180) * EBaseSetting.PROP_RADIUS_MAX));
        // }, 1)
        // prop.getComponent('Prop')._updateLayout();
    }

    /**
     * 创建障碍物
     */
    createObstacle = () => {
        let obstacle: cc.Node = null;

        if (this.obstaclePool.size() > 0) {
            obstacle = this.obstaclePool.get();
        } else {
            obstacle = cc.instantiate(this.obstacleFab);
            this.obstaclePool.put(obstacle);
        }

        this.surface.addChild(obstacle);
    }

    /**
     * 更新转动
     */
    updateRotate = () => {
        let nowTime: number, timeInterval: number, timeLength: number, sectionIdx: number, nowSpeed: number;

        nowTime = Date.now();
        timeInterval = (nowTime-this.lastRotateTime) / 1000;
        timeLength = (nowTime-this.startRotateTime) / 1000;
        sectionIdx = Utils.judgeSection(timeLength, CFG_TIME_SPEED, 'time');
        nowSpeed = CFG_TIME_SPEED[sectionIdx].speed;

        this.surface.angle += 0.2;
        this.prospect.angle += nowSpeed / EBaseSetting.P_ROTATE_MULTIPLE * timeInterval;
        this.lastRotateTime = nowTime;

        // Global.speedRatio = nowSpeed / Global.initSpeed;
    }
}


// ============================ 方法定义


// ============================ 立即执行

