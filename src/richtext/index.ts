import { GameWorld } from '../gworld'
import { RichTextSystem } from './RichTextSystem'

export function setupRichText() {
  GameWorld.Instance.systems.add(RichTextSystem)
  GameWorld.Instance.systems.configureOnce(RichTextSystem)
}
