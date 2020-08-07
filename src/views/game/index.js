import style from './game.css'

import { cursorController } from '@/scripts/input'

import {
  drawRect, 
  drawGrid,
  clearLayers, 
  newLayer,
  getLayerComponent,
  setupResizeListener,
} from '@/scripts/canvas'

import Emitter from 'events'

const events = new Emitter()
const gridLayer = newLayer({ class: style.grid })
const mainLayer = newLayer()
const cursorLayer = newLayer()

const gameObject = (create) => {
  const state = {}

  events.on('create', () => {
    events.on('update', create(state, globals))
  })

  return state
}

const globals = {
  tileSize: 0,
  gridWidth: 0,
  gridHeight: 0,
  aspectRatio: 0,
  events,
  gameObject,
}

const square = gameObject((state, globals) => {
  state.x = 0
  state.y = 0

  return () => {
    const { tileSize } = globals
    drawRect(mainLayer, state.x * tileSize, state.y * tileSize, tileSize, tileSize)
  }
})

const update = () => {
  events.emit('clear')
  events.emit('update')
}

const start = (gridWidth = 30, gridHeight = 15) => {
  events.on('clear', () => clearLayers(mainLayer))

  const aspectRatio = gridHeight / gridWidth

  Object.assign(globals, {
    gridWidth,
    gridHeight,
    aspectRatio,
  })

  let loop

  setupResizeListener(aspectRatio, () => {
    clearInterval(loop)

    const tileSize = mainLayer.canvas.width / gridWidth

    Object.assign(globals, { tileSize })

    clearLayers(gridLayer)
    drawGrid(gridLayer, gridWidth, gridHeight)

    loop = setInterval(update, 1000 / 60)
  })

  events.emit('create')
}

export default () => ['div', { 
  class: style.game,

  onMounted () {
    requestAnimationFrame(() => {
      start()
    })
  },
}, [
  ['div', { 
    class: style.container,
  }, getLayerComponent()],
]]
