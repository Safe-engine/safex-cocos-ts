// @ts-nocheck
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2018 DragonBones team and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { BaseObject, BinaryOffset, BoneType, Slot, Transform } from '@cocos/dragonbones-js';

import { CocosArmatureDisplay } from './CocosArmatureDisplay';
import { CocosTextureAtlasData, CocosTextureData } from './CocosTextureAtlasData';

export class CocosSlot extends Slot {
  _updateGlueMesh(): void {

  }
  public static toString(): string {
    return '[class dragonBones.CocosSlot]';
  }

  private _textureScale: number;
  private _renderDisplay: cc.Node;

  protected _onClear(): void {
    super._onClear();

    this._textureScale = 1.0;
    this._renderDisplay = null as any;
    // this._updateTransform = cc[0] === '3' ? this._updateTransformV3 : this._updateTransformV4;
  }

  protected _initDisplay(value: any, isRetain: boolean): void {
    // tslint:disable-next-line:no-unused-expression
    value;
    // tslint:disable-next-line:no-unused-expression
    isRetain;
  }

  protected _disposeDisplay(value: any, isRelease: boolean): void {
    // tslint:disable-next-line:no-unused-expression
    value;
    if (!isRelease) {
      (value as cc.Node).destroy();
    }
  }

  protected _onUpdateDisplay(): void {
    this._renderDisplay = (this._display ? this._display : this._rawDisplay) as cc.Node;
  }

  protected _addDisplay(): void {
    const container = this._armature.display as CocosArmatureDisplay;
    container.addChild(this._renderDisplay);
  }

  protected _replaceDisplay(value: any): void {
    const container = this._armature.display as CocosArmatureDisplay;
    const prevDisplay = value as cc.Node;
    container.addChild(this._renderDisplay);
    container.swapChildren(this._renderDisplay, prevDisplay);
    container.removeChild(prevDisplay);
    this._textureScale = 1.0;
  }

  protected _removeDisplay(): void {
    this._renderDisplay.parent.removeChild(this._renderDisplay);
  }

  protected _updateZOrder(): void {
    if (this._renderDisplay.getLocalZOrder() === this._zOrder) {
      return;
    }

    this._renderDisplay.setLocalZOrder(this._zOrder);
  }
  /**
   * @internal
   */
  public _updateVisible(): void {
    this._renderDisplay.visible = this._parent.visible && this._visible;
  }

  protected _updateBlendMode(): void {
    if (this._renderDisplay instanceof cc.Sprite) {

    }
    // TODO child armature.
  }

  protected _updateColor(): void {
    const alpha = this._colorTransform.alphaMultiplier * this._globalAlpha;
    this._renderDisplay.alpha = alpha;

    if (this._renderDisplay instanceof cc.Sprite || this._renderDisplay instanceof Cocos.SimpleMesh) {
      const color = (Math.round(this._colorTransform.redMultiplier * 0xFF) << 16) + (Math.round(this._colorTransform.greenMultiplier * 0xFF) << 8) + Math.round(this._colorTransform.blueMultiplier * 0xFF);
      this._renderDisplay.tint = color;
    }
    // TODO child armature.
  }

  protected _updateFrame(): void {
    let currentTextureData = this._textureData as (CocosTextureData | null);

    if (this._displayIndex >= 0 && this._display !== null && currentTextureData !== null) {
      let currentTextureAtlasData = currentTextureData.parent as CocosTextureAtlasData;

      if (this._armature.replacedTexture !== null) { // Update replaced texture atlas.
        if (this._armature._replaceTextureAtlasData === null) {
          currentTextureAtlasData = BaseObject.borrowObject(CocosTextureAtlasData);
          currentTextureAtlasData.copyFrom(currentTextureData.parent);
          currentTextureAtlasData.renderTexture = this._armature.replacedTexture;
          this._armature._replaceTextureAtlasData = currentTextureAtlasData;
        }
        else {
          currentTextureAtlasData = this._armature._replaceTextureAtlasData as CocosTextureAtlasData;
        }

        currentTextureData = currentTextureAtlasData.getTexture(currentTextureData.name) as CocosTextureData;
      }

      const renderTexture = currentTextureData.renderTexture;
      if (renderTexture !== null) {
        if (this._geometryData) { // Mesh.
          const data = this._geometryData.data;
          const intArray = data.intArray;
          const floatArray = data.floatArray;
          const vertexCount = intArray[this._geometryData.offset + BinaryOffset.GeometryVertexCount];
          const triangleCount = intArray[this._geometryData.offset + BinaryOffset.GeometryTriangleCount];
          let vertexOffset = intArray[this._geometryData.offset + BinaryOffset.GeometryFloatOffset];

          if (vertexOffset < 0) {
            vertexOffset += 65536; // Fixed out of bouds bug.
          }

          const uvOffset = vertexOffset + vertexCount * 2;
          const scale = this._armature._armatureData.scale;

          const meshDisplay = this._renderDisplay as cc.SimpleMesh;

          const vertices = new Float32Array(vertexCount * 2) as any;
          const uvs = new Float32Array(vertexCount * 2) as any;
          const indices = new Uint16Array(triangleCount * 3) as any;
          for (let i = 0, l = vertexCount * 2; i < l; ++i) {
            vertices[i] = floatArray[vertexOffset + i] * scale;
          }

          for (let i = 0; i < triangleCount * 3; ++i) {
            indices[i] = intArray[this._geometryData.offset + BinaryOffset.GeometryVertexIndices + i];
          }

          for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
            const u = floatArray[uvOffset + i];
            const v = floatArray[uvOffset + i + 1];

            if (currentTextureData.rotated) {
              uvs[i] = 1 - v;
              uvs[i + 1] = u;
            } else {
              uvs[i] = u;
              uvs[i + 1] = v;
            }
          }

          this._textureScale = 1.0;
          meshDisplay.texture = renderTexture as any;
          meshDisplay.vertices = vertices;
          meshDisplay.uvBuffer.update(uvs);
          meshDisplay.geometry.addIndex(indices);

          const isSkinned = this._geometryData.weight !== null;
          const isSurface = this._parent._boneData.type !== BoneType.Bone;
          if (isSkinned || isSurface) {
            this._identityTransform();
          }
        }
        else {
          // Normal texture.
          this._textureScale = currentTextureData.parent.scale * this._armature._armatureData.scale;
          const normalDisplay = this._renderDisplay as cc.Sprite;
          normalDisplay.setSpriteFrame(renderTexture);
        }

        this._visibleDirty = true;

        return;
      }
    }

