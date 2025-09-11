import { Application, Assets, Texture, TilingSprite } from 'pixi.js'

export class TiledSprite extends cc.Sprite {
  _tilingSprite: TilingSprite
  _canvas: any
  _pixiApp: Application
  _texture: cc.Texture2D

  constructor(config) {
    super()
    super.ctor()

    this._canvas = document.createElement('canvas')
    this._canvas.width = config.width || 1024
    this._canvas.height = config.height || 1024

    this._pixiApp = new Application()
    this._pixiApp
      .init({
        view: this._canvas,
        width: this._canvas.width,
        height: this._canvas.height,
        backgroundAlpha: 0, // nền trong suốt
        // transparent: true, // bắt buộc để alpha hoạt động
        clearBeforeRender: true, // xoá trước khi vẽ frame mới
        preserveDrawingBuffer: true, // giúp lấy ảnh từ canvas
        antialias: true,
      })
      .then(() => {
        Assets.load(config.texture).then(() => {
          const texture = Texture.from(config.texture)
          const { width, height } = config
          this._tilingSprite = new TilingSprite({ texture, width, height })
          this._pixiApp.stage.addChild(this._tilingSprite)
          this._updateRepeat()
        })
      })

    this._texture = new cc.Texture2D()
    this._texture.initWithElement(this._canvas)
    this._texture.handleLoadedTexture()
    this.initWithTexture(this._texture)
    // this.schedule(this._updateRepeat, 1, Infinity, 0)
  }
  setContentSize(size, height) {
    // console.log('setContentSize', size, height)
    super.setContentSize(size, height)
    this._updateRepeat()
  }

  setScale(scaleX, scaleY?) {
    super.setScale(scaleX, scaleY)
    this._updateRepeat()
  }

  _updateRepeat() {
    if (this._tilingSprite && this._pixiApp.renderer) {
      this._tilingSprite.width = this.width
      this._tilingSprite.height = this.height
      this._canvas.width = this.width
      this._canvas.height = this.height
      // console.log('_updateRepeat', this._pixiApp, this._tilingSprite)
      this._pixiApp.renderer.render(this._pixiApp.stage)
      this._texture.initWithElement(this._canvas)
      this._texture.handleLoadedTexture()
      // console.log('_texture', this._texture, this)
      this.setTexture(this._texture)
    }
  }

  onExit() {
    this.unschedule(this._updateRepeat)
    this._pixiApp.destroy(true, { children: true })
    this._canvas.remove()
    super.onExit()
  }
}
