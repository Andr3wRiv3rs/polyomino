import { drawHook } from '../canvas'

export const layers = []

export const newLayer = (props = {}, onReady = () => {}) => {
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
    layer.props = props

    if (props.blur) {
      layer.context.filter = "blur(10px)"
    }

    Object.assign(layer, drawHook(layer))

    onReady(layer)
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

export const resizeLayer = ({ canvas, props }) => {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth

  if (props.blur) {
    canvas.height = window.innerHeight / 10
    canvas.width = window.innerWidth / 10
  }
}


window.addEventListener('resize', () => layers.forEach(resizeLayer))
