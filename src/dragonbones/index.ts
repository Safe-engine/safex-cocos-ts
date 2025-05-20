import {
  ComponentAddedEvent,
  ComponentRemovedEvent,
  EntityManager,
  EventManager,
  EventReceive,
  System,
} from 'entityx-ts';

import { EventObject } from '@cocos/dragonbones-js';
import { RefComp } from '../../@types/safex';
import { GameWorld } from '../gworld';
import { NodeComp } from '../gworld/components/NodeComp';
import { ComponentX } from '../gworld/core/decorator';
import { CocosArmatureDisplay } from './cocos/CocosArmatureDisplay';
import { CocosFactory } from './cocos/CocosFactory';

export interface DragonBonesData {
  atlas: string;
  skeleton: string;
  texture: string;
}

interface DragonBonesProps {
  data: DragonBonesData;
  skin?: string;
  animation?: string;
  playTimes?: number;
  timeScale?: number;

  onAnimationStart?: (event: { name: string }) => void;
  onAnimationEnd?: (event: { name: string }) => void;
  onAnimationComplete?: (event: { name: string }) => void;
}
export class DragonBonesComp extends ComponentX<DragonBonesProps & RefComp<DragonBonesComp>, CocosArmatureDisplay> {
  setAnimation(name: string, playTimes = 0) {
    const skel = this.node.instance as CocosArmatureDisplay;
    if (skel.armature) {
      skel.armature.animation.gotoAndPlayByTime(
        name,
        0,
        playTimes
      )
    }
  }

  // setSkeletonData(data: string) {
  //   const skel = this.node.instance as CocosArmatureDisplay;
  //   const atlas = data.replace('.json', '.atlas');
  //   skel.armature.armatureData(data, atlas, this.node.scale);
  // }
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
        const { data, animation, playTimes = 0 } = dbComp.props;
        // const texturePath = atlas.replace('.json', '.png')
        const { atlas, skeleton, texture } = data;
        // cc.textureCache.addImage(texture)
        const factory = CocosFactory.factory;
        const dataSkel = cc.loader.getRes(skeleton);
        const dataAtlas = cc.loader.getRes(atlas);
        const textureCache = cc.textureCache.getTextureForKey(texture);
        // texture.initWithFile(texturePath)
        factory.parseDragonBonesData(dataSkel);
        factory.parseTextureAtlasData(dataAtlas, textureCache);
        // factory.loadDragonBonesData(skel)
        // console.log(skeleton, dataSkel)
        const node = factory.buildArmatureDisplay(
          dataSkel.armature[0].name,
          dataSkel.name
        );
        if (dbComp.props.onAnimationEnd)
          node.armature.eventDispatcher.addDBEventListener(EventObject.COMPLETE, dbComp.props.onAnimationEnd, dbComp)
        if (dbComp.props.onAnimationComplete)
          node.armature.eventDispatcher.addDBEventListener(EventObject.LOOP_COMPLETE, dbComp.props.onAnimationComplete, dbComp)
        // console.log('armature', armature)
        // console.log('node', node);
        // armature.animation.gotoAndPlay('run', 0.2)
        const state = node.armature.animation.gotoAndPlayByTime(
          animation,
          0,
          playTimes
        );
        // console.log('state', state);
        // if (skin) {
        //   node.setSkin(skin)
        // }
        // if (animation) {
        //   dbComp.setAnimation(animation, playTimes)
        // }
        dbComp.node = ett.assign(new NodeComp(node, ett));
        break;
      }

      case ComponentRemovedEvent(DragonBonesComp): {
        // const { component } = event
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
