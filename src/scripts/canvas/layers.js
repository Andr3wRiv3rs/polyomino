export const layers = []

export const newLayer = (props, onReady = () => {}) => {
  const layer = {
    props,
    canvas: null,
    context: null,
  }

  layer.onMounted = function () {
    layer.canvas = this
    layer.context = this.getContext('2d')

    onReady.bind(layer)(layer)
  }

  layers.push(layer)

  return layer
}

export const getLayerComponent = () => {
  return layers.map(({ props, onMounted }) => {
    return ['canvas', {
      ...props,
      onMounted,
    }]
  })
}

export const resizeLayer = (width, height) => ({ canvas }) => {
  canvas.height = height
  canvas.width = width

  canvas.style.height = height + 'px'
  canvas.style.width = width + 'px'
}

export const resize = (aspectRatio, callback) => {
  const container = layers[0].canvas.parentElement

  const padding = 100

  let width = Math.ceil(window.innerWidth - padding)
  let height = Math.ceil((window.innerWidth - padding) * aspectRatio)

  if (height > window.innerHeight - padding) {
    height = window.innerHeight - padding
    width = height / aspectRatio
  }

  width -= width % 2
  height -= height % 2

  container.style.width = width + 'px'
  container.style.height = height + 'px'

  layers.forEach(resizeLayer(width, height))
  callback()
} 

export const setupResizeListener = (aspectRatio, callback = () => {}) => {
  resize(aspectRatio, callback)

  window.addEventListener('resize', () => {
    resize(aspectRatio, callback)
  })
}
