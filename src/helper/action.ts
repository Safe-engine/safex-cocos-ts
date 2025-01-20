import { Vec2 } from 'safex'

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

export function easeBackOut(action: cc.ActionInterval) {
  return action.easing(cc.easeBackOut())
}
