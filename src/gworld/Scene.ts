import { GameWorld } from '.'
import { EnhancedComponent } from './EnhancedComponent'
import { NodeComp } from './NodeComp'

export class SceneComponent extends EnhancedComponent {
  render() {
    const world = GameWorld.Instance
    world.entities.reset()
    const root = world.entities.create()
    const node = root.assign(new NodeComp(cc.director.getRunningScene(), root))
    const sceneComponent = root.assign(this)
    sceneComponent.node = node
    return sceneComponent
  }
}
