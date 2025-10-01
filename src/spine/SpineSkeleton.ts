import { BaseComponentProps, ComponentX, render } from '..'
import { SkeletonAnimation } from './spine-cocos/CCSkeletonAnimation'

export interface SpineData {
  atlas: string
  skeleton: string
  texture?: string
}

interface SpineSkeletonProps {
  data: SpineData
  skin?: string
  animation?: string
  timeScale?: number
  loop?: boolean
  onAnimationComplete?
}
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>, SkeletonAnimation> {
  set scaleX(flip: number) {
    const skel = this.node.instance
    skel._skeleton.scaleX = flip
  }
  getAnimationName() {
    const skel = this.node.instance
    return skel.getState().getCurrent(0).animation.name
  }
  setAnimation(name: string, loop = false) {
    const skel = this.node.instance
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop)
    }
  }

  // setSkeletonData(data: string) {
  //   const skel = this.node.instance
  //   const atlas = data.replace('.json', '.atlas')
  //   skel.initWithArgs(data, atlas, this.node.scale)
  // }
}

Object.defineProperty(SpineSkeleton.prototype, 'render', { value: render })
