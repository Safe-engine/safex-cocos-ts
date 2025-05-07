import { LabelCompProps, LabelOutlineCompProps, LabelShadowCompProps, ProgressTimerProps } from '../../../@types/safex'
import { HtmlTextParser } from '../../helper/html-text-parser'
import { Color4B, Size, Vec2 } from '../../polyfills'
import { ComponentX, NoRenderComponentX } from '../core/decorator'

export const FillType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  RADIAL: 2,
}
type Keys = keyof typeof FillType
type Values = (typeof FillType)[Keys]
const _htmlTextParser = new HtmlTextParser()

interface ButtonCompProps {
  normalImage?: string
  selectedImage?: string
  disableImage?: string
  zoomScale?: number
  onPress?: (target: ButtonComp) => void
}
export class ButtonComp extends NoRenderComponentX<ButtonCompProps> {
  texType: ccui.Widget.TextureType
  clickEvents = []

  setOnPress(cb: (target: ButtonComp) => void) {
    this.props.onPress = cb
  }

  set enabled(val) {
    this.node.setTouchEnabled(val)
  }
}

export class ProgressTimerComp extends ComponentX<ProgressTimerProps & { $ref?: ProgressTimerComp }> {
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

export class LabelComp extends ComponentX<LabelCompProps & { $ref?: LabelComp }, ccui.Text> {
  // protected font: string
  // protected string: string
  // protected size: number

  getString() {
    return this.props.string
  }

  setString(val: string) {
    this.props.string = val
    if (this.node.instance instanceof ccui.Text) {
      this.node.instance.setString(val)
    }
  }
}

export class RichTextComp extends ComponentX<LabelCompProps, ccui.RichText> {
  get string() {
    return this.props.string
  }

  set string(val: string) {
    this.props.string = val
    if (this.node.instance instanceof ccui.RichText) {
      const newTextArray = _htmlTextParser.parse(val)
      console.log(newTextArray)
      this.node.instance._richElements = []
      this.node.instance._formatTextDirty = true
      this.node.instance.formatText()
      for (let index = 0; index < newTextArray.length; index++) {
        const { style, text } = newTextArray[index]
        const color = style && style.color ? cc.hexToColor(style.color) : cc.Color.WHITE
        const fontName = cc.path.basename(this.props.font, '.ttf')
        const richText = ccui.RichElementText.create(index, color, 255, text, fontName, this.props.size || 64)
        // if (style && style.newline) {
        // console.log('newline')
        // this.node.instance._addNewLine()
        // }
        this.node.instance.pushBackElement(richText)
      }
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
export class ScrollViewComp extends ComponentX<ScrollViewProps, cc.ScrollView> {
  zoom(scale: number) {
    if (this.node.instance instanceof cc.ScrollView) {
      this.node.instance.getContainer().setScale(scale)
    }
  }
}

export class BlockInputEventsComp extends NoRenderComponentX {}
