export const rect = ({ context }, x, y, width, height, style = 'white') => {
  context.fillStyle = style
  context.fillRect(x, y, width, height)
}

export const clear = ({ canvas, context }) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

export const clearRect = ({ context }, x, y, width, height) => {
  context.clearRect(x, y, width, height)
}
