import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'
import { NodeComp } from '../core/NodeComp'
import { TouchEventRegister } from '../norender'
import { Vec2 } from '../polyfills'
import { ButtonComp, FillType, InputComp, LabelComp, ProgressTimerComp, ScrollViewComp } from './GUIComponent'

export class GUISystem implements System {
  static defaultFont: string
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, ButtonComp, this.onAddButtonComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ProgressTimerComp, this.onAddProgressTimerComp)
    event_manager.subscribe(EventTypes.ComponentAdded, LabelComp, this.onAddLabelComp)
    event_manager.subscribe(EventTypes.ComponentAdded, ScrollViewComp, this.onAddScrollViewComp)
    event_manager.subscribe(EventTypes.ComponentAdded, InputComp, this.onAddInputComp)
  }

  private onAddButtonComp: EventReceiveCallback<ButtonComp> = ({ entity, component: button }) => {
    const nodeComp = entity.getComponent(NodeComp)
    const { zoomScale = 1.2 } = button.props
    button.node = nodeComp
    const lastScaleX = nodeComp.scaleX
    const lastScaleY = nodeComp.scaleY
    const touchComp = entity.assign(new TouchEventRegister())
    touchComp.props.onTouchStart = function (touch) {
      const p = touch.getLocation()
      // console.log('onTouchBegan', p, lastScaleX, lastScaleY)
      const rect = nodeComp.getBoundingBox()
      const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
      if (rect.contains(nodeSpaceLocation) && button.enabled && nodeComp.active) {
        const scale = cc.scaleTo(0.3, zoomScale * lastScaleX, lastScaleY * zoomScale)
        nodeComp.runAction(scale)
        button.props.onPress(button)
      }
    }
    touchComp.props.onTouchEnd = function () {
      const scale = cc.scaleTo(0.3, lastScaleX, lastScaleY)
      nodeComp.runAction(scale)
    }
    touchComp.props.onTouchCancel = touchComp.props.onTouchEnd
  }

  private onAddProgressTimerComp: EventReceiveCallback<ProgressTimerComp> = ({ entity, component: bar }) => {
    const { spriteFrame, fillType = FillType.HORIZONTAL, fillRange = 1, fillCenter = Vec2(0, 0) } = bar.props
    const frame = cc.spriteFrameCache.getSpriteFrame(spriteFrame)
    const sprite = new cc.Sprite(frame || spriteFrame)
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
    const { string = '', font = GUISystem.defaultFont, size = 64, outline, shadow } = label.props
    const fontName = cc.path.basename(font, '.ttf')
    const node = new ccui.Text(string, fontName, size)
    node.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
    if (outline) {
      const [color, width] = outline
      node.enableOutline(color, width)
    }
    if (shadow) {
      const [color, blur, offset] = shadow
      node.enableShadow(color, offset, blur)
    }
    node.ignoreContentAdaptWithSize(false)
    label.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddScrollViewComp: EventReceiveCallback<ScrollViewComp> = ({ entity, component: scrollView }) => {
    const { viewSize, contentSize, isScrollToTop, isBounced, direction = cc.SCROLLVIEW_DIRECTION_VERTICAL } = scrollView.props
    const node = new cc.ScrollView(viewSize)
    node.setContentSize(contentSize)
    node.setViewSize(viewSize)
    node.setDirection(direction as number)
    if (isScrollToTop !== undefined) node.setContentOffset(cc.p(0, viewSize.height - contentSize.height))
    // node.setTouchEnabled(false)
    node.setBounceable(isBounced !== undefined)
    scrollView.node = entity.assign(new NodeComp(node, entity))
  }

  private onAddInputComp: EventReceiveCallback<InputComp> = ({ entity, component: textInput }) => {
    const { placeHolder = '', font = GUISystem.defaultFont, size = 64, maxLength = 20, isPassword = false } = textInput.props
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

  // update(entities: EntityManager, events: EventManager, dt: number)
  // update() {
  // }
}
