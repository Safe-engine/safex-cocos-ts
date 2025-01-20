import { Constructor, Entity } from 'entityx-ts'
import { NodeComp } from './NodeComp'

export interface BaseNode<C> {
  active: boolean
  entity: Entity
  instance: C
  addComponent<T extends EnhancedComponent>(instance: T): T
  getComponent<T extends ComponentType>(component: Constructor<T>): T
  getComponentsInChildren<T extends ComponentType>(component: Constructor<T>): T[]
  getComponentInChildren<T extends ComponentType>(component: Constructor<T>): T
  // isEqual(other: EnhancedComponent): boolean
}

export class EnhancedComponent<N extends BaseNode<any> = BaseNode<any>> {
  constructor(...args: any[]) {
    const [data] = args
    if (data) {
      // console.log('constructor', this.constructor.name, data)
      Object.keys(data).forEach((key) => {
        this[key] = data[key]
      })
    }
  }
  static hasRender = true
  node: N
  addComponent<T extends EnhancedComponent>(instance: T): T {
    return this.node.addComponent(instance)
  }
  getComponent<T extends EnhancedComponent>(component: Constructor<T>): T {
    return this.node.getComponent(component)
  }
  schedule(callback: (arg: any) => void, interval: number, repeat: number = cc.macro.REPEAT_FOREVER, delay = 0) {
    this.node.instance.schedule(callback.bind(this), interval, repeat, delay)
  }
  unschedule(callback: (arg: any) => void) {
    this.node.instance.unschedule(callback.bind(this))
  }
  unscheduleAllCallbacks() {
    this.node.instance.unscheduleAllCallbacks()
  }
  scheduleOnce(callback: (arg: any) => void, delay: number, key?: string) {
    this.node.instance.scheduleOnce(callback, delay, key)
  }
  getComponentsInChildren<T extends ComponentType>(component: Constructor<T>): T[] {
    return this.node.getComponentsInChildren(component)
  }
  getComponentInChildren<T extends ComponentType>(component: Constructor<T>): T {
    return this.node.getComponentInChildren(component)
  }
  isEqual(other: EnhancedComponent) {
    return this.node.entity.id === other.node.entity.id
  }
}

export type ComponentType = EnhancedComponent | NodeComp
