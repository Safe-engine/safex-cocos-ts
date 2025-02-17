import { Color4B, NodeComp } from '../src'

type ColorSource = ReturnType<typeof Color4B>

interface BaseComponentProps {
  $ref?: unknown
  $refNode?: NodeComp<any>
  $push?: unknown[]
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

interface ScrollViewProps {
  width: number
  height: number
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

interface DragonBonesData {
  atlas: string
  skeleton: string
  texture: string
}
interface DragonBonesProps {
  data: DragonBonesData
  skin?: string
  animation?: string
  playTimes?: number
  timeScale?: number
  onAnimationStart?: (event: { name: string }) => void
  onAnimationEnd?: (event: { name: string }) => void
  onAnimationComplete?: (event: { name: string }) => void
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
