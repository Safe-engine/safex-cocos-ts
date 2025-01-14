import { GameWorld } from './gworld'
import { CollideSystem } from './gworld/systems/CollideSystem'
import { GUISystem } from './gworld/systems/GUISystem'
import { NoRenderSystem } from './gworld/systems/NoRenderSystem'
import { RenderSystem } from './gworld/systems/RenderSystem'
import { setWinSize } from './polyfills'

export function initWorld() {
  setWinSize(cc.director.getWinSize())
  GameWorld.Instance.systems.add(RenderSystem)
  // GameWorld.Instance.systems.add(PhysicsSystem)
  GameWorld.Instance.systems.add(CollideSystem)
  GameWorld.Instance.systems.add(GUISystem)
  GameWorld.Instance.systems.add(NoRenderSystem)
  // GameWorld.Instance.listUpdate.push(PhysicsSystem)
  GameWorld.Instance.listUpdate.push(CollideSystem)
  GameWorld.Instance.systems.configureOnce(RenderSystem)
  // GameWorld.Instance.systems.configureOnce(PhysicsSystem)
  GameWorld.Instance.systems.configureOnce(CollideSystem)
  GameWorld.Instance.systems.configureOnce(GUISystem)
  GameWorld.Instance.systems.configureOnce(NoRenderSystem)
}
