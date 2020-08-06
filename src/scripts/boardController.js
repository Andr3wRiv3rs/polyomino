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
  
}

export default {
  bind,
}
