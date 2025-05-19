import { Color4B, NodeComp } from '../src'

type ColorSource = ReturnType<typeof Color4B>

interface RefComp<T> {
  $ref?: T
  $push?: T[]
}
interface BaseComponentProps extends RefComp<unknown> {
  $refNode?: NodeComp
  $pushNode?: NodeComp[]
  node?: Partial<NodeComp>
  // [$key: `$${string}`]: string
}

interface NodeCompProps {
  nodeName?: string
}

interface GraphicsRenderProps {
  lineWidth?: number
  strokeColor?: ColorSource
  fillColor?: ColorSource
}

interface ProgressTimerProps {
  spriteFrame: string
  fillType?: LoadingBarMode
  fillRange?: number
  fillCenter?: Point
  isReverse?: boolean
}

// interface LoadingBarProps {}

interface LabelCompProps {
  font?: string
  string?: string
  size?: number
}

interface LabelOutlineCompProps {
  color: ColorSource
  width: number
}

interface LabelShadowCompProps {
  color: ColorSource
  blur: number
  offset: Point
}

interface SpineData {
  atlas: string
  skeleton: string
  texture?: string
}

interface PhysicsMaterialProps {
  friction?: number
  restitution?: number
  density?: number
}

interface ColliderPhysicsProps {
  tag?: number
  group?: number
  offset?: Vec2
  onCollisionEnter?: (other: Collider) => void
  onCollisionExit?: (other: Collider) => void
  onCollisionStay?: (other: Collider) => void
}

interface BoxColliderPhysicsProps {
  width: number
  height: number
}

interface CircleColliderPhysicsProps {
  radius: number
}

interface PolygonColliderPhysicsProps {
  points: Array<Vec2>
}
