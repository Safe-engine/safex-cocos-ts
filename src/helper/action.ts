import { Vec2 } from '../polyfills'

export function moveTo(t: number, to: Vec2) {
  return cc.moveTo(t, to)
}
export function moveBy(t: number, to: Vec2) {
  return cc.moveBy(t, to)
}

export function scaleTo(t: number, x: number, y?: number) {
  return cc.scaleTo(t, x, y)
}

export function callFunc(cb: () => void, target?, data?) {
  return cc.callFunc(cb, target, data)
}

export function sequence(...actions: cc.FiniteTimeAction[]) {
  return cc.sequence(...actions)
}

export function repeatForever(action: cc.FiniteTimeAction) {
  return cc.repeatForever(action)
}

export function repeat(action: cc.FiniteTimeAction, times: Integer) {
  return cc.repeat(action, times)
}

export function delayTime(time: Float) {
  return cc.delayTime(time)
}

export function easeBackOut(action: cc.ActionInterval) {
  return action.easing(cc.easeBackOut())
}
