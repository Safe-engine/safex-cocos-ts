import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { TouchEventRegister } from '../..'
import { Vec2 } from '../../polyfills'
import {
  BlockInputEventsComp,
  ButtonComp,
  FillType,
  LabelComp,
  LabelOutlineComp,
  LabelShadowComp,
  ProgressTimerComp,
  RichTextComp,
  ScrollViewComp,
} from '../components/GUIComponent'
import { NodeComp } from '../components/NodeComp'

export class GUISystem implements System {
  defaultFont: string
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, ButtonComp, this.onAddButtonComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ProgressTimerComp, this.onAddProgressTimerComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelComp, this.onAddLabelComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelOutlineComp, this.onAddLabelOutlineComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelShadowComp, this.onAddLabelShadowComp)
    event_manager.subscribe(EventTypes.ComponentAdded, RichTextComp, this.onAddRichTextComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ScrollViewComp, this.onAddScrollViewComp)
    event_manager.subscribe(EventTypes.ComponentAdded, BlockInputEventsComp, this.onAddBlockInputEventsComp)
  }

  private onAddButtonComp = ({ entity }) => {
    const button = entity.getComponent(ButtonComp)
    const nodeComp = entity.getComponent(NodeComp)
    // const { normalImage, selectedImage, disableImage, texType, zoomScale } = button
    button.node = nodeComp
    const touchComp = entity.assign(new TouchEventRegister())
    touchComp.props.onTouchStart = function (touch) {
      const p = touch.getLocation()
      // console.log('onTouchBegan', p, nodeComp)
      const rect = nodeComp.getBoundingBox()
      const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
      if (rect.contains(nodeSpaceLocation) && button.enabled) {
        const scale = cc.scaleTo(0.3, 1.2)
        nodeComp.runAction(scale)
        button.props.onPress(button)
        // return true
      }
    }
    touchComp.props.onTouchEnd = function () {
      const scale = cc.scaleTo(0.3, 1)
      nodeComp.runAction(scale)
      // return true
    }
    touchComp.props.onTouchCancel = touchComp.props.onTouchEnd
  }

  private onAddProgressTimerComp = ({ entity }) => {
    const ett = entity
    const bar = ett.getComponent(ProgressTimerComp)
    const { spriteFrame, fillType = FillType.HORIZONTAL, fillRange = 1, fillCenter = Vec2(1, 0) } = bar.props
    const sprite = new cc.Sprite(spriteFrame)
    const pTimer = new cc.ProgressTimer(sprite)
    const ptt = fillType === FillType.RADIAL ? cc.ProgressTimer.TYPE_RADIAL : cc.ProgressTimer.TYPE_BAR
    pTimer.setType(ptt)
    if (fillType !== FillType.RADIAL) {
      const rate = fillType === FillType.HORIZONTAL ? cc.p(1, 0) : cc.p(0, 1)
      pTimer.setBarChangeRate(rate)
    }
    pTimer.setPercentage(fillRange * 100)
    pTimer.setMidpoint(fillCenter)
    bar.node = ett.assign(new NodeComp(pTimer as any, ett))
  }

  private onAddLabelComp = ({ entity }) => {
    const ett = entity
    const label = ett.getComponent(LabelComp)
    const { string = '', font = this.defaultFont, size = 64 } = label.props
    const fontName = cc.path.basename(font, '.ttf')
    const node = new ccui.Text(string, fontName, size)
    node.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
    label.node = ett.assign(new NodeComp(node, ett))
  }

  private onAddLabelOutlineComp = ({ entity }) => {
    const ett = entity
    const outline = ett.getComponent(LabelOutlineComp)
    const { color, width } = outline.props
    const node = ett.getComponent(NodeComp)
    if (node.instance instanceof ccui.Text) {
      node.instance.enableOutline(color, width)
    }
  }

  private onAddLabelShadowComp = ({ entity }) => {
    const ett = entity
    const shadow = ett.getComponent(LabelShadowComp)
    const { color, blur, offset } = shadow.props
    const node = ett.getComponent(NodeComp)
    if (node.instance instanceof ccui.Text) {
      node.instance.enableShadow(color, offset, blur)
    }
  }

  private onAddRichTextComp = ({ entity }) => {
    const ett = entity
    const rich = ett.getComponent(RichTextComp)
    const { string = '' } = rich.props
    const node = new ccui.RichText()
    node.width = 500
    node.height = 300
    node.ignoreContentAdaptWithSize(false)
    rich.node = ett.assign(new NodeComp(node, ett))
    rich.string = string
  }

  private onAddScrollViewComp = ({ entity }) => {
    const scrollView = entity.getComponent(ScrollViewComp)
    const { viewSize, contentSize, direction = cc.SCROLLVIEW_DIRECTION_VERTICAL } = scrollView.props
    const node = new cc.ScrollView(viewSize)
    node.setContentSize(contentSize)
    node.setViewSize(viewSize)
    node.setDirection(direction as number)
    // node.setContentOffset(cc.p(0, viewSize.height - contentSize.height))
    // node.setTouchEnabled(false)
    node.setBounceable(false)
    scrollView.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddBlockInputEventsComp = ({ entity }) => {
    const ett = entity
    const blockInput = ett.getComponent(BlockInputEventsComp)
    const node = ett.getComponent(NodeComp)
    if (node.instance instanceof ccui.ImageView) {
      node.instance.setTouchEnabled(true)
      node.instance.setScale9Enabled(true)
    }
    blockInput.node = node
  }

  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
