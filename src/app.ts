import { setupDragonBones } from './dragonbones'
import { GameWorld } from './gworld'
import { CollideSystem } from './gworld/systems/CollideSystem'
import { GUISystem } from './gworld/systems/GUISystem'
import { NoRenderSystem } from './gworld/systems/NoRenderSystem'
import { RenderSystem } from './gworld/systems/RenderSystem'

export function initWorld() {
  GameWorld.Instance.systems.add(RenderSystem)
  // GameWorld.Instance.systems.add(PhysicsSystem)
  GameWorld.Instance.systems.add(CollideSystem)
  GameWorld.Instance.systems.add(GUISystem)
  GameWorld.Instance.systems.add(NoRenderSystem)
  // GameWorld.Instance.listUpdate.push(PhysicsSystem)
  GameWorld.Instance.listUpdate.push(CollideSystem)
  GameWorld.Instance.systems.configureOnce(RenderSystem)
  // GameWorld.Instance.systems.configureOnce(PhysicsSystem)
  GameWorld.Instance.systems.configureOnce(CollideSystem)
  GameWorld.Instance.systems.configureOnce(GUISystem)
  GameWorld.Instance.systems.configureOnce(NoRenderSystem)
  setupDragonBones()
}

export function startGame(option: cc.RunOptions, designedResolution, cb) {
  const { width, height } = designedResolution
  class BootScene extends cc.Scene {
    constructor() {
      // 1. super init first
      super()
      super.ctor() // always call this for compatibility with cocos2dx JS Javascript class system
      this.scheduleUpdate()
    }
    onEnter() {
      super.onEnter()
      cb()
    }

    update(dt) {
      GameWorld.Instance.update(dt)
    }
  }

  cc._isContextMenuEnable = true

  cc.game.run(option, function onStart() {
    // Pass true to enable retina display, disabled by default to improve performance
    cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS)
    // Adjust viewport meta
    cc.view.adjustViewPort(true)
    // Setup the resolution policy and design resolution size
    const policy = width > height ? cc.ResolutionPolicy.FIXED_HEIGHT : cc.ResolutionPolicy.FIXED_WIDTH
    cc.view.setDesignResolutionSize(width, height, policy)
    // The game will be resized when browser size change
    cc.view.resizeWithBrowserSize(true)
    cc.director.runScene(new BootScene())
  })
}

export function loadAll(assets: string[] = [], cb: (progress: number) => void) {
  cc.loader.load(
    assets.map((value) => {
      if (value.endsWith('.ttf')) {
        return {
          type: 'font',
          name: cc.path.basename(value, '.ttf'),
          srcs: [value],
        }
      }
      return value
    }),
    function (result, count, loadedCount) {
      // console.log(result)
      if (result instanceof cc.Texture2D) {
        // cc.textureCache.addImage(result.url)
        const frame = new cc.SpriteFrame(result.url, cc.rect(0, 0, result.getPixelsWide(), result.getPixelsHigh()))
        // console.log('cc.Texture2D', result, frame)
        cc.spriteFrameCache.addSpriteFrame(frame, result.url)
      }
      let percent = loadedCount / count
      percent = Math.min(percent, 1)
      cb(percent)
    },
    function () {
      setTimeout(cb, 500, 1)
    },
  )
}

export function loadJsonFromCache<T>(filePath: string): T {
  const res = cc.loader.getRes(filePath)
  // console.log(filePath, res)
  return res
}

export const audioEngine = cc.audioEngine
