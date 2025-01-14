import { circleCircle, pointInPolygon, polygonCircle, polygonPolygon } from './helper/Intersection'

function updatePoint(p) {
  const { x, y } = p
  return cc.v2(x, y)
}

class _Vec2 {
  x: number
  y: number
  static ZERO
  constructor(x = 0, y = 0) {
    if (!(this instanceof _Vec2)) {
      return new _Vec2(x, y)
    }
    if (y === undefined) {
      this.x = (x as any).x
      this.y = (x as any).y
    }
    this.x = x
    this.y = y
  }

  equals(other: cc.Vec2) {
    return this.x === other.x && this.y === other.y
  }

  add(value: cc.Point): cc.Vec2 {
    return updatePoint(cc.pAdd(cc.p(this.x, this.y), value))
  }

  addSelf(value: cc.Point): cc.Vec2 {
    const nor = updatePoint(cc.pAdd(cc.p(this.x, this.y), value))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  sub(value: cc.Point): cc.Vec2 {
    return updatePoint(cc.pSub(cc.p(this.x, this.y), value))
  }

  mul(multiply: number): cc.Vec2 {
    return updatePoint(cc.pMult(cc.p(this.x, this.y), multiply))
  }

  mulSelf(multiply: number): cc.Vec2 {
    const nor = updatePoint(cc.pMult(cc.p(this.x, this.y), multiply))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  mag(): number {
    return cc.pLength(cc.p(this.x, this.y))
  }

  normalizeSelf(): cc.Vec2 {
    const nor = updatePoint(cc.pNormalize(cc.p(this.x, this.y)))
    this.x = nor.x
    this.y = nor.y
    return nor
  }

  normalize(): cc.Vec2 {
    return updatePoint(cc.pNormalize(cc.p(this.x, this.y)))
  }

  public cross(other: Vec2) {
    return this.x * other.y - this.y * other.x
  }
  public signAngle(other: Vec2) {
    const angle = this.angle(other)
    return this.cross(other) < 0 ? -angle : angle
  }
  public lengthSqr() {
    return this.x * this.x + this.y * this.y
  }
  public dot(other: Vec2) {
    return this.x * other.x + this.y * other.y
  }
  public angle(other: Vec2) {
    const magSqr1 = this.lengthSqr()
    const magSqr2 = other.lengthSqr()

    if (magSqr1 === 0 || magSqr2 === 0) {
      console.warn('Cant get angle between zero vector')
      return 0.0
    }

    const dot = this.dot(other)
    let theta = dot / Math.sqrt(magSqr1 * magSqr2)
    theta = cc.misc.clampf(theta, -1.0, 1.0)
    return Math.acos(theta)
  }
  public distance(other: _Vec2) {
    return cc.pDistance(this, other)
  }
}
export type Vec2 = _Vec2
export function Vec2(x?: number, y?: number): Vec2 {
  return new _Vec2(x, y)
}
cc.Vec2 = _Vec2
Vec2.ZERO = cc.Vec2.ZERO = Object.freeze(Vec2(0, 0))

export enum SpriteType {
  SIMPLE,
  SLICED,
  TILED,
  FILLED,
  MESH,
}

cc.Color.WHITE = cc.color(255, 255, 255, 255)
cc.Color.BLACK = cc.color(0, 0, 0, 255)
cc.Color.RED = cc.color(255, 0, 0, 255)
cc.Color.GREEN = cc.color(0, 255, 0, 255)
cc.Color.BLUE = cc.color(0, 0, 255, 255)
cc.Color.DEBUG_FILL_COLOR = cc.color(255, 255, 0, 150)
cc.Color.DEBUG_BORDER_COLOR = cc.color(255, 0, 0, 255)
cc.Color.prototype.fromHEX = cc.hexToColor

cc.Intersection = {
  polygonPolygon,
  circleCircle,
  polygonCircle,
  pointInPolygon,
}

export function Color4B(r: number, g: number, b: number, a: number) {
  return cc.color(r, g, b, a)
}
class _Size {
  width: number
  height: number
  static ZERO
  constructor(width = 0, height = 0) {
    if (!(this instanceof _Size)) {
      return new _Size(width, height)
    }
    if (height === undefined) {
      this.width = (width as any).width
      this.height = (width as any).height
    }
    this.width = width
    this.height = height
  }
}

export type Size = _Size
export function Size(x?: number, y?: number): Size {
  return new _Size(x, y)
}

export class Touch extends cc.Touch {
  declare getLocation: () => Vec2
}

export let winSize: Size
export function setWinSize(s: Size) {
  winSize = s
}
