import * as spine from '@esotericsoftware/spine-core'
import { AtlasAttachmentLoader, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core'

import { _atlasLoader } from './CCSkeletonAnimation'
import { CanvasRenderCmd } from './CCSkeletonCanvasRenderCmd'
import { WebGLRenderCmd } from './CCSkeletonWebGLRenderCmd'
/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2014 Shengxiang Chen (Nero Chan)

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * The main namespace of Spine, all classes, functions, properties and constants of Spine are defined in this namespace
 * @namespace
 * @name gworld
 */
/**
 * <p>
 *     The skeleton of Spine.                                                                          <br/>
 *     Skeleton has a reference to a SkeletonData and stores the state for skeleton instance,
 *     which consists of the current pose's bone SRT, slot colors, and which slot attachments are visible.           <br/>
 *     Multiple skeletons can use the same SkeletonData (which includes all animations, skins, and attachments).     <br/>
 * </p>
 * @class
 * @extends cc.Node
 */
export class Skeleton extends cc.Node {
  _skeleton: any = null;
  _rootBone: any = null;
  _timeScale: number = 1;
  _debugSlots: boolean = false;
  _debugBones: boolean = false;
  _premultipliedAlpha: boolean = false;
  _ownsSkeletonData: any = null;
  _atlas: any = null;
  _renderCmd: any;

  constructor(skeletonDataFile?: any, atlasFile?: any, scale?: any) {
    super();
    super.ctor() // always call this for compatibility with cocos2dx JS Javascript class system
    this.ctor(skeletonDataFile, atlasFile, scale);
  }

  ctor(skeletonDataFile?: any, atlasFile?: any, scale?: any) {
    this._renderCmd = this._createRenderCmd();
    if (arguments.length === 0) {
      this.init();
    } else {
      this.initWithArgs(skeletonDataFile, atlasFile, scale);
    }
  }

  _createRenderCmd() {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) return new CanvasRenderCmd(this);
    else return new WebGLRenderCmd(this);
  }

  init(): boolean {
    super.init();
    this._premultipliedAlpha = !!(cc._renderType === cc.game.RENDER_TYPE_WEBGL && cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA);
    return true;
  }

  onEnter() {
    super.onEnter();
    this.scheduleUpdate();
  }

  onExit() {
    this.unscheduleUpdate();
    super.onExit();
  }

  setDebugSolots(enable: boolean) {
    this._debugSlots = enable;
  }

  setDebugBones(enable: boolean) {
    this._debugBones = enable;
  }

  setDebugSlotsEnabled(enabled: boolean) {
    this._debugSlots = enabled;
  }

  getDebugSlotsEnabled() {
    return this._debugSlots;
  }

  setDebugBonesEnabled(enabled: boolean) {
    this._debugBones = enabled;
  }

  getDebugBonesEnabled() {
    return this._debugBones;
  }

  setTimeScale(scale: number) {
    this._timeScale = scale;
  }

  getTimeScale() {
    return this._timeScale;
  }

  initWithArgs(skeletonDataFile: any, atlasFile: any, scale: any) {
    const argSkeletonFile = skeletonDataFile;
    const argAtlasFile = atlasFile;
    let skeletonData, atlas, ownsSkeletonData;

    if (cc.isString(argSkeletonFile)) {
      if (cc.isString(argAtlasFile)) {
        const data = cc.loader.getRes(argAtlasFile);
        _atlasLoader.setAtlasFile(argAtlasFile);
        atlas = new TextureAtlas(data);
        for (const page of atlas.pages) {
          const texture = _atlasLoader.load(page.name);
          page.setTexture(texture);
        }
      }
      scale = scale || 1 / cc.director.getContentScaleFactor();

      const attachmentLoader = new AtlasAttachmentLoader(atlas);
      const skeletonJsonReader = new SkeletonJson(attachmentLoader);
      skeletonJsonReader.scale = scale;

      const skeletonJson = cc.loader.getRes(argSkeletonFile);
      skeletonData = skeletonJsonReader.readSkeletonData(skeletonJson);
      atlas.dispose(skeletonJsonReader);
      ownsSkeletonData = true;
    } else {
      skeletonData = skeletonDataFile;
      ownsSkeletonData = atlasFile;
    }
    this.setSkeletonData(skeletonData, ownsSkeletonData);
    this.init();
  }

  getBoundingBox() {
    let minX = cc.FLT_MAX,
      minY = cc.FLT_MAX,
      maxX = cc.FLT_MIN,
      maxY = cc.FLT_MIN;
    let scaleX = this.getScaleX(),
      scaleY = this.getScaleY(),
      vertices,
      slots = this._skeleton.slots,
      VERTEX = spine.RegionAttachment;

    for (let i = 0, slotCount = slots.length; i < slotCount; ++i) {
      const slot = slots[i];
      const attachment = slot.attachment;
      if (!attachment || !(attachment instanceof spine.RegionAttachment)) continue;
      vertices = spine.Utils.setArraySize([], 8, 0);
      attachment.computeWorldVertices(slot, vertices, 0, 2);
      minX = Math.min(
        minX,
        vertices[VERTEX.X1] * scaleX,
        vertices[VERTEX.X4] * scaleX,
        vertices[VERTEX.X2] * scaleX,
        vertices[VERTEX.X3] * scaleX,
      );
      minY = Math.min(
        minY,
        vertices[VERTEX.Y1] * scaleY,
        vertices[VERTEX.Y4] * scaleY,
        vertices[VERTEX.Y2] * scaleY,
        vertices[VERTEX.Y3] * scaleY,
      );
      maxX = Math.max(
        maxX,
        vertices[VERTEX.X1] * scaleX,
        vertices[VERTEX.X4] * scaleX,
        vertices[VERTEX.X2] * scaleX,
        vertices[VERTEX.X3] * scaleX,
      );
      maxY = Math.max(
        maxY,
        vertices[VERTEX.Y1] * scaleY,
        vertices[VERTEX.Y4] * scaleY,
        vertices[VERTEX.Y2] * scaleY,
        vertices[VERTEX.Y3] * scaleY,
      );
    }
    const position = this.getPosition();
    return cc.rect(position.x + minX, position.y + minY, maxX - minX, maxY - minY);
  }

  updateWorldTransform() {
    this._skeleton.updateWorldTransform(true);
  }

  setToSetupPose() {
    this._skeleton.setToSetupPose();
  }

  setBonesToSetupPose() {
    this._skeleton.setBonesToSetupPose();
  }

  setSlotsToSetupPose() {
    this._skeleton.setSlotsToSetupPose();
  }

  findBone(boneName: string) {
    return this._skeleton.findBone(boneName);
  }

  findSlot(slotName: string) {
    return this._skeleton.findSlot(slotName);
  }

  setSkin(skinName: string) {
    return this._skeleton.setSkinByName(skinName);
  }

  getAttachment(slotName: string, attachmentName: string) {
    return this._skeleton.getAttachmentByName(slotName, attachmentName);
  }

  setAttachment(slotName: string, attachmentName: string) {
    this._skeleton.setAttachment(slotName, attachmentName);
  }

  setPremultipliedAlpha(premultiplied: boolean) {
    this._premultipliedAlpha = premultiplied;
  }

  isPremultipliedAlpha() {
    return this._premultipliedAlpha;
  }

  setSkeletonData(skeletonData: any, ownsSkeletonData: any) {
    if (skeletonData.width != null && skeletonData.height != null)
      this.setContentSize(
        skeletonData.width / cc.director.getContentScaleFactor(),
        skeletonData.height / cc.director.getContentScaleFactor(),
      );

    this._skeleton = new spine.Skeleton(skeletonData);
    this._skeleton.updateWorldTransform(true);
    this._rootBone = this._skeleton.getRootBone();
    this._ownsSkeletonData = ownsSkeletonData;

    if (this._renderCmd && typeof this._renderCmd._createChildFormSkeletonData === 'function') {
      this._renderCmd._createChildFormSkeletonData();
    }
  }

  getTextureAtlas(regionAttachment: any) {
    return regionAttachment.region;
  }

  getBlendFunc() {
    const slot = this._skeleton.drawOrder[0];
    if (slot) {
      const blend = this._renderCmd && typeof this._renderCmd._getBlendFunc === 'function'
        ? this._renderCmd._getBlendFunc(slot.data.blendMode, this._premultipliedAlpha)
        : {};
      return blend;
    } else {
      return {};
    }
  }

  setBlendFunc(src: any, dst?: any) {
    return;
  }

  update(dt: any) {
    this._skeleton.update(dt);
  }
  /**
 * Creates a skeleton object.
 * @deprecated since v3.0, please use new Skeleton(skeletonDataFile, atlasFile, scale) instead.
 * @param {spine.SkeletonData|String} skeletonDataFile
 * @param {String|spine.Atlas|spine.SkeletonData} atlasFile atlas filename or atlas data or owns SkeletonData
 * @param {Number} [scale] scale can be specified on the JSON or binary loader which will scale the bone positions, image sizes, and animation translations.
 * @returns {Skeleton}
 */

  static create(skeletonDataFile?: any, atlasFile?: any, scale?: any) {
    return new Skeleton(skeletonDataFile, atlasFile, scale);
  }
}

cc.defineGetterSetter(Skeleton.prototype, 'opacityModifyRGB', Skeleton.prototype.isOpacityModifyRGB)

// For renderer webgl to identify skeleton's default texture and blend function
cc.defineGetterSetter(Skeleton.prototype, '_blendFunc', Skeleton.prototype.getBlendFunc)
cc.defineGetterSetter(Skeleton.prototype, '_texture', function () {
  return this._renderCmd._currTexture
})
