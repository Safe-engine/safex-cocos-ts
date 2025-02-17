import { ComponentAddedEvent, ComponentRemovedEvent, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'

import { shouldCollider } from '../../helper/utils'
import { BoxCollider, CircleCollider, Collider, CollisionType, Contract, PolygonCollider } from '../components/CollideComponent'
import { NodeComp } from '../components/NodeComp'

export class CollideSystem implements System {
  listColliders: Collider[] = []
  _contracts: Contract[] = []
  removeColliders = []
  debugGraphics: cc.DrawNode
  enabledDebugDraw = false
  enabled = true
  colliderMatrix = [[true]]

  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(BoxCollider), this)
    event_manager.subscribe(ComponentAddedEvent(CircleCollider), this)
    event_manager.subscribe(ComponentAddedEvent(PolygonCollider), this)
    event_manager.subscribe(ComponentRemovedEvent(BoxCollider), this)
    event_manager.subscribe(ComponentRemovedEvent(CircleCollider), this)
    event_manager.subscribe(ComponentRemovedEvent(PolygonCollider), this)
  }

  receive(type: string, event: EventReceive) {
    const ett = event.entity
    const comp = event.component as Collider

    switch (type) {
      case ComponentAddedEvent(BoxCollider):
      case ComponentAddedEvent(CircleCollider):
      case ComponentAddedEvent(PolygonCollider): {
        // cc.log(type, event)
        const collider = ett.assign(new Collider(comp as any))
        collider.node = ett.getComponent(NodeComp)
        collider.props = comp.props
        // collider.props.enable = true
        comp.node = ett.getComponent(NodeComp)
        this.addCollider(collider)
        break
      }
      case ComponentRemovedEvent(BoxCollider):
      case ComponentRemovedEvent(CircleCollider):
      case ComponentRemovedEvent(PolygonCollider): {
        this.removeColliders.push(comp.getComponent(Collider))
        break
      }
      default:
        break
    }
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (!this.enabled) {
      return
    }
    this.listColliders.forEach((collider) => {
      if (!cc.sys.isObjectValid(collider.node.instance)) {
        this.removeColliders.push(collider)
      }
    })
    // this.removeColliders.forEach(comp => {
    //   this.listColliders = this.listColliders.filter(col => !col.isEqual(comp)
    //     && cc.sys.isObjectValid(col.node.instance));
    //   this._contracts = this._contracts.filter(contract => {
    //     const col1 = contract._collider1;
    //     const col2 = contract._collider2;
    //     if (col1.isEqual(comp) || !cc.sys.isObjectValid(col1.node.instance)) {
    //       if (contract._touching) {
    //         col2.node.emit('onCollisionExit', col1, col2);
    //       }
    //       return false;
    //     }
    //     if (col2.isEqual(comp) || !cc.sys.isObjectValid(col2.node.instance)) {
    //       if (contract._touching) {
    //         col1.node.emit('onCollisionExit', col2, col1);
    //       }
    //       return false;
    //     }
    //     return true;
    //   }
    //   );
    // });
    this.removeColliders = []
    let draw
    const { enabledDebugDraw, debugGraphics } = this
    if (enabledDebugDraw) {
      draw = debugGraphics
      draw.clear()
      //   this.listColliders.forEach(collider => {
      //     if (collider.node && collider.node.active) {
      //       collider.update(dt, draw);
      //     }
      //   });
      // } else {
      //   this.listColliders.forEach(collider => {
      //     if (collider.node && collider.node.active) {
      //       collider.update(dt);
      //     }
      //   });
    }
    for (const entt of entities.entities_with_components(BoxCollider)) {
      const comp = entt.getComponent(BoxCollider)
      comp.update(dt, draw)
    }
    for (const entt of entities.entities_with_components(CircleCollider)) {
      const comp = entt.getComponent(CircleCollider)
      comp.update(dt, draw)
    }
    for (const entt of entities.entities_with_components(PolygonCollider)) {
      const comp = entt.getComponent(PolygonCollider)
      comp.update(dt, draw)
    }
    this._contracts.forEach((contract) => {
      const col1 = contract._collider1
      const col2 = contract._collider2
      if (
        !cc.sys.isObjectValid(col1.node.instance) ||
        !cc.sys.isObjectValid(col2.node.instance) ||
        !col1.node ||
        !col2.node ||
        !col1.node.active ||
        !col2.node.active
      ) {
        return
      }
      const type = contract.updateState()
      switch (type) {
        case CollisionType.ENTER: {
          if (col1.props.onCollisionEnter) {
            col1.props.onCollisionEnter(col2)
          }
          if (col2.props.onCollisionEnter) {
            col2.props.onCollisionEnter(col1)
          }
          break
        }
        case CollisionType.STAY:
          if (col1.props.onCollisionStay) {
            col1.props.onCollisionStay(col2)
          }
          if (col2.props.onCollisionStay) {
            col2.props.onCollisionStay(col1)
          }
          break
        case CollisionType.EXIT:
          if (col1.props.onCollisionExit) {
            col1.props.onCollisionExit(col2)
          }
          if (col2.props.onCollisionExit) {
            col2.props.onCollisionExit(col1)
          }
          break

        default:
          break
      }
    })
  }
  addCollider(collider: Collider) {
    this.listColliders.forEach((col) => {
      if (shouldCollider(col, collider)) {
        this._contracts.push(new Contract(col, collider))
      }
    })
    this.listColliders.push(collider)
  }

  removeCollider(collider: Collider) {
    this.removeColliders.push(collider)
  }

  addDebugNode(root: cc.Scene) {
    this.debugGraphics = new cc.DrawNode()
    this.debugGraphics.zIndex = 1000
    root.addChild(this.debugGraphics)
  }
  toggleDebugDraw(enable = true) {
    this.enabledDebugDraw = enable
    this.addDebugNode(cc.director.getRunningScene())
  }
}
