import { WorldClock } from '@cocos/dragonbones-js'
import {
  ComponentAddedEvent,
  ComponentRemovedEvent,
  EntityManager,
  EventManager,
  EventReceive,
  System,
} from 'entityx-ts'

import { GameWorld } from '../gworld'
import { NodeComp } from '../gworld/components/NodeComp'
import { ComponentX } from '../gworld/core/decorator'
import { CocosFactory } from './cocos/CocosFactory'

// import { dragonBones } from './dragonBones'

export class DragonBones extends ComponentX {
  data: string
  atlas: string
  skin: string
  animation: string
  loop: boolean
  timeScale: number

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

export class DragonBonesSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(ComponentAddedEvent(DragonBones), this)
    event_manager.subscribe(ComponentRemovedEvent(DragonBones), this)
    // const factory = CocosFactory.factory;
  }

  receive(type: string, event: EventReceive) {
    switch (type) {
      case ComponentAddedEvent(DragonBones): {
        console.log('DragonBones', event);
        const ett = event.entity
        const dbComp = event.entity.getComponent(DragonBones)
        const { data: skel, atlas, animation, loop, timeScale } = dbComp
        const texturePath = atlas.replace('.json', '.png')
        console.log(skel, atlas, texturePath);
        cc.textureCache.addImage(texturePath)
        const factory = CocosFactory.factory;
        const dataSkel = cc.loader.getRes(skel);
        const dataAtlas = cc.loader.getRes(atlas);
        const texture = cc.textureCache.getTextureForKey(texturePath)
        // texture.initWithFile(texturePath);
        factory.parseDragonBonesData(dataSkel);

        factory.parseTextureAtlasData(dataAtlas, texture);

        // factory.loadDragonBonesData(skel);

        const armature = factory.buildArmature('armatureName');
        // console.log('armature', armature)
        // this.addChild(armature.getDisplay());

        // const texture = cc.TextureCache.getInstance().addImage(texturePath);
        // const textureData = getJsonData('texture.json');
        // const skeletonData = getJsonData('skeleton.json');

        // const factory = new dragonBones.factorys.Cocos2DFactory();
        // factory.addSkeletonData(dragonBones.objects.DataParser.parseSkeletonData(skeletonData));
        // factory.addTextureAtlas(new dragonBones.textures.Cocos2DTextureAtlas(texture, textureData));
        // const armature = factory.buildArmature('Dragon');
        const node = armature.getDisplay();
        console.log('node', node)
        WorldClock.clock.add(armature);
        // armature.animation.gotoAndPlay('walk', 0.2);
        const state = armature.animation.gotoAndPlay(animation, 0, 0, 0);
        console.log('state', state)
        // if (skin) {
        //   node.setSkin(skin)
        // }
        if (animation) {
          // node.setAnimation(0, animation, loop)
        }
        dbComp.node = ett.assign(new NodeComp(node, ett))
        break
      }

      case ComponentRemovedEvent(DragonBones): {
        const { component } = event

        break
      }
      default:
        break
    }
  }
  update(entities: EntityManager, events: EventManager, dt: number) {
    // throw new Error('Method not implemented.');
    // console.log('update', dt)
    WorldClock.clock.advanceTime(dt);
    // CocosFactory.advanceTime(dt);
  }
}

export function setupDragonBones() {
  GameWorld.Instance.systems.add(DragonBonesSystem)
  GameWorld.Instance.listUpdate.push(DragonBonesSystem)
  GameWorld.Instance.systems.configureOnce(DragonBonesSystem)

}
