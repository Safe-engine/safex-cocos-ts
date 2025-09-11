import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { BaseComponentProps, ComponentX, GameWorld, NodeComp, render } from '..'
import { PixiSpineSprite } from './PixiSpineSprite'

export interface SpineData {
  atlas: string
  skeleton: string
  texture?: string
}

interface SpineSkeletonProps {
  data: SpineData
  skin?: string
  animation?: string
  timeScale?: number
  loop?: boolean
}
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>, PixiSpineSprite> {
  setAnimation(name: string, loop = false) {
    const skel = this.node.instance
    if (skel._armatureDisplay.state.setAnimation) {
      skel._armatureDisplay.state.setAnimation(0, name, loop)
    }
  }

  // setSkeletonData(data: SpineData) {
  //   const skel = this.node.instance
  //   const { atlas, skeleton } = data
  //   skel._armatureDisplay.
  // }
}

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton: EventReceiveCallback<SpineSkeleton> = async ({ entity, component: spineComp }) => {
    const { data, skin, animation, loop = true, timeScale = 1 } = spineComp.props
    const { atlas, skeleton, texture } = data
    // console.log('spineComp', data)
    const node = new PixiSpineSprite({
      skeleton,
      atlas,
      texture,
      animationName: animation,
      loop,
      skin,
      timeScale,
    })
    spineComp.node = entity.assign(new NodeComp(node, entity))
  }
  update(entities: EntityManager) {
    const animations = entities.entities_with_components(SpineSkeleton)
    animations.forEach((ett) => {
      const spine = ett.getComponent(SpineSkeleton)
      if (spine.node && spine.node.active) {
        spine.node.instance.updateTexture()
      }
    })
  }
}
Object.defineProperty(SpineSkeleton.prototype, 'render', { value: render })

export function setupSpine() {
  GameWorld.Instance.addSystemAndUpdate(SpineSystem)
}
export * from './PixiSpineSprite'
