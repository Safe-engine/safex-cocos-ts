import { GameWorld } from '../gworld'
import { CollideSystem } from './CollideSystem'

export function setupCollider() {
  GameWorld.Instance.systems.add(CollideSystem)
  GameWorld.Instance.listUpdate.push(CollideSystem)
  GameWorld.Instance.systems.configureOnce(CollideSystem)
}
