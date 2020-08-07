export const drawGrid = (layer, width = 30, height = 20) => {
  const { canvas, context } = layer

  const lineSize = 1

  context.fillStyle = 'white'

  context.fillRect(0, 0, lineSize, canvas.height)
  context.fillRect(0, 0, canvas.width, lineSize)

  // quotient
  const q = canvas.height / height

  // columns
  for (let i = 0; i < width + 1; i++) {
    context.fillRect(Math.floor(q * i) - lineSize, 0, lineSize, canvas.height)
  }

  // rows
  for (let i = 0; i < height + 1; i++) {
    context.fillRect(0, Math.floor(q * i) - lineSize, canvas.width, lineSize)
  }
}
