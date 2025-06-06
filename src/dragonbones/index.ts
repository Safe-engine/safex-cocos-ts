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
import { CocosArmatureDisplay } from './cocos/CocosArmatureDisplay';
import { CocosFactory } from './cocos/CocosFactory';
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
export class DragonBonesComp extends ComponentX<DragonBonesProps & BaseComponentProps<DragonBonesComp>, CocosArmatureDisplay> {
  setAnimation(name: string, playTimes = 0) {
    const skel = this.node.instance as CocosArmatureDisplay;
    if (skel.armature) {
      if (skel.armature.animation.lastAnimationName === name) return;
      skel.armature.animation.gotoAndPlayByTime(
        name,
        0,
        playTimes
      )
    }
  }

  getAnimationName() {
    const skel = this.node.instance as CocosArmatureDisplay;
    return skel.armature.animation.lastAnimationName
  }

  // setSkeletonData(data: string) {
  //   const skel = this.node.instance as CocosArmatureDisplay;
  //   const atlas = data.replace('.json', '.atlas');
  //   skel.armature.armatureData(data, atlas, this.node.scale);
  // }
  setFLipX(isFlipX) {
    const skel = this.node.instance as CocosArmatureDisplay;
    skel.armature.flipX = isFlipX
  }

  setTimeScale(timeScale: Float) {
    const skel = this.node.instance as CocosArmatureDisplay;
    skel.armature.animation.timeScale = timeScale
  }
}

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(DragonBonesComp), this);
    event_manager.subscribe(ComponentRemovedEvent(DragonBonesComp), this);
    CocosFactory.newInstance();
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(DragonBonesComp): {
        // console.log('DragonBonesComp', event);
        const ett = event.entity;
        const dbComp = event.entity.getComponent(DragonBonesComp);
        const { data, animation, playTimes = 0, timeScale = 1 } = dbComp.props;
        // const texturePath = atlas.replace('.json', '.png')
        const { atlas, skeleton, texture } = data;
        // cc.textureCache.addImage(texture)
        // const factory = CocosFactory.factory;
        // const dataSkel = cc.loader.getRes(skeleton);
        // const dataAtlas = cc.loader.getRes(atlas);
        // const textureCache = cc.textureCache.getTextureForKey(texture);
        // factory.parseDragonBonesData(dataSkel);
        // factory.parseTextureAtlasData(dataAtlas, textureCache);
        // factory.loadDragonBonesData(skel)
        // console.log(skeleton, dataSkel)
        // const node = factory.buildArmatureDisplay(
        //   dataSkel.armature[0].name,
        //   dataSkel.name
        // );
        const dragon = new PixiDragonBonesSprite({
          ske: skeleton,
          texJson: atlas,
          texPng: texture,
          animationName: animation,
          // width: dataSkel.armature[0].aabb.width,
          // height: dataSkel.armature[0].aabb.height,
        });
        const node: any = new cc.Node()
        // const { x, y } = dataSkel.armature[0].aabb
        // dragon.setPosition(cc.p(0, -y))
        node.addChild(dragon)
        // console.log('armature', node._armatureDisplay)
        // console.log('node', node);
        // const armature = node._armatureDisplay._armature
        // // armature.animation.gotoAndPlay('run', 0.2)
        // armature.animation.timeScale = timeScale
        // if (animation) {
        //   const state = armature.animation.gotoAndPlayByTime(
        //     animation,
        //     0,
        //     playTimes
        //   );
        // }
        // console.log('state', state);
        // if (skin) {
        //   node.setSkin(skin)
        // }
        dbComp.node = ett.assign(new NodeComp(node, ett));
        // if (dbComp.props.onAnimationStart)
        //   node.armature.eventDispatcher.addDBEventListener(EventObject.START, (event: EventObject) => {
        //     if (dbComp.node.active && dbComp.enabled)
        //       dbComp.props.onAnimationStart()
        //   }, dbComp)
        // if (dbComp.props.onAnimationEnd)
        //   node.armature.eventDispatcher.addDBEventListener(EventObject.COMPLETE, (event: EventObject) => {
        //     if (dbComp.node.active && dbComp.enabled)
        //       dbComp.props.onAnimationEnd()
        //   }, dbComp)
        // if (dbComp.props.onAnimationComplete)
        //   node.armature.eventDispatcher.addDBEventListener(EventObject.LOOP_COMPLETE, (event: EventObject) => {
        //     if (dbComp.node.active && dbComp.enabled)
        //       dbComp.props.onAnimationComplete()
        //   }, dbComp)
        break;
      }

      case ComponentRemovedEvent(DragonBonesComp): {
        const { component } = event
        const dbComp = component as DragonBonesComp;
        const skel = dbComp.node.instance as CocosArmatureDisplay;
        skel.events = {}
        break;
      }
      default:
        break;
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number) {
    // throw new Error('Method not implemented.')
    // console.log('update', dt)
    CocosFactory.advanceTime(dt);
  }
}

export function setupDragonBones() {
  GameWorld.Instance.systems.add(DragonBonesSystem);
  GameWorld.Instance.listUpdate.push(DragonBonesSystem);
  GameWorld.Instance.systems.configureOnce(DragonBonesSystem);
}
