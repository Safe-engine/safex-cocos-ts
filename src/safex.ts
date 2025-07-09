import { Color4B, NodeComp } from '.'

export type ColorSource = ReturnType<typeof Color4B>

export interface BaseComponentProps<T> {
  $ref?: T
  $push?: T[]
  $refNode?: NodeComp
  $pushNode?: NodeComp[]
  node?: Partial<NodeComp>
  // [$key: `$${string}`]: string
}

// interface LoadingBarProps {}

// interface PhysicsMaterialProps {
//   friction?: number
//   restitution?: number
//   density?: number
// }

// interface ColliderPhysicsProps {
//   tag?: number
//   group?: number
//   offset?: Vec2
//   onCollisionEnter?: (other: Collider) => void
//   onCollisionExit?: (other: Collider) => void
//   onCollisionStay?: (other: Collider) => void
// }

// interface BoxColliderPhysicsProps {
//   width: number
//   height: number
// }

// interface CircleColliderPhysicsProps {
//   radius: number
// }

// interface PolygonColliderPhysicsProps {
//   points: Array<Vec2>
// }
