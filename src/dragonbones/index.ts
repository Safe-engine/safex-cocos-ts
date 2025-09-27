import { GameWorld } from '../gworld'
import { DragonBonesSystem } from './DragonBonesSystem'

export * from './DragonBonesComp'
export * from './PixiDragonBonesSprite'

export function setupDragonBones() {
  GameWorld.Instance.addSystemAndUpdate(DragonBonesSystem)
}
