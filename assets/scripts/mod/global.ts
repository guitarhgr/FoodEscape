import { EMsg } from "./enum";
import { AutoCounter } from "./counter";

/**
 * @class 发射器
 */
class Emitter {
    private _funcTable: Object = {};

    /**
     * 注册
     * @param obj 
     */
    public register(obj: Object) {
        for (let key in obj) {

            if (!this._funcTable[key]) {
                this._funcTable[key] = [];
            }

            this._funcTable[key].push(obj[key]);
        }
    }

    /**
     * 分发
     */
    public dispatch(key: string, data?: any) {
        const funcArr: Function[] = this._funcTable[key];

        if (!funcArr) return;

        funcArr.forEach(func => {
            func && func(data);
        });
    }

    /**
     * 移除
     * @param func 
     */
    public remove(key: string, func?: Function) {
        const funcArr: Function[] = this._funcTable[key];

        if (!funcArr || !funcArr.length) return;

        if (!func) {
            delete this._funcTable[key];
            return;
        }

        const funcIdx = funcArr.indexOf(func);

        if (funcIdx >= 0) {
            funcArr.splice(funcIdx, 1);
        }
    }
}

/**
 * @class 缓冲
 */
class Cache<T> {
    /**缓冲列表 */
    private _list: T[] = [];
    /**最大缓冲大小 */
    private _maxCacheSize: number = 50;

    constructor(maxCacheSize: number = 50) {
        this._maxCacheSize = maxCacheSize;
    }

    /**
     * 获取
     */
    get(): T {
        return this._list.shift()
    }

    /**
     * 推入
     * @param data 缓冲数据
     */
    put(data: T): boolean {

        if (this._list.length > this._maxCacheSize) return false;

        this._list.push(data);

        return true;
    }

    /**
     * 获取当前缓冲大小
     */
    size(): number {
        return this._list.length;
    }

    /**
     * 清空缓冲区
     */
    clear() {
        this._list = [];
        this._maxCacheSize = 50;
    }
}

/**
 * 全局变量
 */
export const Global = {
    // ============== 预制体
    adsPF: (null as cc.Prefab),
    // ============== 预制体
    
    language: 'zh',

    /**主游戏上下文 */
    mainGame: null,
    /**发射器 */
    emitter: new Emitter(),
    /**自动计数器 */
    autoCounter: new AutoCounter(),
    /**
     * 米/度
     */
    _meterPerAngle: 0,

    get meterPerAngle(): number {
        return this._meterPerAngle;
    },
    set meterPerAngle(val: number) {
        this._meterPerAngle = val;
    },

    /**
     * 初始速度
     */
    _initSpeed: 40,

    get initSpeed(): number {
        return this._initSpeed;
    },
    set initSpeed(val: number) {
        if (val !== this._initSpeed) {
            this._initSpeed = val;
        }
    },

    /**
     * 当前速度
     */
    nowSpeed: 40,

    /**
     * 速度比例
     */
    _speedRatio: 1,

    get speedRatio(): number {
        return this._speedRatio;
    },
    set speedRatio(val: number) {
        if (this._speedRatio !== val) {
            this._speedRatio = val;

            this.emitter.dispatch(EMsg.SPEED_CHANGE);
        }
    },


    /**
     * 分数
     */
    score: 0,

    // get score(): number {
    //     return this._score;
    // },

    // set score(val: number) {
    //     this._score = val;
    //     this.emitter.dispatch(EMsg.SCORE_CHANGE);
    // },


    /**所有图片集列表 */
    spriteAtlasMap: new Map<string, cc.SpriteAtlas>(),
    config: {},

    /**距离 */
    distance: 0,

    /**磁性持续时间 */
    magneticDuration: 0,

    /**护盾持续时间 */
    shieldDuration: 0,

    /**创建的道具 */
    createProps: ({} as Object),

    /**已复活次数 */
    revivedTimes: 0,

    /**金币产出机器 */
    goldMachine: null,

};

Global.emitter.register({
    [EMsg.GAME_START]: () => {
        Global.mainGame = null;
        Global.initSpeed = 40;
        Global.nowSpeed = 40;
        Global.speedRatio = 1;
        Global.distance = 0;
        Global.magneticDuration = 0;
        Global.shieldDuration = 0;
        Global.createProps = {};
        Global.revivedTimes = 0;
        Global.score = 0;
    }
});

(window as any)._game = (window as any)._game || {};
(window as any)._game.global = Global;