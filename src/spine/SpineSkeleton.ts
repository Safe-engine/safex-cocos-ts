import { BaseComponentProps, ComponentX, render } from '..'

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

Object.defineProperty(SpineSkeleton.prototype, 'render', { value: render })
