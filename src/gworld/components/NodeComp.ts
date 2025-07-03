import { Constructor, Entity } from 'entityx-ts'
import remove from 'lodash/remove'

import { instantiate } from '../../helper/utils'
import { Vec2 } from '../../polyfills'
import { ComponentType, EnhancedComponent } from './EnhancedComponent'
import { ExtraDataComp } from './NoRenderComponent'

export type EventCallbackType = (...args) => void
export class NodeComp<C extends cc.Node = cc.Node> {
  entity: Entity
  instance: C
  parent: NodeComp
  children: NodeComp[] = []
  name: string
  _group
  _active = true

  constructor(instance: C, entity: Entity) {
    this.entity = entity
    this.instance = instance
  }

  get uuid() {
    return this.entity.id
  }

  get position(): Readonly<Vec2> {
    return Vec2(this.instance.getPosition())
  }

  set position(val: Vec2) {
    this.instance.setPosition(val.x, val.y)
  }

  set xy(val: Array<number>) {
    this.instance.setPosition(val[0], val[1])
  }

  get posX() {
    return this.instance.getPositionX()
  }

  set posX(val: number) {
    this.instance.setPositionX(val)
  }

  get posY() {
    return this.instance.getPositionY()
  }

  set posY(val: number) {
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
   * Returns the angle of the node in degrees. 0 is the default rotation angle. Positive values rotate node clockwise.
   * @function
   * @return {Number} The rotation of the node in degrees.
   */
  get rotation() {
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
  set rotation(val: number) {
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
    if (!cc.sys.isObjectValid(this.instance) || !this._active) return false
    let p = this.parent
    while (p) {
      if (!p.active) return false
      p = p.parent
    }
    return true
  }

  set active(val: boolean) {
    if (!cc.sys.isObjectValid(this.instance)) {
      return
    }
    this._active = val
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
    return this.instance.getPosition()
  }

  setPosition(x: number | cc.Vec2 | cc.Vec3 | cc.Point, y?: number) {
    this.instance.setPosition(x, y)
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
    this.active = false
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
      this.stopAllActions()
      this.instance.removeFromParent()
    }
  }
  addChild(child: NodeComp, zOrder?: number, tag?: number)
  addChild(child: NodeComp) {
    child._active = true
    child.parent = this
    this.children.push(child)
    this.instance.addChild(child.instance)
  }

  removeAllChildren(cleanup?) {
    this.children.forEach((child) => {
      child.removeFromParent(cleanup)
    })
  }

  getData<T>(key: string): T {
    const data = this.getComponent(ExtraDataComp)
    if (!data) throw Error('need add ExtraDataComp to Node')
    return data.getData(key)
  }

  setData<T extends Integer | Float | string>(key: string, value: T) {
    const data = this.getComponent(ExtraDataComp)
    if (!data) {
      this.addComponent(instantiate(ExtraDataComp, { key, value }))
    } else {
      data.setData(key, value)
    }
  }
  removeData(key: string) {
    const data = this.getComponent(ExtraDataComp)
    if (data) {
      data.removeData(key)
    }
  }

  resolveComponent(component: EnhancedComponent<object, NodeComp>) {
    if ((component.constructor as any).hasRender) {
      this.addChild(component.node)
    } else {
      this.addComponent(component)
    }
  }
}
