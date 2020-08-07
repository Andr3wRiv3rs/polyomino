import { 
  drawRect, 
  clearRect,
  colors,
} from '../canvas'

import {
  moveInterval,
} from '../input'

export const cursors = (globals, layer) => {
  const { gameObject, gridWidth, gridHeight } = globals

  const registeredControllers = []

  const playerColors = Object.values(colors)

  const cursors = []

  const registerController = (controller) => {
    if (registeredControllers.includes(controller.index)) return
    
    registeredControllers.push(controller.index)

    const player = registeredControllers.length

    const { bindings, onButtonPress, onButtonRelease } = controller

    const playerColor = playerColors[player - 1]

    const cursor = gameObject((state, { destroy }) => {
      state.x = 0
      state.y = 0
      state.player = player
      
      const isColliding = (coordinates) => {
        for (const { state } of cursors) {
          if (state.player === player) continue
          if (state.x === coordinates.x && state.y === coordinates.y) return true
        }

        return false
      }

      while (isColliding(state)) {
        state.x++
      }

      const move = (x = 0, y = 0) => {
        if (state.x + x < 0 || state.x + x >= gridWidth || state.y + y < 0 || state.y + y >= gridHeight) return

        if (isColliding({
          x: state.x + x, 
          y: state.y + y,
        })) return

        state.x += x
        state.y += y
      }

      moveInterval(controller, bindings.up, () => move(0, -1))
      moveInterval(controller, bindings.down, () => move(0, +1))
      moveInterval(controller, bindings.left, () => move(-1, 0))
      moveInterval(controller, bindings.right, () => move(+1, 0))

      console.log(`Cursor activated for controller "${controller.index}"`)

      return ({ translateTileSize: t }) => {
        const { x, y } = state

        drawRect(layer, t(x), t(y), t(1), t(1), playerColor)
        clearRect(layer, t(x + 0.1), t(y + 0.1), t(0.8), t(0.8))
        drawRect(layer, t(x) + 1, t(y) + 1, t(0.4), t(0.4), playerColor)
      }
    })

    cursors.push(cursor)
  }

  registerController(keyboard)

  keyboard.onAnyButtonPress(registerController)
  gamepads.on('gamepad-any', registerController)
}
