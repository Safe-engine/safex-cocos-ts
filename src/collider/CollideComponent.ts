import { BaseComponentProps } from '..'
import { ComponentX } from '../core/decorator'
import { getMax, getMin } from '../helper/math'
import { Vec2 } from '../polyfills'

function getNodeToWorldTransformAR(node) {
  const t = node.instance.getNodeToWorldTransform()
  const anchorPointSize = node.instance.getAnchorPointInPoints()
  const transform = cc.affineTransformTranslate(t, anchorPointSize.x, anchorPointSize.y)
  return transform
}

function cloneRect(origin) {
  return cc.rect(origin.x, origin.y, origin.width, origin.height)
}
interface ColliderProps extends BaseComponentProps<Collider> {
  tag?: number
  offset?: [number, number]
  onCollisionEnter?: (other: Collider) => void
  onCollisionExit?: (other: Collider) => void
  onCollisionStay?: (other: Collider) => void
}
export class Collider<T = ColliderProps> extends ComponentX<T> {
  _worldPoints: cc.Vec2[] | cc.Point[] = []
  _worldPosition: cc.Vec2 | cc.Point
  _worldRadius
  _AABB: cc.Rect = cc.rect(0, 0, 0, 0)
  _preAabb: cc.Rect = cc.rect(0, 0, 0, 0)

  // update(dt: number, draw?: cc.DrawNode) {}
  getAABB() {
    const collider = this.getComponent(Collider)
    if (collider) return collider._AABB
    return this._AABB
  }
  get world() {
    return {
      points: this._worldPoints,
      preAabb: this._preAabb,
    }
  }
}

interface BoxColliderProps extends BaseComponentProps<BoxCollider> {
  width: number
  height: number
}
export class BoxCollider extends Collider<ColliderProps & BoxColliderProps> {
  get size() {
    return cc.size(this.props.width, this.props.height)
  }

  set size(s: cc.Size) {
    this.props.width = s.width
    this.props.height = s.height
  }

  update(dt, draw: cc.DrawNode) {
    if (!this.node) {
      return
    }
    // const collider = this.getComponent(Collider)
    const { height, width, offset = [0, 0] } = this.props
    const [x, y] = offset
    const hw = width * 0.5
    const hh = height * 0.5
    const transform = getNodeToWorldTransformAR(this.node)
    const rect = cc.rect(x - hw, y - hh, width, height)
    const rectTrs = cc.rectApplyAffineTransform(rect, transform)
    // cc.log(rectTrs);
    this._worldPoints[0] = Vec2(rectTrs.x, rectTrs.y)
    this._worldPoints[1] = Vec2(rectTrs.x, rectTrs.y + rectTrs.height)
    this._worldPoints[2] = Vec2(rectTrs.x + rectTrs.width, rectTrs.y + rectTrs.height)
    this._worldPoints[3] = Vec2(rectTrs.x + rectTrs.width, rectTrs.y)

    const listX = this._worldPoints.map(({ x }) => x)
    const listY = this._worldPoints.map(({ y }) => y)
    this._preAabb = cloneRect(this._AABB)
    this._AABB.x = getMin(listX)
    this._AABB.y = getMin(listY)
    this._AABB.width = getMax(listX) - this._AABB.x
    this._AABB.height = getMax(listY) - this._AABB.y
    if (draw) {
      draw.drawPoly(this._worldPoints, null, 3, cc.Color.DEBUG_BORDER_COLOR)
    }
  }
}

interface CircleColliderProps extends BaseComponentProps<CircleCollider> {
  radius: number
}
export class CircleCollider extends Collider<ColliderProps & CircleColliderProps> {
  update(dt, draw: cc.DrawNode) {
    if (!this.node) {
      return
    }
    const transform = getNodeToWorldTransformAR(this.node)
    // const collider = this.getComponent(Collider)
    const { radius, offset = [0, 0] } = this.props
    const [x, y] = offset
    this._worldRadius = radius * this.node.scale
    this._worldPosition = cc.pointApplyAffineTransform(cc.p(x, y), transform)
    if (draw) {
      draw.drawDot(this._worldPosition, this._worldRadius, cc.Color.DEBUG_FILL_COLOR)
      draw.drawCircle(this._worldPosition, this._worldRadius, 0, 64, true, 3, cc.Color.DEBUG_BORDER_COLOR)
    }
    this._preAabb = cloneRect(this._AABB)
    this._AABB.x = this._worldPosition.x - this._worldRadius
    this._AABB.y = this._worldPosition.y - this._worldRadius
    this._AABB.width = this._worldRadius * 2
    this._AABB.height = this._AABB.width
    // draw.drawRect(cc.p(this._AABB.x, this._AABB.y),
    //   cc.p(this._worldPosition.x + this._worldRadius, this._worldPosition.y + this._worldRadius),
    //   cc.Color.WHITE, 3, cc.Color.DEBUG_BORDER_COLOR);
  }
}

