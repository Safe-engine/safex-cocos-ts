import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

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
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>> {

  setAnimation(name: string, loop = false) {
    const skel: any = this.node.instance
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop)
    }
  }

  setSkeletonData(data: string) {
    const skel: any = this.node.instance
    const atlas = data.replace('.json', '.atlas')
    skel.initWithArgs(data, atlas, this.node.scale)
  }
}

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton = ({ entity }) => {
    const spineComp = entity.getComponent(SpineSkeleton)
    const { data, skin, animation, loop, timeScale = 1 } = spineComp.props
    const { atlas, skeleton } = data
    // cc.log(skel, atlas);
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
