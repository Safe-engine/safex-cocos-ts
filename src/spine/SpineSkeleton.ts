import { BaseComponentProps, ComponentX, render } from '..'
import { PixiSpineSprite } from './PixiSpineSprite'

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
}
export class SpineSkeleton extends ComponentX<SpineSkeletonProps & BaseComponentProps<SpineSkeleton>, cc.Node> {
  spine: PixiSpineSprite

  setAnimation(name: string, loop = false) {
    const skel = this.spine
    if (skel._armatureDisplay.state.setAnimation) {
      skel._armatureDisplay.state.setAnimation(0, name, loop)
    }
  }

  // setSkeletonData(data: SpineData) {
  //   const skel = this.node.instance
  //   const { atlas, skeleton } = data
  //   skel._armatureDisplay.
  // }
}

Object.defineProperty(SpineSkeleton.prototype, 'render', { value: render })
