import { GameWorld, Vec2 } from '..'
import { PhysicsSystem } from './PhysicsSystem'

export * from './PhysicsComponent'
export * from './PhysicsSprite'
export * from './PhysicsSystem'

export function setupPhysics(world = GameWorld.Instance, isDebugDraw = false, gravity = Vec2(0, -98)) {
  const physicsSystem = world.addSystemAndUpdate(PhysicsSystem)
  if (isDebugDraw) {
    physicsSystem.addDebug()
  }
  physicsSystem.space.gravity = gravity
}
