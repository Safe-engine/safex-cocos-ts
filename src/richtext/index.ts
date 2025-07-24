import { GameWorld } from '../gworld'
import { RichTextSystem } from './RichTextSystem'

export * from './RichTextComp'

export function setupRichText() {
  GameWorld.Instance.systems.add(RichTextSystem)
  GameWorld.Instance.systems.configureOnce(RichTextSystem)
}
