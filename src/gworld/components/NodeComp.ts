import { Constructor, Entity } from 'entityx-ts'
import remove from 'lodash/remove'

import { Vec2 } from '../../polyfills'
import { ComponentType, EnhancedComponent } from './EnhancedComponent'
import { ExtraDataComp } from './NoRenderComponent'

export type EventCallbackType = (...args) => void
export class NodeComp {
  entity: Entity
  instance: cc.Node
  parent: NodeComp
  children: NodeComp[] = []
  // offset: cc.Point = Vec2(0, 0);
  name: string
  private lastMove: { x: any; y: any }
  private _group

  constructor(instance: cc.Node, entity: Entity) {
    this.entity = entity
    this.instance = instance
  }

  get uuid() {
    return this.entity.id
  }

  get position(): Vec2 {
    return this.getPosition()
  }

  set position(val: Vec2) {
    this.setPosition(val.x, val.y)
  }

  get x() {
    return this.instance.getPositionX()
  }

  set x(val: number) {
    this.instance.setPositionX(val)
  }

  get y() {
    return this.instance.getPositionY()
  }

  set y(val: number) {
    this.instance.setPositionY(val)
  }

  get scale() {
    return this.instance.getScale()
  }

  set scale(val: number) {
    this.instance.setScale(val, val)
  }

  get scaleX() {
    return this.instance.getScaleX()
  }

  set scaleX(val: number) {
    this.instance.setScaleX(val)
  }

  get scaleY() {
    return this.instance.getScaleY()
  }

  set scaleY(val: number) {
    this.instance.setScaleY(val)
  }

  get anchorX() {
    return this.instance.anchorX
  }

  set anchorX(val: number) {
    this.instance.anchorX = val
  }

  get anchorY() {
    return this.instance.anchorY
  }

  set anchorY(val: number) {
    this.instance.anchorY = val
  }
  /**
   * Returns the rotation of the node in radians. 0 is the default rotation angle. Positive values rotate node clockwise.
   * @function
   * @return {Number} The rotation of the node in radians.
   */
  get rotation() {
    return cc.degreesToRadians(this.instance.getRotation())
  }
  /**
   *
   *  Sets the X rotation of the node in radians which performs a horizontal rotational skew.
   *  (support only in WebGL rendering mode)
   *  0 is the default rotation angle.
   *  Positive values rotate node clockwise, and negative values for anti-clockwise.
   *
   * @param {Number} radians The X rotation in radians which performs a horizontal rotational skew.
   */
  set rotation(val: number) {
    this.instance.setRotation(cc.radiansToDegrees(val))
  }
  /**
   * Returns the angle of the node in degrees. 0 is the default rotation angle. Positive values rotate node clockwise.
   * @function
   * @return {Number} The rotation of the node in degrees.
   */
  get angle() {
    return this.instance.getRotation()
  }
  /**
   *
   *  Sets the X angle of the node in degrees which performs a horizontal rotational skew.
   *  (support only in WebGL rendering mode)
   *  0 is the default rotation angle.
   *  Positive values rotate node clockwise, and negative values for anti-clockwise.
   *
   * @param {Number} degrees The X rotation in degrees which performs a horizontal rotational skew.
   */
  set angle(val: number) {
    this.instance.setRotation(val)
  }

  get color() {
    return this.instance.getColor()
  }

  set color(val: cc.Color) {
    this.instance.setColor(val)
  }

  get opacity() {
    return this.instance.getOpacity()
  }

  set opacity(val: number) {
    this.instance.setOpacity(val)
  }

  get active() {
    return cc.sys.isObjectValid(this.instance) && this.instance.visible
  }

  set active(val: boolean) {
    if (!cc.sys.isObjectValid(this.instance)) {
      return
    }
    if (this.instance instanceof ccui.Widget) {
      this.instance.setEnabled(val)
    }
    this.instance.setVisible(val)
  }

  get group() {
    return this._group
  }

  set group(val: string | number) {
    this._group = val
  }

  get width() {
    return this.instance.width
  }

  set width(val) {
    this.instance.setContentSize(val, this.height)
  }

  get height() {
    return this.instance.height
  }

  set height(val) {
    this.instance.setContentSize(val, this.width)
  }

  get zIndex() {
    return this.instance.zIndex
  }

  set zIndex(val) {
    this.instance.zIndex = val
  }

  get childrenCount() {
    return this.children.length
  }

  destroy() {
    this.removeFromParent(true)
  }

  addComponent<T extends ComponentType>(instance: T): T {
    return this.entity.assign(instance)
  }

  getComponent<T extends ComponentType>(component: Constructor<T>): T {
    return this.entity.getComponent(component)
  }

  getComponentsInChildren<T extends ComponentType>(component: Constructor<T>): T[] {
    if (!this.children.length) {
      return []
    }
    const listHave = this.children.filter((child) => {
      return child.getComponent(component)
    })
    return listHave.map((node) => node.getComponent(component))
  }

  getComponentInChildren<T extends ComponentType>(component: Constructor<T>): T {
    return this.getComponentsInChildren(component)[0]
  }

