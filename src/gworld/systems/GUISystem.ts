import { ComponentAddedEvent, EntityManager, EventManager, EventReceive, System } from 'entityx-ts'

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
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(ButtonComp), this)
    event_manager.subscribe(ComponentAddedEvent(ProgressTimerComp), this)
    event_manager.subscribe(ComponentAddedEvent(LabelComp), this)
    event_manager.subscribe(ComponentAddedEvent(LabelOutlineComp), this)
    event_manager.subscribe(ComponentAddedEvent(LabelShadowComp), this)
    event_manager.subscribe(ComponentAddedEvent(RichTextComp), this)
    event_manager.subscribe(ComponentAddedEvent(ScrollViewComp), this)
    event_manager.subscribe(ComponentAddedEvent(BlockInputEventsComp), this)
  }
  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(ButtonComp): {
        // console.log(event.component)
        const ett = event.entity
        const button = ett.getComponent(ButtonComp)
        const nodeComp = ett.getComponent(NodeComp)
        // const { normalImage, selectedImage, disableImage, texType, zoomScale } = button
        button.node = nodeComp
        const touchComp = ett.assign(new TouchEventRegister())
        touchComp.props.onTouchStart = function (touch) {
          const p = touch.getLocation()
          // console.log('onTouchBegan', p, nodeComp)
          const rect = nodeComp.getBoundingBox()
          const nodeSpaceLocation = nodeComp.parent.convertToNodeSpace(p)
          if (rect.contains(nodeSpaceLocation)) {
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
        break
      }
      case ComponentAddedEvent(ProgressTimerComp): {
        // console.log(event.component)
        const ett = event.entity
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
        break
      }
      case ComponentAddedEvent(BlockInputEventsComp): {
        // console.log('BlockInputEventsComp', event);
        const node = event.entity.getComponent(NodeComp)
        if (node.instance instanceof ccui.ImageView) {
          node.instance.setTouchEnabled(true)
          node.instance.setScale9Enabled(true)
        }
        break
      }
      case ComponentAddedEvent(LabelComp): {
        // console.log(event.component)
        const ett = event.entity
        const label = ett.getComponent(LabelComp)
        const { string = '', font = '', size = 64 } = label.props
        const fontName = cc.path.basename(font, '.ttf')
        const node = new ccui.Text(string, fontName, size)
        node.setTextVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
        label.node = ett.assign(new NodeComp(node, ett))
        break
      }
      case ComponentAddedEvent(LabelOutlineComp): {
        // console.log(event.component)
        const ett = event.entity
        const outline = ett.getComponent(LabelOutlineComp)
        const { color, width } = outline.props
        const node = event.entity.getComponent(NodeComp)
        if (node.instance instanceof ccui.Text) {
          node.instance.enableOutline(color, width)
        }
        break
      }
      case ComponentAddedEvent(LabelShadowComp): {
        // console.log(event.component)
        const ett = event.entity
        const outline = ett.getComponent(LabelShadowComp)
        const { color, blur, offset } = outline.props
        const node = event.entity.getComponent(NodeComp)
        if (node.instance instanceof ccui.Text) {
          node.instance.enableShadow(color, offset, blur)
        }
        break
      }
      case ComponentAddedEvent(ScrollViewComp): {
        // console.log(event.component)
        const ett = event.entity
        const scrollView = ett.getComponent(ScrollViewComp)
        const { viewSize, contentSize, direction = cc.SCROLLVIEW_DIRECTION_VERTICAL } = scrollView.props
        const node = new cc.ScrollView(viewSize)
        node.setContentSize(contentSize)
        node.setViewSize(viewSize)
        node.setDirection(direction as number)
        // node.setContentOffset(cc.p(0, viewSize.height - contentSize.height))
        // node.setTouchEnabled(false)
        node.setBounceable(false)
        scrollView.node = ett.assign(new NodeComp(node, ett))
        break
      }
      case ComponentAddedEvent(RichTextComp): {
        console.log(event.component)
        const ett = event.entity
        const rich = ett.getComponent(RichTextComp)
        const { string = '' } = rich.props
        const node = new ccui.RichText()
        node.width = 500
        node.height = 300
        node.ignoreContentAdaptWithSize(false)
        rich.node = ett.assign(new NodeComp(node, ett))
        rich.string = string
        break
      }

      default:
        break
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number)
  update() {
    // throw new Error('Method not implemented.');
  }
}
