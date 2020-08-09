export const drawGrid = (layer, { level, translateTileSize: t }) => {
  const { canvas, context } = layer
  const { width, height } = level

  const lineSize = 1

  context.fillStyle = 'white'

  context.fillRect(0, 0, lineSize, canvas.height)
  context.fillRect(0, 0, canvas.width, lineSize)
  context.fillRect(canvas.width - lineSize, 0, lineSize, canvas.height)
  context.fillRect(0, canvas.height - lineSize, canvas.width, lineSize)

  // columns
  for (let i = 0; i < width; i++) {
    context.fillRect(t(i + 1), 0, lineSize, canvas.height)
  }

  // rows
  for (let i = 0; i < height; i++) {
    context.fillRect(0, t(i + 1), canvas.width, lineSize)
  }
}
