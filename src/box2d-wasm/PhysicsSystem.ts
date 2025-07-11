import Box2DFactory from 'box2d-wasm'
import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { GameWorld, instantiate, NodeComp } from '..'
import { makeContactListener } from './ContactListener'
import { makeDebugDraw } from './debugDraw'
import {
  BoxColliderPhysics,
  CircleColliderPhysics,
  ColliderPhysics,
  PhysicsMaterial,
  PolygonColliderPhysics,
  RigidBody,
} from './PhysicsComponent'
import { PhysicsSprite } from './PhysicsSprite'

export let box2D: typeof Box2D

export function initBox2d(cb) {
  Box2DFactory().then((b2) => {
    box2D = b2
    cb()
  })
}

// Box2D.b2Fixture.prototype.shouldCollide = function (other) {
//   const nodeThis: NodeComp = this.getBody().getUserData()
//   const nodeOther = other.getBody().getUserData() as NodeComp
//   const { colliderMatrix } = GameWorld.Instance.systems.get(PhysicsSystem)
//   return colliderMatrix[nodeOther.group][nodeThis.group]
// }

export function setColliderMatrix(colliderMatrix = [[true]]) {
  const physicsSystem = GameWorld.Instance.systems.get(PhysicsSystem)
  physicsSystem.colliderMatrix = colliderMatrix
}
const maxTimeStep = 1 / 60
const velocityIterations = 1
const positionIterations = 1
const metadata: { [key: number]: NodeComp } = {}
const pixelsPerMeter = 1

export class PhysicsSystem implements System {
  world: Box2D.b2World
  listRemoveBody: Body[] = []
  listRemoveShape: Box2D.b2Shape[] = []
  colliderMatrix = [[true]]
  graphics: cc.DrawNode

  configure(event_manager: EventManager) {
    const { b2BodyDef, b2_dynamicBody, b2_staticBody, b2FixtureDef, b2PolygonShape, b2Vec2, b2World, getPointer, b2ContactListener } =
      box2D as typeof Box2D
    const gravity = new b2Vec2(0, -10)
    this.world = new b2World(gravity)
    console.log('configure PhysicsSystem world', this.world)
    // event_manager.world.physicsManager = this
    const graphics = new cc.DrawNode()
    this.graphics = graphics
    graphics.zIndex = 1000
    const scene = cc.director.getRunningScene()
    scene.addChild(graphics)
    const debugDraw = makeDebugDraw(graphics, pixelsPerMeter, box2D)
    this.world.SetDebugDraw(debugDraw)
    // event_manager.subscribe(ComponentAddedEvent(RigidBody), this);
    event_manager.subscribe(EventTypes.ComponentAdded, BoxColliderPhysics, ({ entity, component }) => {
      console.log('ComponentAddedEvent BoxColliderPhysics', component)
      let rigidBody = entity.getComponent(RigidBody)
      if (!rigidBody) {
        rigidBody = instantiate(RigidBody)
        entity.assign(rigidBody)
      }
      const { type = 'static', gravityScale = 1 } = rigidBody.props
      const physicsMaterial = entity.getComponent(PhysicsMaterial)
      const { density = 1, friction = 0.5, restitution = 0.3 } = physicsMaterial?.props || {}
      const box = component
      const node = entity.getComponent(NodeComp<PhysicsSprite>)
      const { width, height, ...colliderProps } = box.props
      // ett.assign(instantiate(ColliderPhysics, { tag, offset }))
      const { x = 0, y = 0 } = colliderProps.offset || {}
      const zero = new b2Vec2(0, 0)
      const position = new b2Vec2(node.posX, node.posY)
      const offset = new b2Vec2(x, y)

      const bd = new b2BodyDef()
      bd.set_type(type === 'dynamic' ? b2_dynamicBody : b2_staticBody)
      bd.set_position(zero)
      bd.set_gravityScale(gravityScale)
      const body = this.world.CreateBody(bd)
      rigidBody.body = body
      // console.log('body', type, b2_dynamicBody, b2_staticBody, getPointer(body));
      // body.setMassData({ mass: 1 } as any)
      const physicsNode = new PhysicsSprite(node.instance, body)
      const square = new b2PolygonShape()
      square.SetAsBox(width / 2, height / 2)
      const fixtureDef = new b2FixtureDef()
      fixtureDef.set_shape(square)
      fixtureDef.set_density(density)
      fixtureDef.set_friction(friction)
      fixtureDef.set_restitution(restitution)
      body.CreateFixture(fixtureDef)
      body.SetTransform(position, 0)
      body.SetLinearVelocity(zero)
      body.SetAwake(true)
      body.SetEnabled(true)
      metadata[getPointer(body)] = node

      const physicsCollide = entity.assign(instantiate(ColliderPhysics, colliderProps))
      physicsCollide.instance = physicsNode
      physicsCollide.node = node
      box.node = node
    })
    event_manager.subscribe(EventTypes.ComponentAdded, CircleColliderPhysics, () => { })
    event_manager.subscribe(EventTypes.ComponentAdded, PolygonColliderPhysics, () => { })
    event_manager.subscribe(EventTypes.ComponentRemoved, NodeComp, ({ entity }) => {
      // log('ComponentRemovedEvent NodeComp', event);
      const node = entity.getComponent(NodeComp<PhysicsSprite>)
      if (node.instance instanceof PhysicsSprite) {
        const body = node.instance.getBody()
        this.listRemoveShape.push(...body.shapeList)
        this.listRemoveBody.push(body)
      }
    })
    const listener = makeContactListener(this.world, metadata, box2D)
    this.world.SetContactListener(listener)
  }

  update(entities: EntityManager, events: EventManager, dt: number) {
    if (this.world) {
      const { getPointer } = box2D
      // remove bodies and shapes
      this.listRemoveBody.forEach((body) => {
        if (body) {
          this.world.DestroyBody(getPointer(body))
        }
      })
      // this.listRemoveShape.forEach((shape) => {
      //   if (shape) {
      //     this.world.DestroyShape(shape)
      //   }
      // })
      this.listRemoveBody = []
      this.listRemoveShape = []
      const clampedDelta = Math.min(dt, maxTimeStep)
      this.world.Step(clampedDelta, velocityIterations, positionIterations)
      this.graphics.clear()
      this.world.DebugDraw()
      // console.log('GetBodyCount', this.world.GetBodyCount())
    }
  }

  set enabled(val) {
    if (val) {
      this.world.SetGravity(new Box2D.b2Vec2(0, -9.8))
      // this.world.iterations = 60
      // this.world.collisionSlop = 0.5
    }
  }
}
