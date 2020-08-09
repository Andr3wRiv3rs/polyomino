import style from './game.css'

import {
  drawGrid,
  clearLayers, 
  newLayer,
  getLayerComponent,
  setupResizeListener,
} from '@/scripts/canvas'

import { 
  setupCursors,
  drawPath,
  testGridCollide,
  addGridColliders,
  removeGridColliders,
  gameObject,
  gameObjects,
} from '@/scripts/game'

import { levels } from '@/scripts/game/levels'

const gridLayer = newLayer({ class: style.grid })
const mainLayer = newLayer()
const cursorLayer = newLayer()

const update = () => {
  clearLayers(mainLayer, cursorLayer)
  for (const { update } of gameObjects) update()
}

const globals = {
  loop: null, // game loop
  tileSize: 0, // pixel size of each grid tile relative to canvas width 
  offsetX: 0,
  offsetY: 0,
  padding: 100,
  translateTileSize: int => Math.ceil(globals.tileSize * int),
  gameObject,
  testGridCollide,
  addGridColliders,
  removeGridColliders,
  update,
}

const computeResize = () => {
  const aspectRatio = globals.level.height / globals.level.width

  if (window.innerWidth * aspectRatio + globals.padding > window.innerHeight) {
    globals.offsetX = Math.ceil((window.innerWidth - (window.innerHeight / aspectRatio)) / 2) + globals.padding * 2
    globals.offsetY = Math.ceil(globals.padding)
  } else {
    globals.offsetX = Math.ceil(globals.padding)
    globals.offsetY = Math.ceil((window.innerHeight - (window.innerWidth * aspectRatio - globals.padding)) / 2)
  }

  globals.tileSize = (window.innerWidth - globals.offsetX * 2) / globals.level.width

  clearLayers(gridLayer)

  drawPath(globals.level.path, gridLayer, globals)
  drawGrid(gridLayer, globals)

  update()
}

export default ['div', { 
  class: style.game,

  onMounted () {
    globals.level = levels['level1']
  
    addGridColliders(globals.level.path())
  
    globals.loop = setInterval(update, 1000 / 60)
  
    computeResize()

    window.addEventListener('resize', computeResize)
  
    setupCursors(globals, cursorLayer)
  },
}, getLayerComponent()]
