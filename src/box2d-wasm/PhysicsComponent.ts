import { NoRenderComponentX } from '../gworld/core/decorator'
import { Vec2 } from '../polyfills'
import { BaseComponentProps } from '../safex'
import { PhysicsSprite } from './PhysicsSprite'

interface RigidBodyProps {
  type?: 0 | 1 | 2 // 0: Static, 1: Kinematic, 2: Dynamic
  density?: Float
  restitution?: Float
  friction?: Float
  gravityScale?: Float
  isSensor?: boolean
  tag?: number
  onBeginContact?: (other: RigidBody) => void
  onEndContact?: (other: RigidBody) => void
  onPreSolve?: (other: RigidBody, impulse?) => void
  onPostSolve?: (other: RigidBody, oldManifold?) => void
}

export class RigidBody extends NoRenderComponentX<RigidBodyProps> {
  body: Box2D.b2Body
  physicSprite: PhysicsSprite
  // set linearVelocity(vel: Vec2) {
  //   if (!this.node) {
  //     return
  //   }
  //   const physics = this.node.instance
  //   if (physics instanceof Sprite) {
  //     physics.getBody().setVel(vel)
  //   }
  // }

  // get linearVelocity() {
  //   if (!this.node) {
  //     return Vec2.ZERO
  //   }
  //   const physics = this.node.instance
  //   const vel = (physics as Sprite).getBody().getVel()
  //   return v2(vel)
  // }
}

interface BoxColliderPhysicsProps {
  width: number
  height: number
  offset?: Vec2
}
export class PhysicsBoxCollider extends NoRenderComponentX<BoxColliderPhysicsProps & BaseComponentProps<PhysicsBoxCollider>> {
  // set onCollisionEnter(val) {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   phys1._onCollisionEnter = val
  // }
  // get onCollisionEnter() {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   return phys1._onCollisionEnter
  // }
}
interface CircleColliderPhysicsProps {
  radius: number
  offset?: Vec2
}
export class PhysicsCircleCollider extends NoRenderComponentX<CircleColliderPhysicsProps & BaseComponentProps<PhysicsCircleCollider>> {}
interface PolygonColliderPhysicsProps {
  points: Array<Vec2> | [number, number][]
  offset?: Vec2
}
export class PhysicsPolygonCollider extends NoRenderComponentX<PolygonColliderPhysicsProps & BaseComponentProps<PhysicsPolygonCollider>> {}
