import Emitter from 'events'
import style from './board.css'

import { 
  newLayer,
  getLayerComponent,
  setupResizeListener,
} from './layers'

import * as draw from './draw'

import { drawGrid } from './grid'

const boardEmitter = new Emitter()

const gridLayer = newLayer('grid')
const mainLayer = newLayer('main')

const start = (gridWidth = 30, gridHeight = 15) => {
  const aspectRatio = gridHeight / gridWidth

  setupResizeListener(aspectRatio, () => {
    const tile = mainLayer.canvas.width / gridWidth

    draw.clear(mainLayer)
    draw.clear(gridLayer)
    drawGrid(gridLayer, gridWidth, gridHeight)

    draw.rect(mainLayer, tile * 2, tile * 1, tile, tile)
  })
}

export default {
  on: (...props) => boardEmitter.on(...props),
  emit: (...props) => boardEmitter.emit(...props),

  start,

  component: ['div', { 
    class: style.container,
  }, getLayerComponent()],
}
