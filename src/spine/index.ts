import { GameWorld } from '..'
import { SpineSystem } from './SpineSystem'

export * from './PixiSpineSprite'
export * from './SpineSkeleton'

export function setupSpine() {
  GameWorld.Instance.addSystemAndUpdate(SpineSystem)
}
