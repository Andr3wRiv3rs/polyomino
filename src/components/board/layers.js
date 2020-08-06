import style from './board.css'

export const layers = []

export const newLayer = (name, onReady = () => {}) => {
  const layer = {
    name,
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
  return layers.map(({ name, onMounted }) => {
    return ['canvas', {
      class: `${name ? style[name] : ''} ${style.canvas}`,
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

  let width = window.innerWidth - padding
  let height = width * aspectRatio

  if (height > window.innerHeight - padding) {
    height = window.innerHeight - padding
    width = height / aspectRatio
  }

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
