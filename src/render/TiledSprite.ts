import { tieldFsh, tiledVsh } from './shader'

export class TiledSpriteNode extends cc.Sprite {
  _program: cc.GLProgram
  _tileScaleLoc: WebGLUniformLocation
  _texSizeLoc: WebGLUniformLocation
  _texLoc: WebGLUniformLocation
  _scaleLoc: WebGLUniformLocation
  _sizeLoc: WebGLUniformLocation

  constructor(file) {
    super()
    ;(super.ctor as any)(file)
    this.initShader()
  }

  initShader() {
    const program = new cc.GLProgram()
    program.initWithVertexShaderByteArray(tiledVsh, tieldFsh)
    program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION)
    program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR)
    program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS)
    program.link()
    program.updateUniforms()

    program.use()
    this._program = program
    this.setShaderProgram(program)

    // Lưu lại uniform location để update nhanh
    this._tileScaleLoc = program.getUniformLocationForName('u_tileScale')
    this._texSizeLoc = program.getUniformLocationForName('u_texSize')
    this._texLoc = program.getUniformLocationForName('u_texture')
    this._scaleLoc = program.getUniformLocationForName('u_scale')
    this._sizeLoc = program.getUniformLocationForName('u_size')

    this.scheduleUpdate()
  }

  updateShaderUniforms() {
    if (!this._program || !this.texture || !this.texture.isLoaded()) return

    const texW = this.texture.width
    const texH = this.texture.height
    const size = this.getContentSize()
    // console.log('TiledSprite updateShaderUniforms', size, texW, texH)
    const scaleX = size.width / texW
    const scaleY = size.height / texH

    this._program.use()
    this._program.setUniformLocationWith2f(this._tileScaleLoc, scaleX, scaleY)
    this._program.setUniformLocationWith2f(this._texSizeLoc, texW, texH)
    this._program.setUniformLocationWith1i(this._texLoc, 0)
    this._program.setUniformLocationWith2f(this._scaleLoc, scaleX, scaleY)
    this._program.setUniformLocationWith2f(this._sizeLoc, size.width, size.height)
  }

  setContentSize(w, h) {
    super.setContentSize(w, h)
    this.updateShaderUniforms()
  }
}

export function createTiledSprite(src: string, totalW: number, totalH: number) {
  const tileSprite = new TiledSpriteNode(src)
  function afterLoaded() {
    tileSprite.setContentSize(totalW, totalH)
    // console.log('createTiledSprite', src, totalW, totalH, tileSprite)
  }
  if (tileSprite.texture._textureLoaded) afterLoaded()
  else tileSprite.texture.addLoadedEventListener(afterLoaded)
  return tileSprite
}
