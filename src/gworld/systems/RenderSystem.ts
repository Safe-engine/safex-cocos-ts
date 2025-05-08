import { ComponentAddedEvent, ComponentRemovedEvent, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'

import { SkeletonAnimation } from '../../spine/CCSkeletonAnimation'
import { NodeComp } from '../components/NodeComp'
import { GraphicsRender, MaskRender, NodeRender, ParticleComp, SpineSkeleton, SpriteRender, TiledMap } from '../components/RenderComponent'

export enum SpriteTypes {
  SIMPLE,
  SLICED,
  TILED,
  FILLED,
  MESH,
  ANIMATION,
}

export class RenderSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(NodeRender), this)
    event_manager.subscribe(ComponentAddedEvent(SpriteRender), this)
    event_manager.subscribe(ComponentAddedEvent(MaskRender), this)
    event_manager.subscribe(ComponentAddedEvent(SpineSkeleton), this)
    event_manager.subscribe(ComponentAddedEvent(GraphicsRender), this)
    event_manager.subscribe(ComponentAddedEvent(ParticleComp), this)
    event_manager.subscribe(ComponentAddedEvent(TiledMap), this)
    event_manager.subscribe(ComponentRemovedEvent(NodeComp), this)
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(NodeRender): {
        // cc.log('NodeRender', event);
        const nodeRenderComp = event.entity.getComponent(NodeRender)
        const node = new cc.Node()
        const ett = event.entity
        nodeRenderComp.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentAddedEvent(SpriteRender): {
        // console.log('SpriteRender', event);
        const spriteComp = event.entity.getComponent(SpriteRender)
        const { spriteFrame } = spriteComp.props
        const frame = cc.spriteFrameCache.getSpriteFrame(spriteFrame)
        // console.log('frame', spriteFrame, frame)
        const node = new cc.Sprite(frame)
        const ett = event.entity
        spriteComp.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentAddedEvent(MaskRender): {
        // cc.log('MaskRender', event.component);
        const ett = event.entity
        const maskComp = event.entity.getComponent(MaskRender)
        const { inverted } = maskComp.props
        const node = new cc.ClippingNode()
        node.setInverted(inverted)
        maskComp.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentAddedEvent(ParticleComp): {
        console.log('ParticleComp', event.component)
        const ett = event.entity
        const particleComp = event.component as ParticleComp
        const { plistFile } = particleComp.props
        const node = new cc.ParticleSystem(plistFile)
        particleComp.node = ett.assign(new NodeComp(node, ett))
        break
      }
      case ComponentAddedEvent(TiledMap): {
        console.log('TiledMap', event.component)
        const ett = event.entity
        const tiledMapComp = event.component as TiledMap
        const { mapFile } = tiledMapComp.props
        const node = new cc.TMXTiledMap(mapFile)
        tiledMapComp.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentAddedEvent(SpineSkeleton): {
        // console.log('SpineSkeleton', event.component);
        const ett = event.entity
        const spine = event.entity.getComponent(SpineSkeleton)
        const { data, skin, animation, loop, timeScale = 1 } = spine.props
        const { atlas, skeleton } = data
        // cc.log(skel, atlas);
        const node = SkeletonAnimation.createWithJsonFile(skeleton, atlas, timeScale)
        if (skin) {
          node.setSkin(skin)
        }
        if (animation) {
          node.setAnimation(0, animation, loop)
        }
        spine.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentAddedEvent(GraphicsRender): {
        // cc.log('MaskRender', event.component);
        const ett = event.entity
        const graphics = event.entity.getComponent(GraphicsRender)
        const { lineWidth, strokeColor, fillColor } = graphics
        const node = new cc.DrawNode()
        node.setColor(strokeColor)
        node.setDrawColor(fillColor)
        node.setLineWidth(lineWidth)
        graphics.node = ett.assign(new NodeComp(node, ett))
        break
      }
      case ComponentRemovedEvent(NodeComp): {
        const { component } = event
        const node = component as NodeComp
        if (node.instance) {
          node.instance.removeFromParent(true)
        }
        break
      }
      default:
        break
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number) {
    // throw new Error('Method not implemented.');
  }
}