    if (this._geometryData) {
      const meshDisplay = this._renderDisplay as cc.SimpleMesh;
      meshDisplay.texture = null as any;
      meshDisplay.x = 0.0;
      meshDisplay.y = 0.0;
      meshDisplay.visible = false;
    }
    else {
      const normalDisplay = this._renderDisplay as cc.Sprite;
      normalDisplay.texture = null as any;
      normalDisplay.x = 0.0;
      normalDisplay.y = 0.0;
      normalDisplay.visible = false;
    }
    this._renderDisplay.setPosition(0.0, 0.0);
  }

  protected _updateMesh(): void {
    const scale = this._armature._armatureData.scale;
    const deformVertices = (this._displayFrame as DisplayFrame).deformVertices;
    const bones = this._geometryBones;
    const geometryData = this._geometryData as GeometryData;
    const weightData = geometryData.weight;

    const hasDeform = deformVertices.length > 0 && geometryData.inheritDeform;
    const meshDisplay = (this._renderDisplay.getComponent(cc.Sprite) as any)._sgNode; // as cc.Scale9Sprite;
    const polygonInfo = meshDisplay.getMeshPolygonInfo();
    if (!polygonInfo) {
      return;
    }

    const verticesAndUVs = polygonInfo.triangles.verts as { x: number, y: number, u: number, v: number }[];
    const boundsRect = cc.rect(999999.0, 999999.0, -999999.0, -999999.0);

    if (weightData !== null) {
      const data = geometryData.data;
      const intArray = data.intArray;
      const floatArray = data.floatArray;
      const vertexCount = intArray[geometryData.offset + BinaryOffset.MeshVertexCount];
      let weightFloatOffset = intArray[weightData.offset + BinaryOffset.WeigthFloatOffset];

      if (weightFloatOffset < 0) {
        weightFloatOffset += 65536; // Fixed out of bouds bug.
      }

      for (
        let i = 0, iB = weightData.offset + BinaryOffset.WeigthBoneIndices + bones.length, iV = weightFloatOffset, iF = 0;
        i < vertexCount;
        ++i
      ) {
        const boneCount = intArray[iB++];
        let xG = 0.0, yG = 0.0;

        for (let j = 0; j < boneCount; ++j) {
          const boneIndex = intArray[iB++];
          const bone = bones[boneIndex];

          if (bone !== null) {
            const matrix = bone.globalTransformMatrix;
            const weight = floatArray[iV++];
            let xL = floatArray[iV++] * scale;
            let yL = floatArray[iV++] * scale;

            if (hasDeform) {
              xL += deformVertices[iF++];
              yL += deformVertices[iF++];
            }

            xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
            yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
          }
        }

        const vertex = verticesAndUVs[i];
        vertex.x = xG;
        vertex.y = yG;

        if (boundsRect.x > xG) {
          boundsRect.x = xG;
        }

        if (boundsRect.width < xG) {
          boundsRect.width = xG;
        }

        if (boundsRect.y > yG) {
          boundsRect.y = yG;
        }

        if (boundsRect.height < yG) {
          boundsRect.height = yG;
        }
      }
    }
    else {
      const isSurface = this._parent._boneData.type !== BoneType.Bone;
      const data = geometryData.data;
      const intArray = data.intArray;
      const floatArray = data.floatArray;
      const vertexCount = intArray[geometryData.offset + BinaryOffset.MeshVertexCount];
      let vertexOffset = intArray[geometryData.offset + BinaryOffset.MeshFloatOffset];

      if (vertexOffset < 0) {
        vertexOffset += 65536; // Fixed out of bouds bug.
      }

      for (let i = 0, l = vertexCount * 2; i < l; i += 2) {
        const iH = i / 2; // int.
        let x = floatArray[vertexOffset + i] * scale;
        let y = floatArray[vertexOffset + i + 1] * scale;

        if (hasDeform) {
          x += deformVertices[i];
          y += deformVertices[i + 1];
        }

        const vertex = verticesAndUVs[iH];

        if (isSurface) {
          const matrix = (this._parent)._getGlobalTransformMatrix(x, y);
          vertex.x = matrix.a * x + matrix.c * y + matrix.tx;
          vertex.y = matrix.b * x + matrix.d * y + matrix.ty;
          //
          x = vertex.x;
          y = vertex.y;
        }
        else {
          vertex.x = x;
          y = vertex.y = -y;
        }

        if (boundsRect.x > x) {
          boundsRect.x = x;
        }

        if (boundsRect.width < x) {
          boundsRect.width = x;
        }

        if (boundsRect.y > y) {
          boundsRect.y = y;
        }

        if (boundsRect.height < y) {
          boundsRect.height = y;
        }
      }
    }

    boundsRect.width -= boundsRect.x;
    boundsRect.height -= boundsRect.y;

    polygonInfo.rect = boundsRect;
    meshDisplay.setContentSize(cc.size(boundsRect.width, boundsRect.height));
    meshDisplay.setMeshPolygonInfo(polygonInfo);

    if (weightData !== null) {
      this._identityTransform();
    }
    else {
      const transform = this.global;
      const globalTransformMatrix = this.globalTransformMatrix;
      this._renderDisplay.x = transform.x - (globalTransformMatrix.a * this._pivotX - globalTransformMatrix.c * this._pivotY);
      this._renderDisplay.y = transform.y - (globalTransformMatrix.b * this._pivotX - globalTransformMatrix.d * this._pivotY);
      this._renderDisplay.rotationX = -(transform.rotation + transform.skew) * Transform.RAD_DEG;
      this._renderDisplay.rotationY = -transform.rotation * Transform.RAD_DEG;
      this._renderDisplay.scaleX = transform.scaleX * this._textureScale;
      this._renderDisplay.scaleY = -transform.scaleY * this._textureScale;
    }
  }

  protected _updateTransform(): void {
    this.updateGlobalTransform();

    const transform = this.global;
    // const globalTransformMatrix = this.globalTransformMatrix;

    // if (this._renderDisplay === this._rawDisplay || this._renderDisplay === this._meshDisplay) {
    //   this._renderDisplay.x = transform.x - (globalTransformMatrix.a * this._pivotX - globalTransformMatrix.c * this._pivotY);
    //   this._renderDisplay.y = transform.y - (globalTransformMatrix.b * this._pivotX - globalTransformMatrix.d * this._pivotY);
    // }
    // else {
      this._renderDisplay.x = transform.x;
      this._renderDisplay.y = transform.y;
    // }

    this._renderDisplay.rotationX = -(transform.rotation + transform.skew) * Transform.RAD_DEG;
    this._renderDisplay.rotationY = -transform.rotation * Transform.RAD_DEG;
    this._renderDisplay.scaleX = transform.scaleX * this._textureScale;
    this._renderDisplay.scaleY = -transform.scaleY * this._textureScale;
  }

  protected _updateTransformV3(): void {
    this.updateGlobalTransform(); // Update transform.

    const transform = this.global;

    if (this._renderDisplay === this._rawDisplay || this._renderDisplay === this._meshDisplay) {
      const x = transform.x - (this.globalTransformMatrix.a * this._pivotX + this.globalTransformMatrix.c * this._pivotY);
      const y = transform.y - (this.globalTransformMatrix.b * this._pivotX + this.globalTransformMatrix.d * this._pivotY);
      // this._renderDisplay.transform = new cc.AffineTransform(
      //   x, y,
      //   transform.scaleX * this._textureScale, transform.scaleY * this._textureScale,
      //   transform.rotation,
      //   transform.skew, 0.0,
      // );
      this._renderDisplay.setPosition(x, y);
    }
    else {
      this._renderDisplay.setPosition(transform.x, transform.y);
      this._renderDisplay.rotation = transform.rotation;
      this._renderDisplay.skewX = transform.skew
      this._renderDisplay.setScale(transform.scaleX, transform.scaleY);
    }
  }

  protected _identityTransform(): void {
    // const helpMatrix = TransformObject._helpMatrix;
    // helpMatrix.a = 1.0;
    // helpMatrix.b = 0.0;
    // helpMatrix.c = -0.0;
    // helpMatrix.d = -1.0;
    // helpMatrix.tx = 0.0;
    // helpMatrix.ty = 0.0;
    // (this._renderDisplay as any)._renderCmd.setNodeToParentTransform(helpMatrix);

    this._renderDisplay.x = 0.0;
    this._renderDisplay.y = 0.0;
    this._renderDisplay.rotationX = 0.0;
    this._renderDisplay.rotationY = 0.0;
    this._renderDisplay.scaleX = 1.0;
    this._renderDisplay.scaleY = 1.0;
  }
}
