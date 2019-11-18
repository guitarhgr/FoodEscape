import { Constants, TProp, TPoint, TDuadrant } from "./Enum";
import { Global } from "./Global";

/**
 * @module 通用工具
 */

export class Utils {
    /**
     * 获取两点与水平面的角度
     * @param point1 点
     * @param point2 点
     * @returns 两点与水平面的角度
     */
    public static getTowPointerAngle = (point1: TPoint, point2: TPoint) => {
        return Math.atan2((point1.y - point2.y), (point2.x - point1.x)) * (180/Math.PI);
    }

    /**
     * 判断区间
     * @param judgeVal 判断值
     * @param judgeArr 判断的区间
     * @param judgeKey 判断key
     * @returns 区间索引
     */
    public static judgeSection = (judgeVal: number, judgeArr: any[], judgeKey?: string): number => {
        const len = judgeArr.length;

        let left = 0;
        let right = len - 1;

        while(left <= right) {
            const center = Math.floor((left+right)/2);
            const centerVal = judgeKey ? judgeArr[center][judgeKey] : judgeArr[center];

            if (judgeVal < centerVal) {
                right = center - 1;
            } else {
                left = center + 1;
            }
        }

        return right;
    }

    /**
     * 角度转换
     * @param angle 角度
     * @param isPositive 是否是正向角度
     * @returns 转换后的角度
     */
    public static convertAngle = (angle: number, isPositive: boolean = true): number => {
        let tempAngle: number;

        angle = angle % 360;

        if (isPositive) {
            tempAngle = angle < 0 ?  360 + angle : angle;
        } else {
            tempAngle = angle > 0 ? -360 + angle : angle;
        }

        return tempAngle;
    }

    /**
     * 判断角度象限
     * @param 角度
     * @returns 象限 0: 坐标轴 1,2,3,4对应象限
     */
    public static judgeAngleQuadrant = (angle: number): TDuadrant => {
        let duadrant: TDuadrant;

        angle = Utils.convertAngle(angle);

        if (angle === 0 || angle === 90 || angle === 180 || angle === 270) {
            duadrant = 0;
        } else {
            duadrant = ((Utils.judgeSection(angle, [0, 90, 180, 270]) + 1) as TDuadrant);
        }

        return duadrant;
    }

    /**
     * 获取旋转角度
     * @returns 旋转角度
     */
    public static getRotateAngle = (angle: number):number => {
        angle = Utils.convertAngle(angle);

        return (Math.floor(angle / 90) - 1) * 90 + angle % 90;
    }

    /**
     * 首字母大写
     */
    public static FirstWordToUpperCase = (words: string):string => {
        return words.charAt(0).toUpperCase() + words.slice(1);
    }

    /**
     * 节点旋转
     * @param 节点持续时间
     */
    public static nodeRotateBy = (node: cc.Node, duration: number = 2, angle: number = 360) => {
        const repeatRotateBy = cc.repeatForever(cc.rotateBy(duration, angle));

        node.runAction(repeatRotateBy);
    }

    /**
    * 平分角度
    * @param 角度1
    * @param 角度2
    * @returns 每份角度
    */
    public static divideAngle = (angle1: number, angle2: number, partNum: number): number => {
        return Math.abs(Math.abs(angle1) - Math.abs(angle2)) / Constants.INIT_DISTANCE;
    }

    /**
     * 获取一定范围内的随机整数
     * @param min
     * @param max
     * @returns {number}
     */
    public static getRangeRandom = (min: number, max: number): number => {
        return Math.floor(min + Math.random() * (max - min))
    }
}

/**
 * @TODO 对象池 后面没有变动可以把这几个方法合成一个
 */
export class Factory {
    /**创建距离道具角度 */
    static createDistPropAngle: number = null;
    /**创建其它道具时间 */
    static createOtherPropTime: number = null;

    /**
     * 判断加大距离道具
     */
    static judgeAddDistProp = (nowAngle: number) => {
        const gapAngle = Global.meterPerAngle * Constants.EVERY_GAP_RANGE;
        const multiple = Math.floor(nowAngle/gapAngle);

        if (!Factory.createDistPropAngle) {
            Factory.createDistPropAngle = Utils.getRangeRandom(multiple*gapAngle, (multiple+1)*gapAngle);

            return false;
        }

        if (Factory.createDistPropAngle && nowAngle < Factory.createDistPropAngle) {
            return false;
        }

        Factory.createDistPropAngle = Utils.getRangeRandom((multiple+1)*gapAngle, (multiple+2)*gapAngle);

        return true;
    }

