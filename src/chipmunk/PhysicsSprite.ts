import { Vec2 } from '../polyfills'

export class PhysicsSprite {
  node: cc.Node
  physicsBody: cp.Body

  constructor(node: cc.Node, body: cp.Body) {
    this.node = node
    this.physicsBody = body
  }

  update(dt: number) {
    if (!this.physicsBody) {
      return
    }
    // const pos = this.physicsBody.GetPosition()
    // use cc.lerp to smooth the position update
    const pos = Vec2(cc.lerp(this.node.x, this.physicsBody.getPos().x, dt * 10), cc.lerp(this.node.y, this.physicsBody.getPos().y, dt * 10))
    this.node.setPosition(pos.x, pos.y)
    // lerp the rotation
    this.node.setRotation(cc.lerp(this.node.rotation, cc.radiansToDegrees(-this.physicsBody.getAngVel()), dt * 10))
    // this.node.setRotation(cc.radiansToDegrees(this.physicsBody.GetAngle()))
    // this.node.setScale(1 / pixelsPerMeter)
    // this.node.setScale(1 / this.physicsBody.GetFixtureList().GetShape().GetRadius())
  }

  getBody() {
    return this.physicsBody
  }

  set position(val: cp.Vect) {
    this.physicsBody.setPos(val)
  }

  // set x(val) {
  //   this.physicsBody.setPosition(Vec2(val, this.y))
  // }
  // set y(val) {
  //   this.physicsBody.setPosition(Vec2(this.x, val))
  // }

  get x() {
    return this.physicsBody.getPos().x
  }

  get y() {
    return this.physicsBody.getPos().y
  }

  // set angle(val: number) {
  //   this.physicsBody.setAngle(val)
  // }

  get angle() {
    return -this.physicsBody.getAngVel()
  }

  addChild(child: cc.Node) {
    this.node.addChild(child)
  }
}
