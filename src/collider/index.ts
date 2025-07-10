import { GameWorld } from '../gworld'
import { CollideSystem } from './CollideSystem'

export function setupCollider(colliderMatrix?, debug = false) {
  GameWorld.Instance.systems.add(CollideSystem)
  GameWorld.Instance.listUpdate.push(CollideSystem)
  GameWorld.Instance.systems.configureOnce(CollideSystem)
  const collideSystem = GameWorld.Instance.systems.get(CollideSystem)
  if (colliderMatrix) {
    collideSystem.colliderMatrix = colliderMatrix
  }
  collideSystem.toggleDebugDraw(debug)
}
