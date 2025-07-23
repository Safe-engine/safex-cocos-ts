import { ComponentX } from '../core/decorator'
import { Color4B, Vec2 } from '../polyfills'
import { BaseComponentProps, ColorSource } from '../safex'

export class NodeRender extends ComponentX {
  nodeName: string
}

interface SpriteRenderProps {
  spriteFrame: string
  texType?: number
  type?: number
}

export class SpriteRender extends ComponentX<SpriteRenderProps & BaseComponentProps<SpriteRender>, cc.Sprite> {
  get spriteFrame() {
    return this.props.spriteFrame
  }

  set spriteFrame(frame) {
    this.props.spriteFrame = frame
    if (this.node && this.node.instance instanceof cc.Sprite) {
      this.node.instance.setTexture(frame)
    }
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
  }
}
interface MaskRenderProps {
  type?: number
  segments?: number
  inverted?: boolean
}
export class MaskRender extends ComponentX<MaskRenderProps, cc.ClippingNode> {}

interface ParticleCompProps {
  plistFile: string
}
export class ParticleComp extends ComponentX<ParticleCompProps, cc.ParticleSystem> {}

interface GraphicsRenderProps {
  lineWidth?: number
  strokeColor?: ColorSource
  fillColor?: ColorSource
}

export class GraphicsRender extends ComponentX<GraphicsRenderProps & BaseComponentProps<GraphicsRender>, cc.DrawNode> {
  drawDot(x, y, r) {
    this.node.instance.drawDot(cc.p(x, y), r, this.props.fillColor)
  }

  // drawPoint(position: Vec2, pointSize: Float, color:  Color4B, pointType = PointType.Rect) {

  // }
  // // drawPoints(points: Vec2[], color: Color4B) {
  // // }
  drawLine(origin: Vec2, destination: Vec2, thickness?: Float, color?: Color4B) {
    this.node.instance.drawSegment(origin, destination, thickness || this.props.lineWidth, color || this.props.strokeColor)
  }
  drawRect(origin: Vec2, destination: Vec2, color?: Color4B) {
    this.node.instance.drawRect(origin, destination, color || this.props.fillColor)
  }
  // drawSolidRect(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  drawCircle(center: Vec2, radius: Float, angle = 0, segments = 64, drawLineToCenter = true, lineWidth?: Float, color?: Color4B) {
    this.node.instance.drawCircle(
      center,
      radius,
      angle,
      segments,
      drawLineToCenter,
      lineWidth || this.props.lineWidth,
      color || this.props.fillColor,
    )
  }

  // drawSolidCircle(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  // drawQuadBezier(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  // drawCubicBezier(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  // drawCardinalSpline(points: Vec2[], color: Color4B) {
  // }
  // drawCatmullRom(points: Vec2[], color: Color4B) {
  // }
  drawPoly(points: Vec2[], color?: Color4B, thickness?: Float) {
    this.node.instance.drawPoly(points, color || this.props.fillColor, thickness || this.props.lineWidth)
  }
  // drawSolidPoly(points: Vec2[], color: Color4B) {
  //   this.node.instance.drawPoly(points, color)
  // }
  // drawDot(points: Vec2[], color: Color4B) {
  // }
  // drawSegment(from: Vec2, to: Vec2, color: Color4B) {
  // }
  // drawTriangle(p1: Vec2, p2: Vec2, p3: Vec2, color: Color4B) {
  //   this.node.instance.poly([p1, p2, p3], true)
  //   this.node.instance.fill(color)
  // }

  clear() {
    if (this.node.instance instanceof cc.DrawNode) {
      this.node.instance.clear()
    }
  }
}

interface TiledMapProps {
  mapFile: string
}

export class TiledMap extends ComponentX<TiledMapProps & { $ref?: TiledMap }, cc.TMXTiledMap> {}
