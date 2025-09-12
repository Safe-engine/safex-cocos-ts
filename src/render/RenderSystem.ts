import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { BLUE, RED } from '../polyfills'
import { GraphicsRender, MaskRender, MotionStreakComp, NodeRender, ParticleComp, SpriteRender, TiledMap } from './RenderComponent'
import { TiledSprite } from './TiledSprite'

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
    event_manager.subscribe(EventTypes.ComponentAdded, NodeRender, this.onAddNodeRender)
    event_manager.subscribe(EventTypes.ComponentAdded, SpriteRender, this.onAddSpriteRender)
    event_manager.subscribe(EventTypes.ComponentAdded, MaskRender, this.onAddMaskRender)
    event_manager.subscribe(EventTypes.ComponentAdded, GraphicsRender, this.onAddGraphicsRender)
    event_manager.subscribe(EventTypes.ComponentAdded, ParticleComp, this.onAddParticleComp)
    event_manager.subscribe(EventTypes.ComponentAdded, TiledMap, this.onAddTiledMap)
    event_manager.subscribe(EventTypes.ComponentAdded, MotionStreakComp, this.onAddMotionStreak)
    event_manager.subscribe(EventTypes.ComponentRemoved, NodeComp, this.onRemovedNodeComp)
  }

  private onAddNodeRender: EventReceiveCallback<NodeRender> = ({ entity }) => {
    const nodeRenderComp = entity.getComponent(NodeRender)
    const node = new cc.Node()
    const ett = entity
    nodeRenderComp.node = ett.assign(new NodeComp(node, ett))
  }

  private onAddSpriteRender: EventReceiveCallback<SpriteRender> = ({ entity, component: spriteComp }) => {
    const { spriteFrame, capInsets, tiledSize } = spriteComp.props
    const frame = cc.spriteFrameCache.getSpriteFrame(spriteFrame)
    // console.log('frame', spriteFrame, frame)
    let node
    if (tiledSize) {
      node = new TiledSprite({ texture: spriteFrame, width: tiledSize.width, height: tiledSize.height })
    } else if (capInsets) {
      const rect = cc.rect(...capInsets)
      node = new ccui.Scale9Sprite(frame || spriteFrame, rect, rect)
      // console.log('Scale9Sprite', node)
    } else {
      node = new cc.Sprite(frame || spriteFrame)
    }
    const ett = entity
    spriteComp.node = ett.assign(new NodeComp(node, ett))
  }

  private onAddMaskRender: EventReceiveCallback<MaskRender> = ({ entity, component: maskComp }) => {
    const { inverted = false, spriteFrame, alphaThreshold = 0.05 } = maskComp.props
    const stencil = new cc.Sprite(spriteFrame)
    const clipper = new cc.ClippingNode(stencil)
    clipper.setAlphaThreshold(alphaThreshold)
    clipper.setInverted(inverted)
    maskComp.node = entity.assign(new NodeComp(clipper, entity))
  }

  private onAddGraphicsRender = ({ entity }) => {
    const graphicsComp = entity.getComponent(GraphicsRender)
    const { lineWidth = 5, strokeColor = RED, fillColor = BLUE } = graphicsComp.props
    const node = new cc.DrawNode()
    node.setColor(strokeColor)
    node.setDrawColor(fillColor)
    node.setLineWidth(lineWidth)
    graphicsComp.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddParticleComp = ({ entity }) => {
    const particleComp = entity.getComponent(ParticleComp)
    const { plistFile } = particleComp.props
    const node = new cc.ParticleSystem(plistFile)
    particleComp.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddTiledMap = ({ entity }) => {
    const tiledMapComp = entity.getComponent(TiledMap)
    const { mapFile } = tiledMapComp.props
    const node = new cc.TMXTiledMap(mapFile)
    tiledMapComp.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddMotionStreak: EventReceiveCallback<MotionStreakComp> = ({ entity, component }) => {
    const { spriteFrame, fade, minSeg, stroke, color } = component.props
    const node = new cc.MotionStreak(
      fade || 0.4, // fade (vệt tồn tại 0.4s)
      minSeg || 1, // minSeg
      stroke || 20, // stroke (độ rộng vệt)
      color || cc.color(255, 255, 255, 255),
      spriteFrame,
    )
    component.node = entity.assign(new NodeComp(node, entity))
  }

  private onRemovedNodeComp = ({ component }) => {
    const node = component as NodeComp
    if (node.instance) {
      node.instance.removeFromParent(true)
    }
  }

  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