interface PolygonColliderProps extends BaseComponentProps<PolygonCollider> {
  points: Array<Vec2>
}

export class PolygonCollider extends Collider<ColliderProps & PolygonColliderProps> {
  get points(): Vec2[] {
    const [x, y] = this.props.offset || [0, 0]
    const pointsList = this.props.points.map((p) => Vec2(p.x + x, p.y + y))
    return pointsList
  }

  set points(points: Vec2[]) {
    this.props.points = points
  }

  update(dt, draw: cc.DrawNode) {
    if (!this.node) {
      return
    }
    const transform = getNodeToWorldTransformAR(this.node)
    // const collider = this.getComponent(Collider)
    this._worldPoints = this.points.map((p) => cc.pointApplyAffineTransform(p, transform))
    // cc.log(polyPoints);
    if (draw) {
      draw.drawPoly(this._worldPoints, cc.Color.DEBUG_FILL_COLOR, 3, cc.Color.DEBUG_BORDER_COLOR)
    }
    const listX = this._worldPoints.map(({ x }) => x)
    const listY = this._worldPoints.map(({ y }) => y)
    this._preAabb = cloneRect(this._AABB)
    this._AABB.x = getMin(listX)
    this._AABB.y = getMin(listY)
    this._AABB.width = getMax(listX) - this._AABB.x
    this._AABB.height = getMax(listY) - this._AABB.y
    // draw.drawRect(cc.p(this._AABB.x, this._AABB.y), cc.p(max(listX), max(listY)),
    // cc.Color.WHITE, 3, cc.Color.DEBUG_BORDER_COLOR);
  }
}

export enum CollisionType {
  NONE,
  ENTER,
  STAY,
  EXIT,
}

function isPolygonCollider(col: Collider) {
  return col.getComponent(PolygonCollider) || col.getComponent(BoxCollider)
}
function isCircleCollider(col: Collider) {
  return col.getComponent(CircleCollider)
}

export class Contract {
  _collider1: Collider
  _collider2: Collider
  _touching: boolean
  _isPolygonPolygon: boolean
  _isCircleCircle: boolean
  _isPolygonCircle: boolean

  constructor(collider1: Collider, collider2: Collider) {
    this._collider1 = collider1
    this._collider2 = collider2
    const isCollider1Polygon = isPolygonCollider(collider1)
    const isCollider2Polygon = isPolygonCollider(collider2)
    const isCollider1Circle = isCircleCollider(collider1)
    const isCollider2Circle = isCircleCollider(collider2)

    if (isCollider1Polygon && isCollider2Polygon) {
      this._isPolygonPolygon = true
    } else if (isCollider1Circle && isCollider2Circle) {
      this._isCircleCircle = true
    } else if (isCollider1Polygon && isCollider2Circle) {
      this._isPolygonCircle = true
    } else if (isCollider1Circle && isCollider2Polygon) {
      this._isPolygonCircle = true
      this._collider1 = collider2
      this._collider2 = collider1
    }
    // cc.log(this._isPolygonPolygon);
  }

  updateState() {
    const result = this.test()
    let type = CollisionType.NONE
    if (result && !this._touching) {
      this._touching = true
      type = CollisionType.ENTER
    } else if (result && this._touching) {
      type = CollisionType.STAY
    } else if (!result && this._touching) {
      this._touching = false
      type = CollisionType.EXIT
    }
    return type
  }

  test() {
    // if (!shouldCollider(this._collider1, this._collider2)) {
    //   return false;
    // }
    // cc.log(this._collider1.getAABB(), this._collider2.getAABB());
    if (!cc.rectIntersectsRect(this._collider1.getAABB(), this._collider2.getAABB())) {
      return false
    }

    if (this._isPolygonPolygon) {
      return cc.Intersection.polygonPolygon(this._collider1._worldPoints, this._collider2._worldPoints)
    }
    if (this._isCircleCircle) {
      const p1 = this._collider1
      const p2 = this._collider2
      return cc.Intersection.circleCircle(p1._worldPosition, p1._worldRadius, p2._worldPosition, p2._worldRadius)
    }

    if (this._isPolygonCircle) {
      const p2 = this._collider2
      return cc.Intersection.polygonCircle(this._collider1._worldPoints, p2._worldPosition, p2._worldRadius)
    }

    return false
  }
}
