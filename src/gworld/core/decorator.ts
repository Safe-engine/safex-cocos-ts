import { GameWorld } from '..'
import { EnhancedComponent } from '../components/EnhancedComponent'
import { NodeComp } from '../components/NodeComp'

export class NoRenderComponentX<C extends cc.Node = cc.Node> extends EnhancedComponent<NodeComp<C>> {
  static hasRender = false
  static create(data?: any){
    return new this(data)
  }
}

export class ComponentX<C extends cc.Node = cc.Node> extends EnhancedComponent<NodeComp<C>> {
  render?(data?: any): any
  static create(data?: any) {
    if (this.prototype.render) return this.prototype.render(data)
    const world = GameWorld.Instance
    const root = world.entities.create()
    const comp = root.assign(new this(data))
    return comp
  }
}
