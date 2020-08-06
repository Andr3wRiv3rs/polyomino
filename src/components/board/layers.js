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

export const resizeLayer = ({ canvas }) => {
  canvas.height = canvas.parentElement.clientHeight
  canvas.width = canvas.parentElement.clientHeight
  console.log(canvas.height)
}

export const setupResizeListener = (callback = () => {}) => {
  layers.forEach(resizeLayer)
  callback()

  window.addEventListener('resize', () => {
    layers.forEach(resizeLayer)
    callback()
  })
}
