import { HtmlTextParser } from '../../helper/html-text-parser'
import { Color4B, Size, Vec2 } from '../../polyfills'
import { ComponentX, NoRenderComponentX } from '../core/decorator'
import { NodeComp } from './NodeComp'

export const FillType = {
  HORIZONTAL: 0,
  VERTICAL: 1,
  RADIAL: 2,
}
type Keys = keyof typeof FillType
type Values = (typeof FillType)[Keys]
const _htmlTextParser = new HtmlTextParser()

export class ButtonComp extends NoRenderComponentX {
  normalImage: string
  selectedImage: string
  disableImage: string
  zoomScale: number
  texType: ccui.Widget.TextureType
  clickEvents = []
  onPress: (target: NodeComp) => void

  setOnPress(cb: (target: NodeComp) => void) {
    this.onPress = cb
  }

  set enabled(val) {
    this.node.setTouchEnabled(val)
  }
}

export class ProgressTimerComp extends ComponentX {
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

export class LabelComp extends ComponentX {
  protected font: string
  protected string: string
  protected size: number

  getString() {
    return this.string
  }

  setString(val: string) {
    this.string = val
    if (this.node.instance instanceof ccui.Text) {
      this.node.instance.setString(val)
    }
  }
}

export class RichTextComp extends ComponentX {
  protected font: string
  protected string: string
  protected size: number

  getString() {
    return this.string
  }

  setString(val: string) {
    this.string = val
    if (this.node.instance instanceof ccui.RichText) {
      const newTextArray = _htmlTextParser.parse(val)
      console.log(newTextArray)
      this.node.instance._richElements = []
      this.node.instance._formatTextDirty = true
      this.node.instance.formatText()
      for (let index = 0; index < newTextArray.length; index++) {
        const { style, text } = newTextArray[index]
        const color =
          style && style.color ? cc.hexToColor(style.color) : cc.Color.WHITE
        const fontName = cc.path.basename(this.font, '.ttf')
        const richText = ccui.RichElementText.create(
          index,
          color,
          255,
          text,
          fontName,
          this.size || 64,
        )
        // if (style && style.newline) {
        // console.log('newline')
        // this.node.instance._addNewLine()
        // }
        this.node.instance.pushBackElement(richText)
      }
    }
  }
}

export class LabelOutlineComp extends NoRenderComponentX {
  color: typeof Color4B
  width: Float
}

export class LabelShadowComp extends NoRenderComponentX {
  color: typeof Color4B
  blur: Float
  offset: Size
}

export class ScrollViewComp extends ComponentX {
  protected viewSize: Size
  protected contentSize: Size
}

export class BlockInputEventsComp extends NoRenderComponentX {}
