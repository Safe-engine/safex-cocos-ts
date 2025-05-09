import {
  ComponentAddedEvent,
  ComponentRemovedEvent,
  EntityManager,
  EventManager,
  EventReceive,
  System,
} from 'entityx-ts';

import { GameWorld } from '../gworld';
import { NodeComp } from '../gworld/components/NodeComp';
import { ComponentX } from '../gworld/core/decorator';
import { CocosFactory } from './cocos/CocosFactory';

interface DragonBonesData {
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
export class DragonBones extends ComponentX<DragonBonesProps> {
  setAnimation(name: string, loop = false) {
    const skel: any = this.node.instance;
    if (skel.setAnimation) {
      skel.setAnimation(0, name, loop);
    }
  }

  setSkeletonData(data: string) {
    const skel: any = this.node.instance;
    const atlas = data.replace('.json', '.atlas');
    skel.initWithArgs(data, atlas, this.node.scale);
  }
}

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(DragonBones), this);
    event_manager.subscribe(ComponentRemovedEvent(DragonBones), this);
    CocosFactory.newInstance();
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(DragonBones): {
        console.log('DragonBones', event);
        const ett = event.entity;
        const dbComp = event.entity.getComponent(DragonBones);
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
        // console.log('armature', armature)
        console.log('node', node);
        // armature.animation.gotoAndPlay('run', 0.2)
        const state = node.armature.animation.gotoAndPlayByTime(
          animation,
          0,
          playTimes
        );
        console.log('state', state);
        // if (skin) {
        //   node.setSkin(skin)
        // }
        if (animation) {
          // node.setAnimation(0, animation, playTimes)
        }
        dbComp.node = ett.assign(new NodeComp(node, ett));
        break;
      }

      case ComponentRemovedEvent(DragonBones): {
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
