import { GameWorld } from '..'
import { EnhancedComponent } from '../components/EnhancedComponent'
import { NodeComp } from '../components/NodeComp'

export class NoRenderComponentX<Props = Object,C extends cc.Node = cc.Node> extends EnhancedComponent<Props, NodeComp<C>> {
  static hasRender = false
  static create(data?: any){
    return new this(data)
  }
}

export class ComponentX<Props = Object,C extends cc.Node = cc.Node> extends EnhancedComponent<Props, NodeComp<C>> {
  render?(data?: Props): any
  static create(data?: any) {
    if (this.prototype.render) return this.prototype.render(data)
    const world = GameWorld.Instance
    const root = world.entities.create()
    const comp = root.assign(new this(data))
    return comp
  }
}
