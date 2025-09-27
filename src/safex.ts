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
