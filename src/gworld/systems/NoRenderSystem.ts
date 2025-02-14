import { ComponentAddedEvent, ComponentRemovedEvent, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'

import { Touch } from '../../polyfills'
import { NodeComp } from '../components/NodeComp'
import { ExtraDataComp, TouchEventRegister } from '../components/NoRenderComponent'

export class NoRenderSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(ExtraDataComp), this)
    event_manager.subscribe(ComponentAddedEvent(TouchEventRegister), this)
    event_manager.subscribe(ComponentRemovedEvent(TouchEventRegister), this)
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(TouchEventRegister): {
        // console.log('TouchEventRegister', event)
        const ett = event.entity
        const touchComp = event.component as TouchEventRegister
        const nodeComp = ett.getComponent(NodeComp)
        touchComp.node = nodeComp
        touchComp.listener = cc.eventManager.addListener(
          {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch: Touch) {
              const { onTouchStart } = touchComp.props
              // console.log('onTouchBegan', onTouchStart)
              if (!nodeComp.parent) {
                if (onTouchStart) {
                  onTouchStart(touch, nodeComp)
                }
                return true
              }
              const p = touch.getLocation()
              const rect = nodeComp.getBoundingBox()
              const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
              if (rect.contains(nodeSpaceLocation)) {
                if (onTouchStart) {
                  onTouchStart(touch, nodeComp)
                }
                return true
              }
            },
            onTouchMoved: function (touch) {
              const { onTouchMove } = touchComp.props
              if (!onTouchMove) return false
              onTouchMove(touch, nodeComp)
              return true
            },
            onTouchEnded: function (touch) {
              const { onTouchEnd } = touchComp.props
              if (!onTouchEnd) return false
              onTouchEnd(touch, nodeComp)
              return true
            },
            onTouchCancelled: function (touch) {
              const { onTouchCancel } = touchComp.props
              if (!onTouchCancel) return false
              onTouchCancel(touch, nodeComp)
              return true
            },
          },
          nodeComp.instance,
        )
        break
      }

      case ComponentRemovedEvent(TouchEventRegister): {
        console.log('ComponentRemovedEvent TouchEventRegister', event)
        // const ett = event.entity
        // const nodeComp = ett.getComponent(NodeComp)
        const touchComp = event.component as TouchEventRegister
        delete touchComp.touch
        cc.eventManager.removeListener(touchComp.listener)
        break
      }
      case ComponentAddedEvent(ExtraDataComp): {
        const extra = event.component as ExtraDataComp
        const { key, value } = extra.props
        extra.data[key] = value
        break
      }
      default:
        break
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
