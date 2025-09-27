import { PixiArmatureDisplay } from 'dragonbones-pixijs'

import { ComponentX, render } from '../core/decorator'
import { BaseComponentProps } from '../safex'
import { PixiDragonBonesSprite } from './PixiDragonBonesSprite'

export interface DragonBonesData {
  atlas: string
  skeleton: string
  texture: string
}

interface DragonBonesProps {
  data: DragonBonesData
  skin?: string
  animation?: string
  playTimes?: Integer
  timeScale?: Float

  onAnimationStart?: () => void
  onAnimationEnd?: () => void
  onAnimationComplete?: () => void
}

export class DragonBonesComp extends ComponentX<DragonBonesProps & BaseComponentProps<DragonBonesComp>, cc.Node> {
  armature: PixiArmatureDisplay
  dragon: PixiDragonBonesSprite

  setAnimation(name: string, playTimes = 0) {
    if (this.armature) {
      if (this.armature.animation.lastAnimationName === name) return
      this.armature.animation.gotoAndPlayByTime(name, 0, playTimes)
    }
  }

  getAnimationName() {
    return this.armature.animation.lastAnimationName
  }

  // setSkeletonData(data: string) {
  //   const skel = this.node.instance as CocosArmatureDisplay;
  //   const atlas = data.replace('.json', '.atlas');
  //   skel.armature.armatureData(data, atlas, this.node.scale);
  // }
  setFLipX(isFlipX: boolean) {
    this.armature._armature.flipX = isFlipX
  }

  setTimeScale(timeScale: Float) {
    this.armature.animation.timeScale = timeScale
  }
}

Object.defineProperty(DragonBonesComp.prototype, 'render', { value: render })
