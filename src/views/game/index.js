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
  setupCursors,
  drawPath,
  testGridCollide,
  addGridColliders,
  removeGridColliders,
} from '@/scripts/game'

import { levels } from '@/scripts/game/levels'

const events = new Emitter()
const gridLayer = newLayer({ class: style.grid })
const mainLayer = newLayer()
const cursorLayer = newLayer()

const gameObject = (create) => {
  const state = {}

  const destroy = () => events.removeListener('update', updateListener)

  const updateListener = create(state, { destroy })

  events.on('update', updateListener)

  return { 
    state, 
    destroy,
  }
}

const translateTileSize = int => Math.ceil(globals.tileSize * int)

const update = () => {
  events.emit('clear')
  events.emit('update')
}

const globals = {
  loop: null, // game loop
  tileSize: 0, // pixel size of each grid tile relative to canvas width 
  aspectRatio: 0, // quotient of level.height / level.width
  framerate: 60, // interval set to 1000 / framerate
  events, // node.js event emitter
  gameObject,
  translateTileSize,
  testGridCollide,
  addGridColliders,
  removeGridColliders,
  update,
}

window.globals = globals

const start = () => {
  const level = levels['level1']

  events.on('clear', () => clearLayers(mainLayer, cursorLayer))

  const aspectRatio = level.height / level.width

  Object.assign(globals, {
    level,
    aspectRatio,
  })

  globals.addGridColliders(level.path())

  globals.loop = setInterval(update, 1000 / globals.framerate)

  setupResizeListener(aspectRatio, () => {
    globals.tileSize = mainLayer.canvas.width / level.width

    clearLayers(gridLayer)

    drawPath(level.path, gridLayer, globals)
    drawGrid(gridLayer, globals)

    update()
  })

  setupCursors(globals, cursorLayer)

  events.emit('create')
}

export default ['div', { 
  class: style.game,

  onMounted () {
    requestAnimationFrame(start)
  },
}, [
  ['div', { class: style.container }, getLayerComponent()],
]]
