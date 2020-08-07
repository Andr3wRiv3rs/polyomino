import style from './game.css'

import {
  drawGrid,
  clearLayers, 
  newLayer,
  getLayerComponent,
  setupResizeListener,
} from '@/scripts/canvas'

import Emitter from 'events'

import { 
  cursors,
} from '@/scripts/game'

import { link } from 'bitt'

const events = new Emitter()
const gridLayer = newLayer({ class: style.grid })
const mainLayer = newLayer()
const cursorLayer = newLayer()

const gameObject = (create) => {
  const state = {}

  let updateListener

  const destroy = () => {
    events.removeListener('update', updateListener)
  }

  const createListener = () => {
    updateListener = create(
      state, 
      { destroy }, 
      globals,
    )

    events.on('update', () => updateListener({
      translateTileSize: int => globals.tileSize * int,
    }))
  }

  if (globals.started) createListener() 
  else events.on('create', createListener)

  return { 
    state, 
    destroy,
  }
}

const globals = {
  tileSize: 0,
  gridWidth: 0,
  gridHeight: 0,
  aspectRatio: 0,
  events,
  started: false,
  gameObject,
}

const update = () => {
  events.emit('clear')
  events.emit('update')
}

const start = (gridWidth = 30, gridHeight = 15) => {
  events.on('clear', () => clearLayers(mainLayer, cursorLayer))

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

  cursors(globals, cursorLayer)

  events.emit('create')

  globals.started = true
}

export default ['div', { 
  class: style.game,

  onMounted () {
    requestAnimationFrame(() => {
      start()
    })
  },
}, [
  ['div', { 
    class: style.container,
  }, [
    getLayerComponent(),
  ]],
]]
