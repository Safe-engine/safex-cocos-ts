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
}

export class RigidBody extends NoRenderComponentX<RigidBodyProps> {
  body: Box2D.b2Body
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

interface PhysicsMaterialProps {
  friction?: number
  restitution?: number
  density?: number
}
export class PhysicsMaterial extends NoRenderComponentX<PhysicsMaterialProps> {}

interface ColliderPhysicsProps {
  tag?: number
  offset?: Vec2
  onBeginContact?: (other: PhysicsCollider) => void
  onEndContact?: (other: PhysicsCollider) => void
  onPreSolve?: (other: PhysicsCollider, impulse?) => void
  onPostSolve?: (other: PhysicsCollider, oldManifold?) => void
}

export class PhysicsCollider extends NoRenderComponentX<ColliderPhysicsProps & BaseComponentProps<PhysicsCollider>> {
  enabled = true
  instance: PhysicsSprite
}

interface BoxColliderPhysicsProps extends ColliderPhysicsProps {
  width: number
  height: number
}
export class PhysicsBoxCollider extends NoRenderComponentX<BoxColliderPhysicsProps & BaseComponentProps<PhysicsCollider>> {
  // set onCollisionEnter(val) {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   phys1._onCollisionEnter = val
  // }
  // get onCollisionEnter() {
  //   const phys1 = this.getComponent(PhysicsCollider)
  //   return phys1._onCollisionEnter
  // }
}
interface CircleColliderPhysicsProps extends ColliderPhysicsProps {
  radius: number
}
export class PhysicsCircleCollider extends NoRenderComponentX<CircleColliderPhysicsProps & BaseComponentProps<PhysicsCollider>> {}
interface PolygonColliderPhysicsProps extends ColliderPhysicsProps {
  points: Array<Vec2>
}
export class PhysicsPolygonCollider extends NoRenderComponentX<PolygonColliderPhysicsProps & BaseComponentProps<PhysicsCollider>> {}
