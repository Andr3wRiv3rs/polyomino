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

export const drawPath = (path, layer, { offsetX, offsetY, translateTileSize: t }) => {
  for (const { x, y } of path()) {
    layer.drawRect(t(x) + offsetX, t(y) + offsetY, t(1), t(1), 'white')
  }
  
  for (const { x, y } of path()) {
    layer.drawRect(t(x) + offsetX, t(y) + offsetY, t(1), t(1), 'white')
  }
}
