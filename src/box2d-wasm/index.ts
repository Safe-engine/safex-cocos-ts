import { GameWorld } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(world = GameWorld.Instance) {
  world.systems.add(PhysicsSystem)
  world.systems.configureOnce(PhysicsSystem)
  world.listUpdate.push(PhysicsSystem)
}
