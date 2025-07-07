import { EntityManager, EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { TouchEventRegister } from '../..'
import { Vec2 } from '../../polyfills'
import {
  BlockInputEventsComp,
  ButtonComp,
  FillType,
  InputComp,
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
    event_manager.subscribe(EventTypes.ComponentAdded, InputComp, this.onAddInputComp)
    event_manager.subscribe(EventTypes.ComponentAdded, BlockInputEventsComp, this.onAddBlockInputEventsComp)
  }

  private onAddButtonComp: EventReceiveCallback<ButtonComp> = ({ entity, component: button }) => {
    const nodeComp = entity.getComponent(NodeComp)
    // const { normalImage, selectedImage, disableImage, texType, zoomScale } = button
    button.node = nodeComp
    const touchComp = entity.assign(new TouchEventRegister())
    touchComp.props.onTouchStart = function (touch) {
      const p = touch.getLocation()
      // console.log('onTouchBegan', p, nodeComp)
      const rect = nodeComp.getBoundingBox()
      const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
      if (rect.contains(nodeSpaceLocation) && button.enabled && nodeComp.active) {
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

  private onAddProgressTimerComp: EventReceiveCallback<ProgressTimerComp> = ({ entity, component: bar }) => {
    const { spriteFrame, fillType = FillType.HORIZONTAL, fillRange = 1, fillCenter = Vec2(1, 0) } = bar.props
    const sprite = new cc.Sprite(spriteFrame)
    const pTimer = new cc.ProgressTimer(sprite) as cc.ProgressTimer & cc.Node
    const ptt = fillType === FillType.RADIAL ? cc.ProgressTimer.TYPE_RADIAL : cc.ProgressTimer.TYPE_BAR
    pTimer.setType(ptt)
    if (fillType !== FillType.RADIAL) {
      const rate = fillType === FillType.HORIZONTAL ? cc.p(1, 0) : cc.p(0, 1)
      pTimer.setBarChangeRate(rate)
    }
    pTimer.setPercentage(fillRange * 100)
    pTimer.setMidpoint(fillCenter)
    bar.node = entity.assign(new NodeComp(pTimer, entity))
  }

  private onAddLabelComp: EventReceiveCallback<LabelComp> = ({ entity, component: label }) => {
    const { string = '', font = this.defaultFont, size = 64 } = label.props
    const fontName = cc.path.basename(font, '.ttf')
    const node = new ccui.Text(string, fontName, size)
    node.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
    label.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddLabelOutlineComp: EventReceiveCallback<LabelOutlineComp> = ({ entity, component: outline }) => {
    const { color, width } = outline.props
    const node = entity.getComponent(NodeComp)
    if (node.instance instanceof ccui.Text) {
      node.instance.enableOutline(color, width)
    }
  }

  private onAddLabelShadowComp: EventReceiveCallback<LabelShadowComp> = ({ entity, component: shadow }) => {
    const { color, blur, offset } = shadow.props
    const node = entity.getComponent(NodeComp)
    if (node.instance instanceof ccui.Text) {
      node.instance.enableShadow(color, offset, blur)
    }
  }

  private onAddRichTextComp: EventReceiveCallback<RichTextComp> = ({ entity, component: rich }) => {
    const { string = '' } = rich.props
    const node = new ccui.RichText()
    node.width = 500
    node.height = 300
    node.ignoreContentAdaptWithSize(false)
    rich.node = entity.assign(new NodeComp(node, entity))
    rich.string = string
  }

  private onAddScrollViewComp: EventReceiveCallback<ScrollViewComp> = ({ entity, component: scrollView }) => {
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

  private onAddBlockInputEventsComp: EventReceiveCallback<BlockInputEventsComp> = ({ entity, component: blockInput }) => {
    const node = entity.getComponent(NodeComp)
    if (node.instance instanceof ccui.ImageView) {
      node.instance.setTouchEnabled(true)
      node.instance.setScale9Enabled(true)
    }
    blockInput.node = node
  }

  private onAddInputComp: EventReceiveCallback<InputComp> = ({ entity, component: textInput }) => {
    const { placeHolder = '', font = this.defaultFont, size = 64, maxLength = 20, isPassword = false } = textInput.props
    const textField = new ccui.TextField()
    textField.setPlaceHolder(placeHolder)
    textField.setFontName(font)
    textField.setFontSize(size)
    textField.setTextColor(cc.color(255, 255, 255))
    textField.setMaxLengthEnabled(true)
    textField.setMaxLength(maxLength)
    textField.setPasswordEnabled(isPassword)
    textInput.node = entity.assign(new NodeComp(textField, entity))
  }

  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
