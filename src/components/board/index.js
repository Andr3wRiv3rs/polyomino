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

export default () => {
  const borderColor = getComputedStyle(document.children[0]).getPropertyValue('--border')

  const boardEmitter = new Emitter()
  const blockSize = 9, speed = 500, speedMultiplier = 1, gridWidth = 16, gridHeight = 30
  const grid = [], queue = [], hand = []

  const px = blockSize / 9

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
    held.x = Math.floor(gridWidth / 2) - 1
    held.y = -2
    hand.splice(held.index, 1)
    if (hand.length === 0) pushHand()
    if (queue.length < 4) pushQueue()
    setHeld(0)
  }

  const willCollide = (held) => {
    let result = false
  
    iterateHeld(held, ({ x, y }) => { 
      if (y >= 0 && grid[x + 1][y + 1]) result = true 
    })
  
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
      iterateHeld(held, clearBlock)
      held.y++
      iterateHeld(held, drawBlock)
    }
  }
   
  let started = false

  let canvas, context, timeout

  const loop = () => {
    step()
  
    timeout = setTimeout(loop, speed * speedMultiplier)
  }

  const startLoop = () => timeout = setTimeout(loop, speed * speedMultiplier)
  const endLoop = () => clearTimeout(timeout)

  const drawRect = (x, y, width, height, fill = borderColor) => {
    context.fillStyle = fill
    context.fillRect(x, y, width, height)
  }

  const clearBlock = ({ x, y }) => {
    context.clearRect(x * blockSize + px, y * blockSize, blockSize, blockSize)
  }

  const drawBlock = ({ x, y }, fill = '#5BDAFF') => {
    context.fillStyle = fill
    context.fillRect(x * blockSize + px, y * blockSize, blockSize - px, blockSize - px)
    context.clearRect(x * blockSize + px + px, y * blockSize + px, blockSize - px - px - px, blockSize - px - px - px)
    context.fillRect(x * blockSize + px + (px * 4), y * blockSize + (px * 3), px, px)
    context.fillRect(x * blockSize + px + (px * 5), y * blockSize + (px * 2), px, px)
  }

  const init = () => {
    canvas.height = gridHeight * blockSize + (px * 4)
    canvas.width = gridWidth * blockSize + (px * 4)

    getNextHeld()

    drawRect(0, 0, px, canvas.height)
    drawRect(px, canvas.height - px, canvas.width - (px * 2), px)
    drawRect(canvas.width - px, 0, px, canvas.height)

    startLoop()
  }

  const component = ['canvas', { 
    class: style.board,

    onMounted () {
      canvas = this
      context = this.getContext('2d')

      init()
    },
  }]

  return {
    on: (...props) => boardEmitter.on(...props),
    emit: (...props) => boardEmitter.emit(...props),

    component,
  }
}
