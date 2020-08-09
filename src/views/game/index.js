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
  drawPath,
} from '@/scripts/game'

import {
  level1,
} from '@/scripts/game/levels'

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
      { 
        ...globals,
        destroy, 
      },
    )

    events.on('update', () => updateListener())
  }

  if (globals.started) createListener() 
  else events.on('create', createListener)

  return { 
    state, 
    destroy,
  }
}

const testGridCollide = ({ x, y }) => {
  return globals.gridColliders[x] && globals.gridColliders[x][y] ? true : false
}

const addGridColliders = (coordinatesArray) => {
  for (const { x, y } of coordinatesArray) {
    if (globals.gridColliders[x] === undefined) globals.gridColliders[x] = []
    globals.gridColliders[x][y] = true
  }
}

const removeGridColliders = (coordinatesArray) => {
  for (const { x, y } of coordinatesArray) {
    globals.gridColliders[x].splice(y, 1)
  }
}

const translateTileSize = int => Math.ceil(globals.tileSize * int)

const update = () => {
  events.emit('clear')
  events.emit('update')
}

const globals = {
  tileSize: 0,
  gridWidth: 0,
  gridHeight: 0,
  aspectRatio: 0,
  framerate: 60,
  events,
  started: false,
  gridColliders: [],
  gameObject,
  translateTileSize,
  testGridCollide,
  addGridColliders,
  removeGridColliders,
  update,
}

window.globals = globals

const start = (level = level1) => {
  events.on('clear', () => clearLayers(mainLayer, cursorLayer))

  const aspectRatio = level.height / level.width

  Object.assign(globals, {
    level,
    aspectRatio,
  })

  globals.addGridColliders(level.path())

  let loop

  setupResizeListener(aspectRatio, () => {
    clearInterval(loop)

    const tileSize = mainLayer.canvas.width / level.width

    Object.assign(globals, { tileSize })

    clearLayers(gridLayer)

    drawPath(level.path, gridLayer, globals)
    drawGrid(gridLayer, level)

    update()

    loop = setInterval(update, 1000 / globals.framerate)
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
