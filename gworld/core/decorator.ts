import { GameWorld } from '..'
import { EnhancedComponent } from '../components/EnhancedComponent'

export class NoRenderComponentX extends EnhancedComponent {
  static hasRender = false
  static create<T extends NoRenderComponentX>(data?: any): T {
    return new this(data) as T
  }
}

export class ComponentX extends EnhancedComponent {
  static create(data?: any) {
    const world = GameWorld.Instance
    const root = world.entities.create()
    const comp = root.assign(new this(data))
    return comp
  }
}
