import { newPath } from '../paths'

const startPoint = { x: 0, y: 5 }

export const level1 = {
  width: 30,
  height: 16,

  path: function* () {
    const { moveBy } = newPath(startPoint)
    
    yield startPoint

    yield* moveBy(10, 0)
    yield* moveBy(0, 5)
    yield* moveBy(10, 0)
    yield* moveBy(0, -5)
    yield* moveBy(8, 0)

    yield* moveBy(1, 0)
  },
}
