import { ComponentAddedEvent, ComponentRemovedEvent, Constructor, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'
import { CollideSystem, Collider, ComponentX, NodeComp } from '..'
import { GameWorld } from '../gworld'

export function registerSystemFnc<T extends ComponentX>(component: Constructor<T>) {
  if (GameWorld.Instance.systems.isRegistered(`${component.name}System`)) {
    return
  }
  class NewSystem implements System {
    configure(event_manager: EventManager) {
      console.log('configure registerSystem', component.name)
      event_manager.subscribe(ComponentAddedEvent(component), this)
      event_manager.subscribe(ComponentRemovedEvent(component), this)
    }

    receive(type: string, event: EventReceive) {
      switch (type) {
        case ComponentAddedEvent(component): {
          const ett = event.entity
          const newComp = event.component as any
          newComp.node = ett.getComponent(NodeComp)
          break
        }
        case ComponentRemovedEvent(component): {
          const newComp = event.component as any
          if (newComp.destroy) {
            newComp.destroy()
          }
          break
        }
        default:
          break
      }
    }
    update(entities: EntityManager, events: EventManager, dt: number) {
      for (const entt of entities.entities_with_components(component)) {
        const comp = entt.getComponent(component)
        // console.log('comp', comp.constructor.name, typeof comp['update'] === 'function')
        if (comp.node.active && typeof comp['update'] === 'function') {
          comp['update'](dt)
        }
      }
    }
  }
  Object.defineProperty(NewSystem, 'name', { value: `${component.name}System` })
  GameWorld.Instance.systems.add(NewSystem)
  GameWorld.Instance.systems.configureOnce(NewSystem)
  GameWorld.Instance.listUpdate.push(NewSystem)
  return NewSystem
}

export function instantiate<T>(ComponentType: Constructor<T>, data?: any): T {
  return (ComponentType as any).create(data)
}

export function shouldCollider(colA: Collider, colB: Collider) {
  const groupA = colA.node.group
  const groupB = colB.node.group
  if (groupA === undefined || groupB === undefined) {
    return true
  }
  const { colliderMatrix } = GameWorld.Instance.systems.get(CollideSystem)
  return colliderMatrix[groupA][groupB]
}
