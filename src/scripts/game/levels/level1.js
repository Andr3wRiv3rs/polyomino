import { newPath } from '../paths'

import { square, generateEnemies } from '../enemies'

import { timer } from '../../utils'

const startPoint = { x: 0, y: 5 }

export const level1 = {
  width: 30,
  height: 16,

  split: false,

  path: function* () {
    const { moveBy } = newPath(startPoint)
    
    level1.split = !level1.split

    const { split } = level1

    yield startPoint

    yield* moveBy(10, 0)
    if (split) yield* moveBy(0, 5)
    yield* moveBy(10, 0)
    if (split) yield* moveBy(0, -5)
    yield* moveBy(9, 0)

    // yield* moveBy(1, 0)
  },

  waves: function* () {
    yield async function* waveOne () {
      for (const enemy of generateEnemies([11, square])) {
        yield enemy
        await timer(500)
      }
    }
  },
}
