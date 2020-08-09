export const drawGrid = (layer, level) => {
  const { canvas, context } = layer
  const { width, height } = level

  const lineSize = 1

  context.fillStyle = 'white'

  context.fillRect(0, 0, lineSize, canvas.height)
  context.fillRect(0, 0, canvas.width, lineSize)
  context.fillRect(canvas.width - lineSize, 0, lineSize, canvas.height)
  context.fillRect(0, canvas.height - lineSize, canvas.width, lineSize)

  // quotient
  const q = canvas.height / height

  // columns
  for (let i = 0; i < width; i++) {
    context.fillRect(Math.ceil(q * (i + 1)) - lineSize + 1, 0, lineSize, canvas.height)
  }

  // rows
  for (let i = 0; i < height; i++) {
    context.fillRect(0, Math.ceil(q * (i + 1)) - lineSize + 1, canvas.width, lineSize)
  }
}
