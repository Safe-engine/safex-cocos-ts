import { BaseComponentProps, ColorSource } from '../../../@types/safex'
import { BLUE, Color4B, RED, Vec2 } from '../../polyfills'
import { ComponentX } from '../core/decorator'
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

// interface SpineSkeletonProps {
//   data: SpineData
//   skin?: string
//   animation?: string
//   timeScale?: number
//   loop?: boolean
// }
// export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>> {
//   data: SpineData
//   skin: string
//   animation: string
//   loop: boolean
//   timeScale: number

//   setAnimation(name: string, loop = false) {
//     const skel: any = this.node.instance
//     if (skel.setAnimation) {
//       skel.setAnimation(0, name, loop)
//     }
//   }

//   setSkeletonData(data: string) {
//     const skel: any = this.node.instance
//     const atlas = data.replace('.json', '.atlas')
//     skel.initWithArgs(data, atlas, this.node.scale)
//   }
// }

interface GraphicsRenderProps {
  lineWidth?: number
  strokeColor?: ColorSource
  fillColor?: ColorSource
}

export class GraphicsRender extends ComponentX<GraphicsRenderProps & BaseComponentProps<GraphicsRender>, cc.DrawNode> {
  lineWidth = 5
  strokeColor = RED
  fillColor = BLUE

  drawDot(x, y, r) {
    this.node.instance.drawDot(cc.p(x, y), r, this.fillColor)
  }

  // drawPoint(position: Vec2, pointSize: Float, color:  Color4B, pointType = PointType.Rect) {

  // }
  // // drawPoints(points: Vec2[], color: Color4B) {
  // // }
  drawLine(origin: Vec2, destination: Vec2, thickness: Float, color: Color4B) {
    this.node.instance.drawSegment(origin, destination, thickness, color)
  }
  drawRect(origin: Vec2, destination: Vec2, color: Color4B) {
    this.node.instance.drawRect(origin, destination, color)
  }
  // drawSolidRect(origin: Vec2, destination: Vec2, color: Color4B) {

  // }
  drawCircle(
    center: Vec2,
    radius: Float,
    angle?: Float,
    segments?: Integer,
    drawLineToCenter?: boolean,
    lineWidth?: Float,
    color?: Color4B,
  ) {
    this.node.instance.drawCircle(center, radius, angle, segments, drawLineToCenter, lineWidth, color)
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
  drawPoly(points: Vec2[], color: Color4B, thickness?: Float) {
    this.node.instance.drawPoly(points, color, thickness)
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
