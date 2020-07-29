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

const debug = false

export default () => {
  let canvas, context, blurCanvas, blurContext, ghostCanvas, ghostContext, debugCanvas, debugContext, timeout

  let resolutionQuotient = 1

  const t = int => int * Math.floor(resolutionQuotient) // translate

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
    hand.splice(held.index, 1)
    if (hand.length === 0) pushHand()
    if (queue.length < 4) pushQueue()

    setHeld(0)

    held.rotation = 0

    held.x = Math.floor(gridWidth / 2) - 1

    let minY = gridHeight, maxY = -5

    iterateHeld(held, ({ y, value }) => {
      if (value === 1) {
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    })

    const offset = held.y - minY

    held.y = (minY - maxY + offset - 1)
  }

  const willCollide = (held) => {
    let result = false
  
    iterateHeld(held, ({ x, y, value }) => { 
      if (value === 2) return
      if (x < 0) result = true
      if (x > gridWidth - 1) result = true
      if (y >= 0 && grid[x + 1][y + 1]) result = true 
    })
  
    return result
  }


  const place = () => {
    iterateHeld(held, 
      ({ x, y, value }) => {
        if (value !== 1) return

        grid[x + 1][y + 1] = value
      },
    )

    getNextHeld()

    clear()

    draw()
  }

  let lock = false // extra step to slide

  const step = () => {
    if (willCollide({
      ...held,
      y: held.y + 1,
    })) {
      if (lock) {
        lock = false
        place()
      } else {
        lock = true
      }
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

  const start = () => timeout = setTimeout(loop, speed / speedMultiplier)
  const stop = () => clearTimeout(timeout)
  const restart = () => {
    stop()
    start()
    step()
  }

  const clearRect = (x, y, width, height) => {
    context.clearRect(x, y, width, height)
  }

  const drawRect = (x, y, width, height, fill = borderColor) => {
    context.fillStyle = fill
    context.fillRect(x, y, width, height)
  }

  const clearBlock = ({ x, y, value }) => {
    if (value !== 1) return

    context.clearRect(x * blockSize + px, y * blockSize + px, blockSize, blockSize)
  }

  const drawBlock = ({ x, y, value }, fill = blockColor) => {
    if (value !== 1) return

    context.fillStyle = fill
    context.fillRect(x * blockSize + (px * 2), y * blockSize + (px * 2), blockSize - px, blockSize - px)
    context.clearRect(x * blockSize + (px * 3), y * blockSize + (px * 2) + px, blockSize - (px * 3), blockSize - (px * 3))
    context.fillRect(x * blockSize + (px * 6), y * blockSize + (px * 2) + (px * 3), px, px)
    context.fillRect(x * blockSize + (px * 7), y * blockSize + (px * 2) + (px * 2), px, px)
  }

  const clearGhost = () => {
    ghostContext.clearRect(0, 0, ghostCanvas.width, ghostCanvas.height)
  }

  const drawGhost = () => {
    const ghost = ghostContext.createLinearGradient(
      0, 
      0, 
      ghostCanvas.width, 
      ghostCanvas.height * 1.7, 
    )

    ghost.addColorStop(0, blockColor)
    ghost.addColorStop(1, 'transparent')

    ghostContext.fillStyle = ghost

    let minX = canvas.width, maxX = 0, maxY = -5

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
          t(y) * blockSize + t(px), 
          t(blockSize), 
          t(blockSize), 
        )
      }
    })
    
    ghostContext.fillRect(
      t(minX) * blockSize + t(px * 2), 
      t(maxY + 1) * blockSize + t(px), 
      t(blockSize * (maxX - minX + 1)) - t(px), 
      ghostCanvas.height, 
    )
  }

  const drawDebugBlock = (x, y, style) => {
    debugContext.fillStyle = style

    debugContext.fillRect(
      t(x - 1) * blockSize + t(px), 
      t(y - 1) * blockSize - t(px), 
      t(blockSize), 
      t(blockSize), 
    )
  }

  const clearFrame = () => {
    clearRect(0, 0, px, canvas.height)
    clearRect(px, canvas.height  - px, canvas.width - (px * 3), px)
    clearRect(px, 0, canvas.width - (px * 3), px)
    clearRect(canvas.width - (px * 2), 0, px, canvas.height)
  }

  const drawFrame = () => {
    drawRect(0, 0, px, canvas.height)
    drawRect(px, canvas.height  - px, canvas.width - (px * 3), px)
    drawRect(px, 0, canvas.width - (px * 3), px)
    drawRect(canvas.width - (px * 2), 0, px, canvas.height)
  }

  const draw = () => {
    iterateHeld(held, drawBlock)

    drawGhost()
    drawFrame()

    blurContext.drawImage(canvas, 0, 0, t(canvas.width), t(canvas.height))

    if (debug) {
      for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
          const value = grid[x][y]
    
          switch (value) {
          case 1:
            drawDebugBlock(x, y, 'red')
            break

          case 2:
            drawDebugBlock(x, y, 'blue')
            break
          }
        }
      }
    }
  }

  const clear = () => {
    iterateHeld(held, clearBlock)
    clearGhost()
    clearFrame()
    blurContext.clearRect(0, 0, blurCanvas.width, blurCanvas.height)
  }

  const resizeCanvas = () => {
    clear()

    resolutionQuotient = canvas.parentElement.clientHeight / canvas.height
    canvas.style.height = Math.floor(resolutionQuotient) * canvas.height

    const { 
      width, 
      height,
    } = canvas.getBoundingClientRect()

    const applyResize = (...canvases) => canvases.forEach(canvas => {
      canvas.height = height
      canvas.width = width
      canvas.style.height = height
    })

    applyResize(blurCanvas, ghostCanvas, debugCanvas)

    draw()
  }

  const move = (x, y) => {
    if (!willCollide({
      ...held,
      x: held.x + x,
      y: held.y + y,
    })) {
      clear()
      held.x += x
      held.y += y
      draw()
    }
  }
  
  const rotate = (direction) => {
    let newRotation = held.rotation + direction

    if (newRotation > 3) newRotation = 0
    if (newRotation < 0) newRotation = 3

    if (!willCollide({
      ...held,
      rotation: newRotation,
    })) {
      clear()
      held.rotation = newRotation
      draw()
    }
  }

  const goLeft = () => move(-1, 0)
  const goRight = () => move(1, 0)
  const goUp = () => move(0, -1)
  const goDown = () => move(0, 1)
  const rotateLeft = () => rotate(-1)
  const rotateRight = () => rotate(+1)

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
    restart()
  }

  const ready = () => {
    canvas.height = gridHeight * blockSize + (px * 3)
    canvas.width = gridWidth * blockSize + (px * 4)

    getNextHeld()

    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)

    step()
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
      class: `${style.debug} ${style.board}`,

      onMounted () {
        debugCanvas = this
        debugContext = this.getContext('2d')
      },
    }],

    ['canvas', { 
      class: `${style.board}`,

      onMounted () {
        canvas = this
        context = this.getContext('2d')
      },
    }],
  ]

  return {
    on: (...props) => boardEmitter.on(...props),
    emit: (...props) => boardEmitter.emit(...props),

    ready,
    step,
    start,
    restart,
    stop,

    goLeft,
    goRight,
    goUp,
    goDown,
    rotateLeft,
    rotateRight,
    setHeld,
    setSpeedMultiplier,
    place,
    instantlyPlace,

    component,
  }
}
