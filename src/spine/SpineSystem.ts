import { EventManager, EventReceiveCallback, EventTypes, System } from 'entityx-ts'

import { AtlasAttachmentLoader, SkeletonBinary, TextureAtlas } from '@esotericsoftware/spine-core'
import { NodeComp } from '../core/NodeComp'
import { SpineSkeleton } from './SpineSkeleton'
import { _atlasLoader, SkeletonAnimation } from './spine-cocos/CCSkeletonAnimation'

export class SpineSystem implements System {
  configure(event_manager: EventManager) {
    event_manager.subscribe(EventTypes.ComponentAdded, SpineSkeleton, this.onAddSpineSkeleton)
  }
  private onAddSpineSkeleton: EventReceiveCallback<SpineSkeleton> = async ({ entity, component: spineComp }) => {
    const { data, skin, animation, loop = true, timeScale = 1 } = spineComp.props
    const { atlas: argAtlasFile, skeleton } = data
    // console.log('spineComp', data)
    let node: typeof SkeletonAnimation
    if (skeleton.endsWith('.json')) {
      node = SkeletonAnimation.createWithJsonFile(skeleton, argAtlasFile, timeScale)
    } else {
      const dataTex = cc.loader.getRes(argAtlasFile)
      _atlasLoader.setAtlasFile(argAtlasFile)
      const atlas = new TextureAtlas(dataTex)
      for (const page of atlas.pages) {
        const texture = _atlasLoader.load(page.name)
        page.setTexture(texture)
      }
      const attachmentLoader = new AtlasAttachmentLoader(atlas)
      const skeletonJsonReader = new SkeletonBinary(attachmentLoader)
      const skeletonJson = cc.loader.getRes(skeleton)
      const skeletonData = skeletonJsonReader.readSkeletonData(skeletonJson)
      node = SkeletonAnimation.create(skeletonData)
    }
    if (skin) {
      node.setSkin(skin)
    }
    if (animation) {
      node.setAnimation(0, animation, loop)
    }
    spineComp.node = entity.assign(new NodeComp(node, entity))
  }
  // update(entities: EntityManager) {
  //   const animations = entities.entities_with_components(SpineSkeleton)
  //   animations.forEach((ett) => {
  //     const spine = ett.getComponent(SpineSkeleton)
  //     if (spine.node && spine.node.active) {
  //       spine.spine.updateTexture()
  //     }
  //   })
  // }
}
