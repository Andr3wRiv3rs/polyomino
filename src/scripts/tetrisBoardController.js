const moveInterval = (controller, button, action) => {
  controller.onButtonPress(button, () => {
    let timeout, interval

    action()

    timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (controller.getButtonDown(button)) action()
        else {
          clearTimeout(timeout)
          clearInterval(interval)
        }
      }, 50)
    }, 150)
    
    const releaseListener = controller.onButtonRelease(button, () => {
      clearTimeout(timeout)
      clearInterval(interval)

      releaseListener.removeListener()
    })
  })
}

const bind = (board, { bindings, ...controller }, options = {}) => {
  const { zeroG } = Object.assign({
    zeroG: false,
  }, options)

  moveInterval(controller, bindings.left, board.goLeft)
  moveInterval(controller, bindings.right, board.goRight)

  controller.onButtonPress(bindings.rotateRight, board.rotateRight)
  controller.onButtonPress(bindings.rotateLeft, board.rotateLeft)

  controller.onButtonPress(bindings.previousHeld, board.previousHeld)
  controller.onButtonPress(bindings.nextHeld, board.nextHeld)

  if (zeroG) {
    moveInterval(controller, bindings.down, board.goDown)
    moveInterval(controller, bindings.up, board.goUp)

    controller.onButtonPress(bindings.place, board.place)
  } else {
    controller.onButtonPress(bindings.up, board.instantlyPlace)
    controller.onButtonPress(bindings.down, () => board.setSpeedMultiplier(10)).onRelease(() => board.setSpeedMultiplier(1))

    board.start()
  }

  board.ready()
}

export default {
  bind,
}
