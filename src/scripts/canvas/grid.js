export const drawGrid = (layer, { level, translateTileSize: t, offsetX, offsetY, padding }) => {
  const { canvas, context } = layer
  const { width, height } = level

  const lineSize = 1

  context.fillStyle = 'white'

  // columns
  for (let i = 0; i < width + 1; i++) {
    context.fillRect(t(i) + offsetX, offsetY, lineSize, t(level.height))
  }

  // rows
  for (let i = 0; i < height + 1; i++) {
    context.fillRect(offsetX, t(i) + offsetY, t(level.width), lineSize)
  }
}
