import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { BaseComponentProps, ComponentX, GameWorld, NodeComp } from '..'
import { SkeletonAnimation } from './CCSkeletonAnimation'

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
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>, SkeletonAnimation> {
  setAnimation(name: string, loop = false) {
    const skel = this.node.instance
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop)
    }
  }

  setSkeletonData(data: SpineData) {
    const skel = this.node.instance
    const { atlas, skeleton } = data
    skel.initWithArgs(skeleton, atlas)
  }
}

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton: EventReceiveCallback<SpineSkeleton> = ({ entity, component: spineComp }) => {
    const { data, skin, animation, loop = true, timeScale = 1 } = spineComp.props
    const { atlas, skeleton } = data
    // console.log('spineComp', spineComp)
    const node = SkeletonAnimation.createWithJsonFile(skeleton, atlas, timeScale)
    if (skin) {
      node.setSkin(skin)
    }
    if (animation) {
      node.setAnimation(0, animation, loop)
    }
    spineComp.node = entity.assign(new NodeComp(node, entity))
  }
  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}

export function setupSpine() {
  GameWorld.Instance.systems.add(SpineSystem)
  // GameWorld.Instance.listUpdate.push(SpineSystem)
  GameWorld.Instance.systems.configureOnce(SpineSystem)
}
