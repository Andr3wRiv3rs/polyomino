import Emitter from 'events'
import style from './board.css'
import blockTypes from './blockTypes'

const shuffle = (array) => {
  let counter = array.length

  while (counter > 0) {
    let index = Math.floor(Math.random() * counter)
    counter--
    let temp = array[counter]
    array[counter] = array[index]
    array[index] = temp
  }

  return array
}

export default () => {
  let canvas, context, blurCanvas, blurContext, ghostCanvas, ghostContext, timeout

  let resolutionQuotient = 1

  const blockColor = '#5BDAFF'
  const borderColor = getComputedStyle(document.children[0]).getPropertyValue('--border')
  const boardEmitter = new Emitter()
  const grid = [], queue = [], hand = []
  const blockSize = 9, speed = 500, gridWidth = 16, gridHeight = 30
  const px = blockSize / 9

  let speedMultiplier = 1

  const iterate = ({ x: gridX, y: gridY, block }, callback) => {
    for (let x = 0; x < block[0].length; x++) {
      for (let y = 0; y < block.length; y++) {
        const value = block[y][x]
  
        if (value) callback({ 
          x: gridX + x, 
          y: gridY + y, 
          value,
        })
      }
    }
  }
  
  const iterateHeld = (held, callback) => {
    iterate({
      ...held,
      block: held.block[held.rotation],
    }, callback)
  }

  const pushQueue = () => queue.push(...shuffle([...blockTypes, ...blockTypes]))
  const pushHand = () => hand.push(...queue.splice(0, 4))

  pushQueue()
  pushHand()

  for (let x = -1; x < gridWidth + 1; x++){
    let column = []

    for (let y = -1; y < gridHeight + 1; y++){
      column.push( 
        x < 0 || x >= gridWidth || y >= gridHeight
          ? 1
          : 0,
      )
    }

    grid.push(column)
  }

  const held = {
    x: 0,
    y: 0,
    rotation: 0,
    block: hand[0],
    index: 0,
  }

  const setHeld = index => {
    held.block = hand[index]
    held.index = index
  }

  const getNextHeld = () => {
    held.rotation = 0
    held.x = Math.floor(gridWidth / 2) - 1
    held.y = -2 // TODO: work out the bottom of the block and change this value accordingly
    hand.splice(held.index, 1)
    if (hand.length === 0) pushHand()
    if (queue.length < 4) pushQueue()
    setHeld(0)
  }

  const willCollide = (held) => {
    let result = false
  
    iterateHeld(held, ({ x, y, value }) => { 
      if (value === 1 && y >= 0 && grid[x + 1][y + 1]) result = true 
    })
  
    // TODO: fix slide under collision

    return result
  }

  const step = () => {
    if (willCollide({
      ...held,
      y: held.y + 1,
    })) {
      iterateHeld(held, 
        ({ x, y, value }) => {
          grid[x + 1][y + 1] = value
        },
      )

      getNextHeld()
    } else {
      clear()
      held.y++
      draw()
    }
  }
   
  // let started = false

  const loop = () => {
    step()
  
    timeout = setTimeout(loop, speed / speedMultiplier)
  }

  const startLoop = () => timeout = setTimeout(loop, speed / speedMultiplier)
  const endLoop = () => clearTimeout(timeout)
  const restartLoop = () => {
    endLoop()
    startLoop()
    step()
  }

  const drawRect = (x, y, width, height, fill = borderColor) => {
    context.fillStyle = fill
    context.fillRect(x, y, width, height)
  }

  const clearBlock = ({ x, y, value }) => {
    if (value !== 1) return

    context.clearRect(x * blockSize + px, y * blockSize, blockSize, blockSize)
  }

  const drawBlock = ({ x, y, value }, fill = blockColor) => {
    if (value !== 1) return

    context.fillStyle = fill
    context.fillRect(x * blockSize + (px * 2), y * blockSize, blockSize - px, blockSize - px)
    context.clearRect(x * blockSize + (px * 3), y * blockSize + px, blockSize - (px * 3), blockSize - (px * 3))
    context.fillRect(x * blockSize + (px * 6), y * blockSize + (px * 3), px, px)
    context.fillRect(x * blockSize + (px * 7), y * blockSize + (px * 2), px, px)
  }

  const clearGhost = () => {
    ghostContext.clearRect(0, 0, ghostCanvas.width, ghostCanvas.height)
  }

  const drawGhost = () => {
    const t = int => int * Math.floor(resolutionQuotient) // translate

    const ghost = ghostContext.createLinearGradient(
      0, 
      0, 
      ghostCanvas.width, 
      ghostCanvas.height * 1.7, 
    )

    ghost.addColorStop(0, blockColor)
    ghost.addColorStop(1, 'transparent')

    ghostContext.fillStyle = ghost

    let minX = canvas.width, maxX = 0, maxY = 0

    iterateHeld(held, ({ x, y, value }) => {
      if (value === 1) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    })

    iterateHeld(held, ({ x, y, value }) => {
      if (value === 2) {
        ghostContext.fillRect(
          t(x) * blockSize + t(px) + (x === minX ? t(px) : 0), 
          t(y) * blockSize - t(px), 
          t(blockSize) - (x === minX ? t(px) : 0), 
          t(blockSize), 
        )
      }
    })
    
    ghostContext.fillRect(
      t(minX) * blockSize + t(px * 2), 
      t(maxY + 1) * blockSize - t(px), 
      t(blockSize * (maxX - minX + 1)) - t(px), 
      ghostCanvas.height, 
    )
  }

  const draw = () => {
    iterateHeld(held, drawBlock)
    drawGhost()
  }

  const clear = () => {
    iterateHeld(held, clearBlock)
    clearGhost()
  }

  const resizeCanvas = () => {
    resolutionQuotient = canvas.parentElement.clientHeight / canvas.height
    canvas.style.height = Math.floor(resolutionQuotient) * canvas.height

    const { 
      width, 
      height,
    } = canvas.getBoundingClientRect()

    blurCanvas.height = height
    blurCanvas.width = width
    blurCanvas.style.height = height
    ghostCanvas.height = height
    ghostCanvas.width = width
    ghostCanvas.style.height = height
  }

  const goLeft = () => {
    if (!willCollide({
      ...held,
      x: held.x - 1,
    })) {
      clear()
      held.x--
      draw()
    }
  }

  const goRight = () => {
    if (!willCollide({
      ...held,
      x: held.x + 1,
    })) {
      clear()
      held.x++
      draw()
    }
  }

  const rotateLeft = () => {
    const newRotation = held.rotation - 1 > -1 ? held.rotation - 1 : 3

    if (!willCollide({
      ...held,
      rotation: newRotation,
    })) {
      clear()
      held.rotation = newRotation
      draw()
    }
  }

  const rotateRight = () => {
    const newRotation = held.rotation + 1 < 4 ? held.rotation + 1 : 0

    if (!willCollide({
      ...held,
      rotation: newRotation,
    })) {
      clear()
      held.rotation = newRotation
      draw()
    }
  }

  const instantlyPlace = () => {
    while (!willCollide({
      ...held,
      y: held.y + 1,
    })) {
      step()
    }

    step()
  }

  const setSpeedMultiplier = int => {
    speedMultiplier = int
  }

  const init = () => {
    canvas.height = gridHeight * blockSize + (px * 1)
    canvas.width = gridWidth * blockSize + (px * 4)

    getNextHeld()

    drawRect(0, 0, px, canvas.height)
    drawRect(px, canvas.height  - px, canvas.width - (px * 3), px)
    drawRect(canvas.width - (px * 2), 0, px, canvas.height)

    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)

    startLoop()

    // setInterval(rotateRight, 50)
  }

  const component = [
    ['canvas', {
      class: `${style.blur} ${style.board}`,

      onMounted () {
        blurCanvas = this
        blurContext = this.getContext('2d')
      },
    }],

    ['canvas', { 
      class: `${style.ghost} ${style.board}`,

      onMounted () {
        ghostCanvas = this
        ghostContext = this.getContext('2d')
      },
    }],

    ['canvas', { 
      class: `${style.board}`,

      onMounted () {
        canvas = this
        context = this.getContext('2d')

        init()
      },
    }],
  ]

  return {
    on: (...props) => boardEmitter.on(...props),
    emit: (...props) => boardEmitter.emit(...props),

    step,
    restartLoop,

    goLeft,
    goRight,
    rotateLeft,
    rotateRight,
    setHeld,
    setSpeedMultiplier,
    instantlyPlace,

    component,
  }
}
