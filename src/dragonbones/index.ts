import {
  ComponentAddedEvent,
  ComponentRemovedEvent,
  EntityManager,
  EventManager,
  EventReceive,
  System,
} from 'entityx-ts';

import { BaseComponentProps } from '../../@types/safex';
import { GameWorld } from '../gworld';
import { NodeComp } from '../gworld/components/NodeComp';
import { ComponentX } from '../gworld/core/decorator';
import { PixiDragonBonesSprite } from './PixiDragonBonesSprite';

export type DragonBonesEventData = { name: string }
export interface DragonBonesData {
  atlas: string;
  skeleton: string;
  texture: string;
}

interface DragonBonesProps {
  data: DragonBonesData;
  skin?: string;
  animation?: string;
  playTimes?: Integer;
  timeScale?: Float;

  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onAnimationComplete?: () => void;
}
interface PixiDragonBonesAnimation {
  lastAnimationName: string
  gotoAndPlayByTime: (name: string, index: number, playTimes?: number) => void
  timeScale: Float
}
interface PixiDragonBonesArmature {
  animation: PixiDragonBonesAnimation
  flipX: boolean
  removeDBEventListener: () => void
  addDBEventListener: (name: string, cb: (event: any) => void, target: any) => void
}
export class DragonBonesComp extends ComponentX<DragonBonesProps & BaseComponentProps<DragonBonesComp>, cc.Node> {
  armature: PixiDragonBonesArmature
  setAnimation(name: string, playTimes = 0) {
    if (this.armature) {
      if (this.armature.animation.lastAnimationName === name) return;
      this.armature.animation.gotoAndPlayByTime(
        name,
        0,
        playTimes
      )
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
    this.armature.flipX = isFlipX
  }

  setTimeScale(timeScale: Float) {
    this.armature.animation.timeScale = timeScale
  }
}

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(DragonBonesComp), this);
    event_manager.subscribe(ComponentRemovedEvent(DragonBonesComp), this);
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(DragonBonesComp): {
        // console.log('DragonBonesComp', event);
        const ett = event.entity;
        const dbComp = event.entity.getComponent(DragonBonesComp);
        const { data, animation, playTimes = 0, timeScale = 1 } = dbComp.props;
        const { atlas, skeleton, texture } = data;
        const dragon = new PixiDragonBonesSprite({
          ske: skeleton,
          texJson: atlas,
          texPng: texture,
          animationName: animation,
          playTimes,
          // width: dataSkel.armature[0].aabb.width,
          // height: dataSkel.armature[0].aabb.height,
        });
        dbComp.armature = dragon._armatureDisplay
        const node: any = new cc.Node()
        node.addChild(dragon)
        // console.log('armature', dbComp.armature)
        dbComp.armature.animation.timeScale = timeScale
        // if (skin) {
        //   node.setSkin(skin)
        // }
        dbComp.node = ett.assign(new NodeComp(node, ett));
        if (dbComp.props.onAnimationStart)
          dbComp.armature.addDBEventListener(dragonBones.EventObject.START, (event: any) => {
            if (dbComp.node.active && dbComp.enabled)
              dbComp.props.onAnimationStart()
          }, dbComp)
        if (dbComp.props.onAnimationEnd)
          dbComp.armature.addDBEventListener(dragonBones.EventObject.COMPLETE, (event: any) => {
            if (dbComp.node.active && dbComp.enabled)
              dbComp.props.onAnimationEnd()
          }, dbComp)
        if (dbComp.props.onAnimationComplete)
          dbComp.armature.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, (event: any) => {
            if (dbComp.node.active && dbComp.enabled)
              dbComp.props.onAnimationComplete()
          }, dbComp)
        break;
      }

      case ComponentRemovedEvent(DragonBonesComp): {
        const { component } = event
        const dbComp = component as DragonBonesComp;
        dbComp.armature.removeDBEventListener()
        break;
      }
      default:
        break;
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number) {
    // console.log('update', dt)
  }
}

export function setupDragonBones() {
  GameWorld.Instance.systems.add(DragonBonesSystem);
  GameWorld.Instance.listUpdate.push(DragonBonesSystem);
  GameWorld.Instance.systems.configureOnce(DragonBonesSystem);
}
