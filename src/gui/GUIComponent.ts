import { ComponentX, NoRenderComponentX } from '../core/decorator'
import { Color4B, Size, Vec2 } from '../polyfills'
import { BaseComponentProps, ColorSource } from '../safex'

export const FillType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  RADIAL: 2,
}
type Keys = keyof typeof FillType
type Values = (typeof FillType)[Keys]

interface ButtonCompProps {
  normalImage?: string
  selectedImage?: string
  disableImage?: string
  zoomScale?: number
  onPress?: (target: ButtonComp) => void
}
export class ButtonComp extends NoRenderComponentX<ButtonCompProps> {
  // texType: ccui.Widget.TextureType
  clickEvents = []

  setOnPress(cb: (target: ButtonComp) => void) {
    this.props.onPress = cb
  }

  // setTouchEnabled(val) {
  //   this.node.setTouchEnabled(val)
  // }
}

interface ProgressTimerProps {
  spriteFrame: string
  fillType?: number
  fillRange?: number
  fillCenter?: Vec2
  isReverse?: boolean
}

export class ProgressTimerComp extends ComponentX<ProgressTimerProps & BaseComponentProps<ProgressTimerComp>, cc.ProgressTimer & cc.Node> {
  spriteFrame: string
  fillType: Values
  fillRange: number
  fillCenter: Vec2
  isReverse: boolean

  getFillRange() {
    if (this.node.instance instanceof cc.ProgressTimer) {
      return this.node.instance.getPercentage() * 0.01
    }
  }

  setFillStart(val: number) {
    if (this.node.instance instanceof cc.ProgressTimer) {
      this.node.instance.setMidpoint(Vec2(val, val))
    }
  }

  setFillRange(val: number) {
    if (this.node.instance instanceof cc.ProgressTimer) {
      this.node.instance.setPercentage(val * 100)
    }
  }
}

interface LabelCompProps {
  font?: string
  string?: string
  size?: number
}

interface LabelOutlineCompProps {
  color: ColorSource
  width: number
}

interface LabelShadowCompProps {
  color: ColorSource
  blur: number
  offset: Vec2
}

export class LabelComp extends ComponentX<LabelCompProps & BaseComponentProps<LabelComp>, ccui.Text> {
  get string() {
    return this.props.string
  }

  set string(val: string) {
    this.props.string = val
    if (this.node.instance instanceof ccui.Text) {
      this.node.instance.setString(val)
    }
  }
}

export class LabelOutlineComp extends NoRenderComponentX<LabelOutlineCompProps> {
  color: typeof Color4B
  width: Float
}

export class LabelShadowComp extends NoRenderComponentX<LabelShadowCompProps> {
  color: typeof Color4B
  blur: Float
  offset: Size
}

export enum ScrollViewDirection {
  NONE = cc.SCROLLVIEW_DIRECTION_NONE,
  HORIZONTAL = cc.SCROLLVIEW_DIRECTION_HORIZONTAL,
  VERTICAL = cc.SCROLLVIEW_DIRECTION_VERTICAL,
  BOTH = cc.SCROLLVIEW_DIRECTION_BOTH,
}
interface ScrollViewProps {
  viewSize: Size
  contentSize: Size
  direction?: ScrollViewDirection
}
export class ScrollViewComp extends ComponentX<ScrollViewProps & BaseComponentProps<ScrollViewComp>, cc.ScrollView> {
  zoom(scale: number) {
    if (this.node.instance instanceof cc.ScrollView) {
      this.node.instance.getContainer().setScale(scale)
    }
  }
}

interface InputCompProps {
  placeHolder?: string
  font?: string
  size?: Integer
  maxLength?: Integer
  isPassword?: boolean
}
export class InputComp extends ComponentX<InputCompProps & BaseComponentProps<InputComp>, ccui.TextField> {
  get string() {
    return this.node.instance.getString()
  }
}

export class BlockInputEventsComp extends NoRenderComponentX {}
