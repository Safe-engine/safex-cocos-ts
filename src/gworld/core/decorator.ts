import { GameWorld } from '..'
import { EnhancedComponent } from '../components/EnhancedComponent'
import { NodeComp } from '../components/NodeComp'

export class NoRenderComponentX<Props = Object, C extends cc.Node = cc.Node> extends EnhancedComponent<Props, NodeComp<C>> {
  static hasRender = false
}

export class ComponentX<Props = Object, C extends cc.Node = cc.Node> extends EnhancedComponent<Props, NodeComp<C>> {
  render?(): this {
    const world = GameWorld.Instance
    const root = world.entities.create()
    const comp = root.assign(this)
    return comp
  }
}
