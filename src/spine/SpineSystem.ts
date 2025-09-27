import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'
import { NodeComp } from '../core/NodeComp'
import { PixiSpineSprite } from './PixiSpineSprite'
import { SpineSkeleton } from './SpineSkeleton'

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton: EventReceiveCallback<SpineSkeleton> = async ({ entity, component: spineComp }) => {
    const { data, skin, animation, loop = true, timeScale = 1 } = spineComp.props
    const { atlas, skeleton, texture } = data
    // console.log('spineComp', data)
    const spine = new PixiSpineSprite({
      skeleton,
      atlas,
      texture,
      animationName: animation,
      loop,
      skin,
      timeScale,
    })
    const node = new cc.Node()
    node.addChild(spine)
    spineComp.spine = spine
    spineComp.node = entity.assign(new NodeComp(node, entity))
  }
  update(entities: EntityManager) {
    const animations = entities.entities_with_components(SpineSkeleton)
    animations.forEach((ett) => {
      const spine = ett.getComponent(SpineSkeleton)
      if (spine.node && spine.node.active) {
        spine.spine.updateTexture()
      }
    })
  }
}
