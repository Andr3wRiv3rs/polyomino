import { drawRect } from '../canvas'

export const newPath = ({ x, y } = { x: 0, y: 0 }) => {
  const move = (offsetX, offsetY) => {
    x += offsetX
    y += offsetY

    return { x, y }
  }
  
  const moveTo = function* (newX, newY) {
    while (x < newX) yield move(1, 0)
    while (x > newX) yield move(-1, 0)
    while (y < newY) yield move(0, 1)
    while (y > newY) yield move(0, -1)
  }

  const moveBy = (offsetX, offsetY) => moveTo(x + offsetX, y + offsetY)

  return {
    move,
    moveTo,
    moveBy,
  }
}

export const drawPath = (path, layer, { translateTileSize: t }) => {
  for (const { x, y } of path()) {
    drawRect(layer, t(x), t(y), t(1), t(1), 'white')
  }
}
