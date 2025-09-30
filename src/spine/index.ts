import { GameWorld } from '..'
import { SpineSystem } from './SpineSystem'

export * from './SpineSkeleton'

export function setupSpine() {
  GameWorld.Instance.systems.addThenConfigure(SpineSystem)
}
