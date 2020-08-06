import Emitter from 'events'

import { 
  newLayer,
  getLayerComponent,
  setupResizeListener,
} from './layers'

import * as draw from './draw'

const boardEmitter = new Emitter()

const gridLayer = newLayer('grid')
const mainLayer = newLayer('main')

const redraw = () => {
  draw.rect(mainLayer, 0, 0, 100, 100)
}

const start = () => {
  setupResizeListener(() => {
    draw.clear(mainLayer)
    redraw()
  })
}

export default {
  on: (...props) => boardEmitter.on(...props),
  emit: (...props) => boardEmitter.emit(...props),

  start,

  component: getLayerComponent(),
}
