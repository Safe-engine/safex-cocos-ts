import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'
import { NodeComp } from '../core/NodeComp'
import { GameWorld } from '../gworld'
import { instantiate } from '../helper'
import { PhysicsBoxCollider, PhysicsCircleCollider, PhysicsPolygonCollider, RigidBody } from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export const DynamicBody = 2
export const KinematicBody = 1
export const StaticBody = 0

export function setColliderMatrix(colliderMatrix = [[true]]) {
  const physicsSystem = GameWorld.Instance.systems.get(PhysicsSystem)
  physicsSystem.colliderMatrix = colliderMatrix
}

export class PhysicsSystem implements System {
  space: cp.Space
  _debugNode: cc.PhysicsDebugNode
  listRemoveBody: cp.Body[] = []
  listRemoveShape: cp.Shape[] = []
  colliderMatrix = [[true]]

  configure(event_manager: EventManager) {
    this.space = new cp.Space()
    this.space.gravity = cp.v(0, -300)
    this.space.iterations = 60
    this.space.collisionSlop = 0.5
    this.space.setDefaultCollisionHandler(
      this.collisionBegin.bind(this),
      this.collisionPre.bind(this),
      this.collisionPost.bind(this),
      this.collisionSeparate.bind(this),
    )
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsBoxCollider, ({ entity, component: box }) => {
      // console.log('ComponentAddedEvent PhysicsBoxCollider', box)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor, tag = 0 } = rigidBody.props
      const { width, height, offset = [] } = box.props
      const [x = 0, y = 0] = offset
      const node = entity.getComponent(NodeComp)
      const body = new cp.Body(density * gravityScale, cp.momentForBox(density, width, height))
      const hw = width * 0.5
      const hh = height * 0.5
      const shape = new cp.BoxShape2(body, new cp.BB(-hw + x, -hh + y, hw + x, hh + y))
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      this.space.addBody(body)
      if (type !== StaticBody) this.space.addShape(shape)
      else this.space.addStaticShape(shape)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      box.node = node
      body.setPos(node.position)
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsCircleCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsCircleCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const {
        type = StaticBody,
        gravityScale = 1,
        density = 1,
        friction = 0.5,
        restitution = 0.3,
        isSensor = false,
        tag = 0,
      } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { radius, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const offVect = new cp.Vect(x, y)
      const body = new cp.Body(density * gravityScale, cp.momentForCircle(density, radius, radius, offVect))
      const shape = new cp.CircleShape(body, radius, offVect)
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      this.space.addBody(body)
      if (type !== StaticBody) this.space.addShape(shape)
      else this.space.addStaticShape(shape)
      // console.log(position instanceof b2Vec2, zero instanceof b2Vec2)
      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      component.node = node
      body.setPos(node.position)
    })
    event_manager.subscribe(EventTypes.ComponentAdded, PhysicsPolygonCollider, ({ entity, component }) => {
      // console.log('ComponentAddedEvent PhysicsPolygonCollider', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = StaticBody, gravityScale = 1, density = 1, friction = 0.5, restitution = 0.3, isSensor, tag = 0 } = rigidBody.props
      const node = entity.getComponent(NodeComp)
      const { points, offset = [] } = component.props
      const [x = 0, y = 0] = offset
      const offVect = new cp.Vect(x, y)
      const fixedPoints = []
      points.forEach((p) => {
        const px = p.x || p[0]
        const py = p.y || p[1]
        fixedPoints.push(px, py)
      })
      const body = new cp.Body(density * gravityScale, cp.momentForPoly(density, fixedPoints, offVect))
      const shape = new cp.PolyShape(body, fixedPoints, offVect)
      shape.setElasticity(restitution)
      shape.setFriction(friction)
      shape.setSensor(isSensor)
      const physicsNode = new PhysicsSprite(node.instance, body)
      this.space.addBody(body)
      if (type !== StaticBody) this.space.addShape(shape)
      else this.space.addStaticShape(shape)

      rigidBody.physicSprite = physicsNode
      rigidBody.node = node
      rigidBody.body = body
      body.data = node
      shape.group = tag
      component.node = node
      body.setPos(node.position)
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, RigidBody, ({ component }) => {
      // console.log('ComponentRemovedEvent NodeComp', component)
      // this.space.addPostStepCallback(() => {
      // cc.log('addPostStepCallback');
      this.listRemoveShape.forEach((s) => s && this.space.removeShape(s))
      this.listRemoveBody.forEach((b) => b && this.space.removeBody(b))
      this.listRemoveBody = []
      this.listRemoveShape = []
      // })
      if (component.physicSprite instanceof PhysicsSprite) {
        const body = component.physicSprite.getBody()
        this.listRemoveShape.push(...body.shapeList)
        this.listRemoveBody.push(body)
      }
    })
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.space) {
      this.space.step(dt)
    }
    for (const entt of entities.entities_with_components(RigidBody)) {
      const comp = entt.getComponent(RigidBody)
      if (comp.node.active && comp.enabled) {
        comp.physicSprite.update(dt)
      }
    }
  }

  collisionBegin(arbiter: cp.Arbiter, space: cp.Space) {
    const shapes = arbiter.getShapes()
    // cc.log(arbiter);
    const node1: NodeComp = arbiter.body_a.data
    const node2: NodeComp = arbiter.body_b.data
    const groupA = shapes[0].group
    const groupB = shapes[1].group
    // cc.log(groupA, groupB, colliderMatrix[groupA][groupB]);
    if (!this.colliderMatrix[groupA][groupB]) {
      return false
    }

    const phys1 = node1.getComponent(RigidBody)
    const phys2 = node2.getComponent(RigidBody)
    if (node1 && node1.active) {
      if (phys1 && phys1.props.onBeginContact) {
        phys1.props.onBeginContact(phys2)
      }
    }
    if (node2 && node2.active) {
      if (phys2 && phys2.props.onBeginContact) {
        phys2.props.onBeginContact(phys1)
      }
    }
    return false
  }

  collisionPre(arbiter: cp.Arbiter, space: cp.Space) {
    // cc.log('collisionPre');
    return true
  }

  collisionPost(arbiter: cp.Arbiter, space: cp.Space) {
    // cc.log('collisionPost');
    return true
  }

  collisionSeparate(arbiter: cp.Arbiter, space: cp.Space) {
    // cc.log('collisionSeparate');
    const node1: NodeComp = arbiter.body_a.data
    const node2: NodeComp = arbiter.body_b.data
    const phys1 = node1.getComponent(RigidBody)
    const phys2 = node2.getComponent(RigidBody)
    if (node1 && node1.active) {
      if (phys1 && phys1.props.onEndContact) {
        phys1.props.onEndContact(phys2)
      }
    }
    if (node2 && node2.active) {
      if (phys2 && phys2.props.onEndContact) {
        phys2.props.onEndContact(phys1)
      }
    }
    return true
  }
  addDebug() {
    const currentScene = cc.director.getRunningScene()
    this._debugNode = new cc.PhysicsDebugNode(this.space)
    this._debugNode.visible = true
    currentScene.addChild(this._debugNode, 100)
  }
}
