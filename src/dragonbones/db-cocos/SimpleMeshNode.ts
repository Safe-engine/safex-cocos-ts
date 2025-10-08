// cc.SimpleMeshNode.js
// SimpleMesh as a cc.Node for Cocos2d-html5 (WebGL primary).
// Usage:
//   var node = new cc.SimpleMeshNode(texture, verts, uvs, inds);
//   node.setPosition(x,y); node.setRotation(angleDeg); node.setScale(s);

export const SimpleMeshNode = cc.Node.extend({
  // public mesh data (Float32Array / Uint16Array)
  _texture: null,
  _vertices: null,
  _uvs: null,
  _indices: null,

  // GL internals
  _gl: null,
  _program: null,
  _vbo: null,
  _uvbo: null,
  _ibo: null,
  _needsUpload: true,
  _alpha: 1.0,

  // fallback drawnode for Canvas or debug
  _fallbackDraw: null,
  _useWebGL: true,

  ctor: function (texture, vertices, uvs, indices) {
    cc.Node.prototype.ctor.call(this)
    this._texture = texture || null
    this._vertices = vertices || new Float32Array(0)
    this._uvs = uvs || new Float32Array(0)
    this._indices = indices || new Uint16Array(0)

    this._fallbackDraw = new cc.DrawNode()
    this._useWebGL = !!cc._renderContext

    // size/anchor auto-estimate from vertex bounds (optional)
    this._updateContentSizeFromVertices()
  },

  // helper to estimate contentSize and anchor if needed
  _updateContentSizeFromVertices: function () {
    if (!this._vertices || this._vertices.length < 2) return
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY
    for (let i = 0; i < this._vertices.length; i += 2) {
      const x = this._vertices[i],
        y = this._vertices[i + 1]
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    if (minX === Infinity) return
    this.setContentSize(maxX - minX, maxY - minY)
    // set anchor relative to local coordinates (default 0,0), keep at 0,0 for compatibility
  },

  setVertices: function (verts) {
    this._vertices = verts
    this._needsUpload = true
    this._updateContentSizeFromVertices()
  },

  setUVs: function (uvs) {
    this._uvs = uvs
    this._needsUpload = true
  },

  setIndices: function (inds) {
    this._indices = inds
    this._needsUpload = true
  },

  setTexture: function (tex) {
    this._texture = tex
  },

  // override visit to draw mesh at correct point in scene graph
  visit: function (ctx) {
    // normal visit to draw children etc.
    cc.Node.prototype.visit.call(this, ctx)

    // draw our mesh after node's transform is applied (so position/rotation/scale are final)
    // Note: calling AFTER visit ensures it's rendered on top of children; change if you want otherwise.
    this._drawMesh()
  },

  // core drawing function
  _drawMesh: function () {
    if (this._useWebGL && cc._renderContext) {
      this._drawMeshWebGL()
    } else {
      this._drawMeshCanvasFallback()
    }
  },

  _ensureGL: function () {
    if (this._gl && this._program) return
    const gl = cc._renderContext
    if (!gl) {
      this._useWebGL = false
      return
    }
    this._gl = gl

    const vsSrc = [
      'attribute vec2 a_position;',
      'attribute vec2 a_texcoord;',
      'uniform mat3 u_model;',
      'uniform vec2 u_resolution;',
      'varying vec2 v_uv;',
      'void main() {',
      '  vec2 pos = (u_model * vec3(a_position, 1.0)).xy;',
      '  vec2 zeroToOne = pos / u_resolution;',
      '  vec2 zeroToTwo = zeroToOne * 2.0;',
      '  vec2 clipSpace = zeroToTwo - 1.0;',
      '  gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);',
      '  v_uv = a_texcoord;',
      '}',
    ].join('\n')

    const fsSrc = [
      'precision mediump float;',
      'varying vec2 v_uv;',
      'uniform sampler2D u_texture;',
      'uniform float u_alpha;',
      'void main() {',
      '  vec4 c = texture2D(u_texture, v_uv);',
      '  gl_FragColor = vec4(c.rgb, c.a * u_alpha);',
      '}',
    ].join('\n')

    function compileShader(gl, src, type) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        cc.log(`SimpleMesh shader compile error:\n${gl.getShaderInfoLog(s)}`)
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vs = compileShader(gl, vsSrc, gl.VERTEX_SHADER)
    const fs = compileShader(gl, fsSrc, gl.FRAGMENT_SHADER)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      cc.log(`SimpleMesh program link error:\n${gl.getProgramInfoLog(prog)}`)
      gl.deleteProgram(prog)
      return
    }
    this._program = prog

    // buffers
    this._vbo = gl.createBuffer()
    this._uvbo = gl.createBuffer()
    this._ibo = gl.createBuffer()
  },

  // compute model matrix using node's transform: we want map local mesh coords (as-specified) through node's world transform
  _computeModelMatrixFromNode: function () {
    // get node world transform: use node's nodeToWorldAffine / getNodeToParentTransform?
    // Simpler: use node.getNodeToWorldTransform() if available to get 4x4 matrix,
    // but to keep it engine-agnostic we build 2D model from node's world position/rotation/scale.

    // Get world position, rotation, scale from node hierarchy:
    // const worldPos = this.getParent() ? this.getParent().convertToWorldSpaceAR(this.getPosition()) : this.getPosition()
    // convertToWorldSpaceAR already factors parent's transform; however it returns cc.Point in view coords.
    // To be robust we instead compute world transform with node.getNodeToWorldTransform? If not available, fallback.
    const worldRotation = this.getNodeToWorldTransform
      ? function () {
          // use getNodeToWorldTransform to extract rotation/scale if available; else fallback to this.getRotation()
          try {
            const t = this.getNodeToWorldTransform() // returns affine transform with a, b, c, d, tx, ty
            // extract rotation from matrix (a = cos*scaleX)
            const a = t.a,
              b = t.b,
              c = t.c,
              d = t.d,
              tx = t.tx,
              ty = t.ty
            // rotation radians = atan2(b, a)
            const rot = (Math.atan2(b, a) * 180) / Math.PI
            const sx = Math.sqrt(a * a + b * b)
            const sy = Math.sqrt(c * c + d * d)
            return { rot: rot, sx: sx, sy: sy, tx: tx, ty: ty }
          } catch (e) {
            return null
          }
        }.call(this)
      : null

    let tx, ty, rotDeg, sx, sy
    if (worldRotation) {
      tx = worldRotation.tx
      ty = worldRotation.ty
      rotDeg = worldRotation.rot
      sx = worldRotation.sx
      sy = worldRotation.sy
    } else {
      // fallback (approx): use getParent convertToWorldSpace and node local properties (this is approximate)
      const worldPt = this.convertToWorldSpaceAR(cc.p(0, 0))
      tx = worldPt.x
      ty = worldPt.y
      rotDeg = this.getRotation ? this.getRotation() : this.rotation || 0
      sx = this.getScaleX ? this.getScaleX() : this.scaleX || 1
      sy = this.getScaleY ? this.getScaleY() : this.scaleY || 1
    }

    const rad = ((rotDeg || 0) * Math.PI) / 180.0
    const cos = Math.cos(rad),
      sin = Math.sin(rad)
    const a = cos * sx
    const b = sin * sx
    const c = -sin * sy
    const d = cos * sy

    // anchor: we will treat anchor in node's contentSize coordinates (normalized anchor point)
    const anchor = this.getAnchorPoint ? this.getAnchorPoint() : { x: 0, y: 0 }
    const aw = anchor.x * this.width
    const ah = anchor.y * this.height
    // compute e,f
    const e = tx - (a * aw + c * ah)
    const f = ty - (b * aw + d * ah)

    return new Float32Array([a, b, 0, c, d, 0, e, f, 1])
  },

  _drawMeshWebGL: function () {
    const gl = cc._renderContext
    if (!gl) {
      this._useWebGL = false
      return
    }
    this._ensureGL()
    if (!this._program) return
    if (!this._vertices || !this._uvs || !this._indices) return
    if (this._vertices.length / 2 !== this._uvs.length / 2) return

    gl.useProgram(this._program)

    // upload if needed
    if (this._needsUpload) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo)
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW)

      gl.bindBuffer(gl.ARRAY_BUFFER, this._uvbo)
      gl.bufferData(gl.ARRAY_BUFFER, this._uvs, gl.STATIC_DRAW)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW)

      this._needsUpload = false
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo)
      gl.bindBuffer(gl.ARRAY_BUFFER, this._uvbo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
    }

    const aPosLoc = gl.getAttribLocation(this._program, 'a_position')
    const aUVLoc = gl.getAttribLocation(this._program, 'a_texcoord')

    // vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo)
    gl.enableVertexAttribArray(aPosLoc)
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0)

    // uvs
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvbo)
    gl.enableVertexAttribArray(aUVLoc)
    gl.vertexAttribPointer(aUVLoc, 2, gl.FLOAT, false, 0, 0)

    // bind texture
    if (this._texture) {
      gl.activeTexture(gl.TEXTURE0)
      const webTex = this._texture._webTextureObj || (this._texture.getTexture ? this._texture.getTexture() : null)
      if (webTex) {
        gl.bindTexture(gl.TEXTURE_2D, webTex)
      } else {
        // fallback: try html image object
        const img = this._texture.getHtmlElementObj ? this._texture.getHtmlElementObj() : this._texture
        if (img) {
          const tmp = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, tmp)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        }
      }
      const uTexLoc = gl.getUniformLocation(this._program, 'u_texture')
      gl.uniform1i(uTexLoc, 0)
    } else {
      gl.bindTexture(gl.TEXTURE_2D, null)
    }

    // resolution
    const uResLoc = gl.getUniformLocation(this._program, 'u_resolution')
    const sz = cc.view.getFrameSize
      ? cc.view.getFrameSize()
      : { width: cc.director.getWinSize().width, height: cc.director.getWinSize().height }
    gl.uniform2f(uResLoc, sz.width, sz.height)

    // model matrix from node
    const uModelLoc = gl.getUniformLocation(this._program, 'u_model')
    const modelMat = this._computeModelMatrixFromNode()
    gl.uniformMatrix3fv(uModelLoc, false, modelMat)

    // alpha
    const uAlphaLoc = gl.getUniformLocation(this._program, 'u_alpha')
    gl.uniform1f(uAlphaLoc, this._alpha || 1.0)

    // blending
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._ibo)
    gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0)

    // cleanup
    gl.disableVertexAttribArray(aPosLoc)
    gl.disableVertexAttribArray(aUVLoc)
  },

  // simple canvas fallback: just draw bounding box for visibility
  _drawMeshCanvasFallback: function () {
    // attach fallback drawnode if not added
    if (!this._fallbackDraw._parent) {
      this.addChild(this._fallbackDraw)
    }
    // clear and draw bounding box
    this._fallbackDraw.clear()
    if (!this._vertices || this._vertices.length < 2) return
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY
    for (let i = 0; i < this._vertices.length; i += 2) {
      const x = this._vertices[i],
        y = this._vertices[i + 1]
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    const rect = [cc.p(minX, minY), cc.p(maxX, minY), cc.p(maxX, maxY), cc.p(minX, maxY)]
    this._fallbackDraw.drawPoly(rect, null, 1, cc.color(255, 0, 0, 255))
  },

  // set alpha multiplier
  setAlpha: function (a) {
    this._alpha = a
  },

  // convenience static to create a quad mesh
  statics: {
    createQuad: function (x, y, w, h, u0, v0, uw, vh) {
      const verts = new Float32Array([x, y, x + w, y, x + w, y + h, x, y + h])
      const u1 = u0 + uw,
        v1 = v0 + vh
      const uvs = new Float32Array([u0, v0, u1, v0, u1, v1, u0, v1])
      const inds = new Uint16Array([0, 1, 2, 0, 2, 3])
      return { vertices: verts, uvs: uvs, indices: inds }
    },
  },

  // cleanup GL buffers on exit
  onExit: function () {
    cc.Node.prototype.onExit.call(this)
    if (this._gl) {
      try {
        if (this._vbo) this._gl.deleteBuffer(this._vbo)
        if (this._uvbo) this._gl.deleteBuffer(this._uvbo)
        if (this._ibo) this._gl.deleteBuffer(this._ibo)
        if (this._program) this._gl.deleteProgram(this._program)
      } catch (e) {
        /* ignore */
      }
      this._gl = null
    }
  },
})
