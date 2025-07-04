type Float = number
type Integer = number
declare let dragonBones: any
declare let PIXI: any

declare namespace cc {
  interface RunOptions {
    debugMode: 1 | 0
    showFPS: boolean
    frameRate: number
    id: string
    renderMode: 0 | 1 | 2
  }
  declare let v2: (x?: number | any, y?: number) => Vec2
  declare let v3: (x?: number | any, y?: number, z?: number) => Vec3
  declare let instantiate: (id: string) => NodeComp

  declare interface Misc {
    radiansToDegrees(angle: number): number
    degreesToRadians: (angle: number) => number
    clampf: (value: number, min_inclusive: number, max_inclusive: number) => number
    lerp: (a: number, b: number, r: number) => number
  }
  declare interface Macro {
    REPEAT_FOREVER: number
  }
  declare interface TextureCache {
    addImage(texturePath: string): Texture2D
    getTextureForKey(key: string): Texture2D
  }

  declare let misc: Misc
  declare let macro: Macro
  // declare let Vec2: any;
  declare let RigidBodyType: any
  declare let textureCache: TextureCache

  declare namespace Event {
    interface EventTouch {
      getLocation(): cc.Vec2
      getLocationX(): number
      getLocationY(): number
      getDelta(): cc.Vec2
      getDeltaX(): number
      getDeltaY(): number
    }
  }
  // declare function Vec2(x?: number, y?: number): Vec2;
  declare class Vec2 extends Point {
    x: number
    y: number
    static ZERO: Vec2
    constructor(x?: number, y?: number)
    equals(lastPos: Vec2): boolean
    add(value: cc.Point): cc.Vec2
    addSelf(value: cc.Point): cc.Vec2
    sub(value: cc.Point): cc.Vec2
    mul(multiply: number): cc.Vec2
    mulSelf(multiply: number): cc.Vec2
    mag(): number
    normalizeSelf(): cc.Vec2
    normalize(): cc.Vec2
    public signAngle(other: Vec2)
  }

  export class Vec3 extends Vec2 {}
  export class ParticleSystem extends Node {
    constructor(file: string)
  }
}