  hasComponentInChildren<T extends ComponentType>(component: Constructor<T>) {
    if (!this.children.length) {
      return false
    }
    return this.children.some((child) => {
      return child.getComponent(component)
    })
  }

  getPercent() {
    if (this.instance instanceof ccui.LoadingBar) {
      return this.instance.getPercent()
    }
    return 0
  }

  setPercent(val: number) {
    if (this.instance instanceof ccui.LoadingBar) {
      return this.instance.setPercent(val)
    }
  }

  setTouchEnabled(enabled: boolean) {
    if (!cc.sys.isObjectValid(this.instance)) {
      return
    }
    if (this.instance instanceof ccui.Widget) {
      this.instance.setTouchEnabled(enabled)
    }
  }

  addTouchEventListener(cb) {
    if (!cc.sys.isObjectValid(this.instance)) {
      return
    }
    if (this.instance instanceof ccui.Widget) {
      this.instance.addTouchEventListener(cb)
    }
  }

  convertToNodeSpace(point: cc.Point) {
    const { x, y } = this.instance.convertToNodeSpace(point)
    return Vec2(x, y)
  }

  convertToNodeSpaceAR(point: cc.Point) {
    const { x, y } = this.instance.convertToNodeSpaceAR(point)
    return Vec2(x, y)
  }

  convertToWorldSpaceAR(point: cc.Vec2) {
    const { x, y } = this.instance.convertToWorldSpaceAR(point)
    return Vec2(x, y)
  }

  getPosition() {
    return Vec2(this.x, this.y)
  }

  setPosition(x: number | cc.Vec2 | cc.Vec3 | cc.Point, y?: number) {
    if (typeof x !== 'number') {
      this.x = x.x
      this.y = x.y
    } else {
      this.x = x
      this.y = y
    }
  }

  setRotation(deg: number) {
    this.instance.setRotation(deg)
  }

  getRotation() {
    return this.instance.getRotation()
  }

  setAnchorPoint(point: number | cc.Point, y?: number) {
    this.instance.setAnchorPoint(point, y)
  }

  getAnchorPoint() {
    return this.instance.getAnchorPoint()
  }

  getBoundingBox() {
    const box = this.instance.getBoundingBox()
    box.contains = function (point) {
      return this.x <= point.x && this.x + this.width >= point.x && this.y <= point.y && this.y + this.height >= point.y
    }
    return box
  }

  getContentSize() {
    return this.instance.getContentSize()
  }

  setContentSize(size: cc.Size | number, height?: number) {
    this.instance.setContentSize(size, height)
    if (this.instance instanceof cc.ClippingNode) {
      const hw = ((size as any).width || size) * 0.5
      const hh = ((size as any).height || height) * 0.5
      const stencil = new cc.DrawNode()
      const rectangle = [cc.p(-hw, -hh), cc.p(hw, -hh), cc.p(hw, hh), cc.p(-hw, hh)]
      stencil.drawPoly(rectangle, cc.Color.WHITE, 0, cc.Color.WHITE)
      // stencil.drawDot(cc.p(-height * 0.5, -height * 0.5), height, cc.Color.WHITE);
      this.instance.stencil = stencil
    }
  }

  setColor(color: cc.Color) {
    this.instance.setColor(color)
  }

  setScale(scaleX: number, scaleY?: number) {
    this.instance.setScale(scaleX, scaleY || scaleX)
  }

  runAction(atc: cc.ActionInterval) {
    this.instance.runAction(atc)
  }

  stopAllActions() {
    this.instance.stopAllActions()
  }

  pauseAllActionsAndSchedule() {
    this.instance.pause()
    this.instance.unscheduleUpdate()
  }

  resumeAllActionsAndSchedule() {
    this.instance.resume()
    this.instance.scheduleUpdate()
  }

  removeFromParent(cleanup?: boolean) {
    if (this.parent) {
      remove(this.parent.children, ({ entity }) => entity.id === this.entity.id)
    }
    if (cleanup) {
      this.children.forEach((child) => {
        child.entity.destroy()
      })
      this.parent = null
      this.entity.destroy()
      this.instance.removeFromParent(cleanup)
    } else {
      this.active = false
      this.stopAllActions()
      this.instance.removeFromParent()
    }
  }
  addChild(child: NodeComp, zOrder?: number, tag?: number)
  addChild(child: NodeComp) {
    child.parent = this
    this.children.push(child)
    this.instance.addChild(child.instance)
  }

  removeAllChildren(cleanup?) {
    this.instance.removeAllChildren(cleanup)
  }

  getData<T>(key: string): T {
    const data = this.getComponent(ExtraDataComp)
    if (!data) throw Error('need add ExtraDataComp to Node')
    return data.getData(key)
  }

  setData<T>(key: string, value: T) {
    const data = this.getComponent(ExtraDataComp)
    if (!data) {
      this.addComponent(ExtraDataComp.create({ key, value }))
    } else {
      data.setData(key, value)
    }
  }

  resolveComponent(component: EnhancedComponent) {
    if ((component.constructor as any).hasRender) {
      this.addChild(component.node)
    } else {
      this.addComponent(component)
    }
  }
}