    /**
     * 判断其它道具
     */
    static judgeOtherProp = (startTime: number) => {
        const timeLength = (Date.now()-startTime) / 1000;
        const multiple = Math.floor(timeLength/Constants.EVERY_TIME_RANGE);

        if (!Factory.createOtherPropTime) {
            Factory.createOtherPropTime = Utils.getRangeRandom(multiple*Constants.EVERY_TIME_RANGE, (multiple+1)*Constants.EVERY_TIME_RANGE);
            // console.log(`%c time:: ${Factory.createOtherPropTime}`, 'background: pink;');
            return false;
        }

        if (Factory.createOtherPropTime && timeLength < Factory.createOtherPropTime) {
            return false;
        }

        Factory.createOtherPropTime = Utils.getRangeRandom((multiple+1)*Constants.EVERY_TIME_RANGE, (multiple+2)*Constants.EVERY_TIME_RANGE);

        // console.log(`%c time:: ${Factory.createOtherPropTime}`, 'background: pink;');

        return true;
    }

    /**
     * 生产道具
     */
    static produceProp = (preFab: cc.Prefab, parent: cc.Node, propType: TProp, radius: number) => {
        // TODO 这里应该用缓冲池
        const prop: cc.Node = cc.instantiate(preFab);

        const ownAngle = Utils.convertAngle(Constants.SECTOR_LEVLE_ANGLE- parent.angle);
        const x = Math.cos(ownAngle * Math.PI / 180) * radius;
        const y = Math.sin(ownAngle * Math.PI / 180) * radius;

        // surface的中心点就在中间 而且原点与圆点与中心点重合故可以这样计算坐标
        prop.getComponent('Prop').init(x, y, ownAngle, propType);

        parent.addChild(prop);

        return prop;
    }

    /**
     * 生产加大距离道具
     */
    static produceAddDistProp = (preFab: cc.Prefab, parent: cc.Node): cc.Node => {
        if (!Factory.judgeAddDistProp(parent.angle)) return;

        return Factory.produceProp(preFab, parent, 'addDist', Constants.SECOND_RADIUS);
    }

    /**
     * 生产其它道具
     */
    static produceOtherProp = (preFab: cc.Prefab, parent: cc.Node): cc.Node => {
        if (!Factory.judgeOtherProp(Global.mainGame.startRotateTime)) return;

        return Factory.produceProp(preFab, parent, 'magnet', Constants.THIRD_RADIUS);
    }
    

    /**
     * 生产玩家
     * @param 预制体
     * @parent 父节点
     */
    static producePlayer = (preFab: cc.Prefab, parent: cc.Node): cc.Node => {
        const player = cc.instantiate(preFab);

        parent.addChild(player);

        return player;
    }

    /**
     * 生产敌人
     * @param 预制体
     * @parent 父节点
     */
    static produceEnemy = (preFab: cc.Prefab, parent: cc.Node): cc.Node => {
        const enemy = cc.instantiate(preFab);

        parent.addChild(enemy);

        return enemy;
    }

    /**
     * 生产障碍
     */
    static produceObstacle = (preFab: cc.Prefab, parent: cc.Node): cc.Node => {
        // TODO 这里应该用缓冲池
        const obstacle: cc.Node = cc.instantiate(preFab);

        const ownAngle = Utils.convertAngle(Constants.SECTOR_LEVLE_ANGLE-parent.angle);
        const x = Math.cos(ownAngle * Math.PI / 180) * Constants.FIRST_RADIUS;
        const y = Math.sin(ownAngle * Math.PI / 180) * Constants.FIRST_RADIUS;

        // surface的中心点就在中间 而且原点与圆点与中心点重合故可以这样计算坐标
        obstacle.getComponent('Obstacle').init(x, y, ownAngle, 'obstacle');

        parent.addChild(obstacle);

        return obstacle;
    }
}