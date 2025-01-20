import { ColorSource, GraphicsRenderProps, SpriteRenderProps } from '../../../@types/safex'
import { Vec2 } from '../../polyfills'
import { ComponentX } from '../core/decorator'
export class NodeRender extends ComponentX {
  nodeName: string
}

export class SpriteRender extends ComponentX<cc.Sprite> {
  spriteFrame: string
  texType: number
  type: number

  constructor(props: SpriteRenderProps) {
    super(props)
  }

  getSpriteFrame() {
    return this.spriteFrame
  }

  setSpriteFrame(frame) {
    this.spriteFrame = frame
    // if (this.node.instance instanceof cc.Sprite) {
    this.node.instance.setTexture(frame)
    // } else if (this.node.instance instanceof ccui.ImageView) {
    //   if (this.texType) {
    //     this.node.instance.loadTexture(frame, this.texType)
    //   } else {
    //     this.node.instance.loadTexture(frame)
    //   }
    //   const sprite = new cc.Sprite(frame)
    //   this.node.setContentSize(sprite.getContentSize())
    // } else if (this.node.instance instanceof ccui.Button) {
    //   this.node.instance.loadTextureNormal(frame)
    // }
  }
}

export class MaskRender extends ComponentX<cc.ClippingNode> {
  type: number
  segments: number
  inverted: boolean
}

export class ParticleComp extends ComponentX<cc.ParticleSystem> {
  plistFile: string
}

export class SpineSkeleton extends ComponentX {
  data: string
  skin: string
  animation: string
  loop: boolean
  timeScale: number

  setAnimation(name: string, loop = false) {
    const skel: any = this.node.instance
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop)
    }
  }

  setSkeletonData(data: string) {
    const skel: any = this.node.instance
    const atlas = data.replace('.json', '.atlas')
    skel.initWithArgs(data, atlas, this.node.scale)
  }
}

export class GraphicsRender extends ComponentX<cc.DrawNode> {
  lineWidth: number
  strokeColor: ColorSource
  fillColor: ColorSource
  from: Vec2
  constructor(props: GraphicsRenderProps) {
    super(props)
  }

  circle(x, y, r) {
    if (this.node.instance instanceof cc.DrawNode) {
      this.node.instance.drawDot(cc.p(x, y), r, this.fillColor)
    }
  }

  moveTo(x, y) {
    this.from = Vec2(x, y)
  }

  lineTo(x, y) {
    if (this.node.instance instanceof cc.DrawNode) {
      this.node.instance.drawSegment(this.from, cc.p(x, y), this.lineWidth, this.strokeColor)
    }
  }

  fill() { }

  stroke() { }

  clear() {
    if (this.node.instance instanceof cc.DrawNode) {
      this.node.instance.clear()
    }
  }
}
