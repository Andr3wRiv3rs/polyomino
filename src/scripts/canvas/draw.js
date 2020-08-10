export const drawHook = ({ canvas, context }) => ({
  drawRect: (x, y, width, height, style = 'white') => {
    context.fillStyle = style
    context.fillRect(x, y, width, height)
  },
  
  clear: () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
  },
  
  clearRect: (x, y, width, height) => {
    context.clearRect(x, y, width, height)
  },
})

export const clearLayers = (...layers) => layers.forEach(({ clear }) => clear())
