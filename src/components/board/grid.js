import * as draw from './draw'

export const drawGrid = (layer, width = 30, height = 20) => {
  const { canvas } = layer

  const lineSize = 1

  draw.rect(layer, 0, 0, lineSize, canvas.height)
  draw.rect(layer, 0, 0, canvas.width, lineSize)

  // quotient
  const q = canvas.height / height

  // columns
  for (let i = 0; i < width + 1; i++) {
    draw.rect(layer, Math.floor(q * i) - lineSize, 0, lineSize, canvas.height)
  }

  // rows
  for (let i = 0; i < height + 1; i++) {
    draw.rect(layer, 0, Math.floor(q * i) - lineSize, canvas.width, lineSize)
  }
}
