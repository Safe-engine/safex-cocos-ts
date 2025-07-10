import { GameWorld } from '../gworld'
import { AnimationSystem } from './AnimationSystem'

export function setupAnimation() {
  GameWorld.Instance.systems.add(AnimationSystem)
  GameWorld.Instance.listUpdate.push(AnimationSystem)
  GameWorld.Instance.systems.configureOnce(AnimationSystem)
}
