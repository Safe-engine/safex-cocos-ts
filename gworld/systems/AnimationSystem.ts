import { ComponentAddedEvent, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'
import { AnimationComp } from '../components/AnimationComponent'
import { NodeComp } from '../components/NodeComp'

export class AnimationSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(AnimationComp), this)
  }
  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(AnimationComp): {
        // cc.log('AnimationComp', event);
        const animation = event.entity.getComponent(AnimationComp)
        animation.node = event.entity.getComponent(NodeComp)
        setTimeout(animation.start.bind(animation), 0)
        break
      }

      default:
        break
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number) {
    const animations = entities.entities_with_components(AnimationComp)
    // cc.log(animations);
    animations.forEach((ett) => {
      const animation = ett.getComponent(AnimationComp)
      if (animation.node && animation.node.active) {
        animation.update(dt)
      }
    })
  }
}
