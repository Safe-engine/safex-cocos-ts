import { EventObject } from 'dragonbones-pixijs'
import { EntityManager, EventManager, EventTypes, System } from 'entityx-ts'

import { NodeComp } from '../core/NodeComp'
import { DragonBonesComp } from './DragonBonesComp'
import { PixiDragonBonesSprite } from './PixiDragonBonesSprite'

export type DragonBonesEventData = { name: string }

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, DragonBonesComp, async ({ entity }) => {
      const dbComp = entity.getComponent(DragonBonesComp)
      const { data, animation, playTimes = 0, timeScale = 1 } = dbComp.props
      const { atlas, skeleton, texture } = data
      const dragon = new PixiDragonBonesSprite({
        skeleton,
        atlas,
        texture,
        animationName: animation,
        playTimes,
        // width: dataSkel.armature[0].aabb.width,
        // height: dataSkel.armature[0].aabb.height,
      })
      dbComp.armature = dragon._armatureDisplay
      dbComp.dragon = dragon
      // console.log('armature', dbComp.armature)
      dbComp.armature.animation.timeScale = timeScale
      const node = new cc.Node()
      node.addChild(dragon)
      dbComp.node = entity.assign(new NodeComp(node, entity))
      if (dbComp.props.onAnimationStart)
        dbComp.armature.addDBEventListener(
          EventObject.START,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationStart()
          },
          dbComp,
        )
      if (dbComp.props.onAnimationEnd)
        dbComp.armature.addDBEventListener(
          EventObject.COMPLETE,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationEnd()
          },
          dbComp,
        )
      if (dbComp.props.onAnimationComplete)
        dbComp.armature.addDBEventListener(
          EventObject.LOOP_COMPLETE,
          () => {
            if (dbComp.node.active && dbComp.enabled) dbComp.props.onAnimationComplete()
          },
          dbComp,
        )
    })
    event_manager.subscribe(EventTypes.ComponentRemoved, DragonBonesComp, ({ component }) => {
      const dbComp = component as DragonBonesComp
      // dbComp.armature.removeDBEventListener()
      dbComp.armature.destroy()
      // console.log('remove dragonbones component', dbComp.node.entity.id)
    })
  }

  // update(entities: EntityManager, events: EventManager, dt: number)
  update(entities: EntityManager) {
    const animations = entities.entities_with_components(DragonBonesComp)
    animations.forEach((ett) => {
      const dbComp = ett.getComponent(DragonBonesComp)
      if (dbComp.node && dbComp.node.active) {
        // console.log(' dragonbones updateTexture', dbComp.node.entity.id)
        dbComp.dragon.updateTexture()
      }
    })
  }
}
