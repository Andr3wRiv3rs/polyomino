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
    layer.canvas.height = window.innerHeight
    layer.canvas.width = window.innerWidth

    onReady.bind(layer)(layer)
  }

  layers.push(layer)

  return layer
}

export const getLayerComponent = () => {
  return layers.map(({ props, onMounted }) => {
    return ['canvas', {
      ...props,
      width: window.innerWidth,
      height: window.innerHeight,
      onMounted,
    }]
  })
}

export const resizeLayer = ({ canvas }) => {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth
}


window.addEventListener('resize', () => layers.forEach(resizeLayer))
