import { PixiArmatureDisplay, PixiFactory } from 'dragonbones-pixijs'
import { Application, Assets } from 'pixi.js'

export function loadDragonBonesAssets(skeleton, atlas, texture) {
  // console.log('loadDragonBonesAssets', skeleton, atlas, texture)
  return Assets.load([skeleton, atlas, texture])
}
export class PixiDragonBonesSprite extends cc.Sprite {
  _canvas: any
  _pixiApp: Application
  _texture: cc.Texture2D
  _config
  _armatureDisplay: PixiArmatureDisplay
  constructor(config) {
    super()
    super.ctor() // always call this for compatibility with cocos2dx JS Javascript class system
    this._canvas = document.createElement('canvas')
    this._canvas.width = config.width || 1024
    this._canvas.height = config.height || 1024

    this._pixiApp = new Application()
    this._pixiApp.init({
      view: this._canvas,
      width: this._canvas.width,
      height: this._canvas.height,
      backgroundAlpha: 0, // nền trong suốt
      // transparent: true, // bắt buộc để alpha hoạt động
      clearBeforeRender: true, // xoá trước khi vẽ frame mới
      preserveDrawingBuffer: true, // giúp lấy ảnh từ canvas
      antialias: true,
    })

    this._texture = new cc.Texture2D()
    this._texture.initWithElement(this._canvas as any)
    this._texture.handleLoadedTexture()
    this.initWithTexture(this._texture)

    this._config = config
    this._armatureDisplay = null
    this._setupArmature()

    // this.schedule(this.updateTexture, 1 / 30);
  }

  _setupArmature() {
    const { skeleton, atlas, texture, playTimes, animationName, scale = 1 } = this._config
    const factory = PixiFactory.factory
    const atlasAsset = Assets.get(atlas)
    const dragonData = factory.parseDragonBonesData(Assets.get(skeleton), atlasAsset.name)
    factory.parseTextureAtlasData(Assets.get(atlas), Assets.get(texture), atlasAsset.name)
    const { armatureNames } = dragonData
    const armatureName = armatureNames[0]
    const display = factory.buildArmatureDisplay(armatureName, atlasAsset.name)
    if (!display) {
      console.error('Cannot build armature:', armatureName)
      return
    }

    display.animation.play(animationName, playTimes)
    display.x = this._canvas.width / 2
    display.y = this._canvas.height / 2
    display.scale.set(scale)

    this._pixiApp.stage.addChild(display)
    this._armatureDisplay = display
  }

  updateTexture() {
    if (this._armatureDisplay && this._pixiApp.renderer && this._pixiApp.stage) {
      this._pixiApp.renderer.render(this._pixiApp.stage)
      this._texture.initWithElement(this._canvas)
      this._texture.handleLoadedTexture()
      this.setTexture(this._texture)
    }
  }

  onExit() {
    // this.unschedule(this.updateTexture);
    this._pixiApp.destroy(true, { children: true })
    this._canvas.remove()
    this._armatureDisplay.destroy()
    this._armatureDisplay = null
    super.onExit()
  }
}
