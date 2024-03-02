interface Window {
  oipfObjectFactory: any
  messaging: any
  FBInstant: any
}

declare let __API_HOST__: string

declare type Float = number
declare type float = number
declare type int = number
declare type bool = boolean
declare type Integer = number
declare type Destructor = any
declare type ComponentEvent = any
declare type BulletArray = Array<Obstacle>

declare namespace cc {
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

  export class Vec3 extends Vec2 { }
  export class ParticleSystem extends Node {
    constructor(file: string)
  }
}
