export const drawRect = ({ context }, x, y, width, height, style = 'white') => {
  context.fillStyle = style
  context.fillRect(x, y, width, height)
}

export const clearLayers = (...layers) => {
  for (const layer of layers) layer.context.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
}

export const clearRect = ({ context }, x, y, width, height) => {
  context.clearRect(x, y, width, height)
}

export * from './grid'
export * from './layers'
