import { GameWorld, Vec2 } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(world = GameWorld.Instance, isDebugDraw?: boolean, gravity?: Vec2) {
  world.systems.add(PhysicsSystem)
  world.systems.configureOnce(PhysicsSystem)
  world.listUpdate.push(PhysicsSystem)
  if (isDebugDraw) {
    world.systems.get(PhysicsSystem).addDebug()
  }
  if (gravity) {
    world.systems.get(PhysicsSystem).gravity = gravity
  }
}
