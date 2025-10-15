import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { GraphicsRender, MaskRender, MotionStreakComp, NodeRender, ParticleComp, SpriteRender, TiledMap } from './RenderComponent'

export enum SpriteTypes {
  SIMPLE,
  SLICED,
  TILED,
  FILLED,
  MESH,
  ANIMATION,
}

function createTiledSprite(src: string, totalW: number, totalH: number) {
  // tạo sprite từ input
  const tileSprite = new cc.Sprite(src)
  // lấy kích thước gốc của texture
  const frame = tileSprite.getSpriteFrame()
  const tileW = frame ? frame.getRect().width : tileSprite.getContentSize().width
  const tileH = frame ? frame.getRect().height : tileSprite.getContentSize().height

  // tạo renderTexture với kích thước cần phủ
  const { width, height } = cc.winSize
  const rt = new cc.RenderTexture(width, height)
  rt.beginWithClear(0, 0, 0, 0)

  const drawSprite = new cc.Sprite(tileSprite.getTexture())
  // if (frame) {
  //   drawSprite.setSpriteFrame(frame)
  // }
  drawSprite.setAnchorPoint(0, 0)

  // số tile theo trục x,y
  const cols = Math.ceil(totalW / tileW)
  const rows = Math.ceil(totalH / tileH)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = new cc.Sprite(frame)
      s.setFlippedY(true)
      s.setAnchorPoint(0, 0)
      s.setPosition(c * tileW, r * tileH)
      s.visit(rt)
    }
  }
  rt.end()

  const finalSprite = rt.sprite
  // finalSprite.setFlippedY(true) // RenderTexture bị lật
  finalSprite.setAnchorPoint(0, 0)
  finalSprite.setContentSize(cc.size(totalW, totalH))

  return new cc.Sprite(finalSprite.texture)
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
      node = createTiledSprite(spriteFrame, tiledSize.width, tiledSize.height)
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
    const { inverted, spriteFrame, cropSize, alphaThreshold = 0.05 } = maskComp.props
    let stencil: cc.Node
    if (cropSize) {
      const { width, height } = cropSize
      stencil = new cc.LayerColor(cc.Color.WHITE, width, height)
    } else {
      stencil = new cc.Sprite(spriteFrame)
    }
    const clipper = new cc.ClippingNode(stencil)
    clipper.setAlphaThreshold(!spriteFrame ? 1 : alphaThreshold)
    clipper.setInverted(inverted)
    maskComp.node = entity.assign(new NodeComp(clipper, entity))
  }

  private onAddGraphicsRender = ({ entity }) => {
    const graphicsComp = entity.getComponent(GraphicsRender)
    const { lineWidth = 5, strokeColor = cc.Color.RED, fillColor = cc.Color.BLUE } = graphicsComp.props
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
      color || cc.Color.WHITE,
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
