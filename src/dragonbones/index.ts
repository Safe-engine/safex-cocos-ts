import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { GameWorld } from '../gworld'
import { NodeComp } from '../gworld/NodeComp'
import { ComponentX } from '../gworld/decorator'
import { BaseComponentProps } from '../safex'
import { PixiDragonBonesSprite } from './PixiDragonBonesSprite'

export type DragonBonesEventData = { name: string }
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
interface PixiDragonBonesAnimation {
  lastAnimationName: string
  gotoAndPlayByTime: (name: string, index?: number, playTimes?: number) => void
  play: (name: string, index?: number, playTimes?: number) => void
  timeScale: Float
}
interface PixiDragonBonesArmature {
  animation: PixiDragonBonesAnimation
  _armature: {
    flipX: boolean
  }
  removeDBEventListener: () => void
  addDBEventListener: (name: string, cb: (event: any) => void, target: any) => void
}
export class DragonBonesComp extends ComponentX<DragonBonesProps & BaseComponentProps<DragonBonesComp>, cc.Node> {
  armature: PixiDragonBonesArmature
  dragon: any
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

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, DragonBonesComp, ({ entity }) => {
      const dbComp = entity.getComponent(DragonBonesComp)
      const { data, animation, playTimes = 0, timeScale = 1 } = dbComp.props
      const { atlas, skeleton, texture } = data
      const dragon = new PixiDragonBonesSprite({
        ske: skeleton,
        texJson: atlas,
        texPng: texture,
        animationName: animation,
        playTimes,
        // width: dataSkel.armature[0].aabb.width,
        // height: dataSkel.armature[0].aabb.height,
      })
      dbComp.dragon = dragon
      dbComp.armature = dragon._armatureDisplay
      const node: any = new cc.Node()
      node.addChild(dragon)
      // console.log('armature', dbComp.armature)
      dbComp.armature.animation.timeScale = timeScale
      // if (skin) {
      //   node.setSkin(skin)
      // }
      dbComp.node = entity.assign(new NodeComp(node, entity))
      if (dbComp.props.onAnimationStart)
        dbComp.armature.addDBEventListener(
          dragonBones.EventObject.START,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationStart()
          },
          dbComp,
        )
      if (dbComp.props.onAnimationEnd)
        dbComp.armature.addDBEventListener(
          dragonBones.EventObject.COMPLETE,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationEnd()
          },
          dbComp,
        )
      if (dbComp.props.onAnimationComplete)
        dbComp.armature.addDBEventListener(
          dragonBones.EventObject.LOOP_COMPLETE,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationComplete()
          },
          dbComp,
        )
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, DragonBonesComp, ({ component }) => {
      const dbComp = component as DragonBonesComp
      dbComp.armature.removeDBEventListener()
      dbComp.node.removeAllChildren()
    })
  }

  // update(entities: EntityManager, events: EventManager, dt: number)
  update(entities: EntityManager) {
    // console.log('update', dt)
    const animations = entities.entities_with_components(DragonBonesComp)
    // cc.log(animations);
    animations.forEach((ett) => {
      const dbComp = ett.getComponent(DragonBonesComp)
      if (dbComp.node && dbComp.node.active) {
        dbComp.dragon.updateTexture()
      }
    })
  }
}

export function setupDragonBones(world: GameWorld) {
  world.systems.add(DragonBonesSystem)
  world.listUpdate.push(DragonBonesSystem)
  world.systems.configureOnce(DragonBonesSystem)
}
