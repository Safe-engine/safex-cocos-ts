import { Touch } from '../../polyfills'
import { NoRenderComponentX } from '../core/decorator'
import { EventCallbackType, NodeComp } from './NodeComp'

type TouchEVentCallback = (touch?: Touch, node?: NodeComp) => void

export interface EventMap {
  [key: string]: [EventCallbackType]
}

export class EventRegister extends NoRenderComponentX {
  events: EventMap = {}

  on(name: string, callback: EventCallbackType, target?: any) {
    const bound = target ? callback.bind(target) : callback
    if (this.events[name]) {
      this.events[name].push(bound)
    } else {
      this.events[name] = [bound]
    }
  }

  off(name: string, callback?: EventCallbackType, target?: any)
  off(name: string) {
    this.events[name] = undefined
  }

  emit(name: string, ...params: any) {
    if (this.events[name]) {
      this.events[name].forEach((fc) => fc(...params))
    }
  }
}

interface TouchEventProps {
  onTouchStart?: TouchEVentCallback
  onTouchMove?: TouchEVentCallback
  onTouchEnd?: TouchEVentCallback
  onTouchCancel?: TouchEVentCallback
}
export class TouchEventRegister extends NoRenderComponentX<TouchEventProps> {
  listener: cc.EventListener
  touch: cc.Touch
}

interface ExtraDataProps {
  key: string
  value: Integer | Float | string
}
export class ExtraDataComp extends NoRenderComponentX<ExtraDataProps> {
  data: { [key: string]: any } = {}
  getData<T>(key: string): T {
    return this.data[key]
  }
  setData<T>(key: string, val: T) {
    this.data[key] = val
  }
}
