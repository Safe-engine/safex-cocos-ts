export const SharedSpritesManager = {
  isLoaded: false,
  assets: {},

  loadAssetsOnce: function (texPngUrl) {
    if (this.assets[texPngUrl]) {
      return
    }
    return new Promise((resolve) => {
      const loader = new PIXI.Loader()
      loader.add(texPngUrl).load((loader, resources) => {
        this.assets[texPngUrl] = resources[texPngUrl].texture
        resolve(this.assets[texPngUrl])
      })
    })
  },
}

export const TiledSprite: any = cc.Sprite.extend({
  _tilingSprite: null,
  ctor: function (config) {
    this._super()

    this._canvas = document.createElement('canvas')
    this._canvas.width = config.width || 1024
    this._canvas.height = config.height || 1024

    this._pixiApp = new PIXI.Application({
      view: this._canvas,
      width: this._canvas.width,
      height: this._canvas.height,
      backgroundAlpha: 0, // nền trong suốt
      transparent: true, // bắt buộc để alpha hoạt động
      clearBeforeRender: true, // xoá trước khi vẽ frame mới
      preserveDrawingBuffer: true, // giúp lấy ảnh từ canvas
      antialias: true,
    })

    this._texture = new cc.Texture2D()
    this._texture.initWithElement(this._canvas)
    this._texture.handleLoadedTexture()
    this.initWithTexture(this._texture)

    this._config = config
    this._tilingSprite = null
    SharedSpritesManager.loadAssetsOnce(config.texture).then(() => {
      const texture = PIXI.Texture.from(config.texture)
      this._tilingSprite = new PIXI.TilingSprite(texture, config.width, config.height)
      this._pixiApp.stage.addChild(this._tilingSprite)
      this._updateRepeat()
    })
    // this.schedule(this._updateRepeat, 1)
  },
  setContentSize: function (size, height) {
    // console.log('setContentSize', size, height)
    this._super(size, height)
    this._updateRepeat()
  },

  setScale: function (scaleX, scaleY) {
    this._super(scaleX, scaleY)
    this._updateRepeat()
  },

  _updateRepeat: function () {
    if (this._tilingSprite) {
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
  },

  onExit: function () {
    // this.unschedule(this.updateTexture);
    this._pixiApp.destroy(true, { children: true })
    this._canvas.remove()
    this._super()
  },
})
