import { ComponentX } from '../core/decorator'
import { BaseComponentProps } from '../safex'
import { HtmlTextParser } from './html-text-parser'

const _htmlTextParser = new HtmlTextParser()

interface RichTextCompProps {
  font?: string
  string?: string
  size?: number
}

export class RichTextComp extends ComponentX<RichTextCompProps & BaseComponentProps<RichTextComp>, ccui.RichText> {
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
        console.log('richText', richText)
        // this.node.instance._addNewLine()
        // }
        this.node.instance.pushBackElement(richText)
      }
    }
  }
}
