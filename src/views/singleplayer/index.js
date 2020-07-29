import style from './singleplayer.css'

import board from '@/components/board'
import gamepads from '../../scripts/gamepads'

export default ({ newState }) => {
  let state 
  
  state = newState({
    Player: board({ state }),
  })

  return ['div', { 
    class: style.game,

    onMounted () {
      const { Player } = state

      Player.on('lose', () => console.log('You lost!'))

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

      const start = ({ bindings, ...controller }) => {
        const zeroG = false

        moveInterval(controller, bindings.left, Player.goLeft)
        moveInterval(controller, bindings.right, Player.goRight)

        controller.onButtonPress(bindings.rotateRight, Player.rotateRight)
        controller.onButtonPress(bindings.rotateLeft, Player.rotateLeft)

        if (zeroG) {
          moveInterval(controller, bindings.down, Player.goDown)
          moveInterval(controller, bindings.up, Player.goUp)
  
          controller.onButtonPress(bindings.place, Player.place)
        } else {
          controller.onButtonPress(bindings.up, Player.instantlyPlace)
          controller.onButtonPress(bindings.down, () => Player.setSpeedMultiplier(10)).onRelease(() => Player.setSpeedMultiplier(1))

          Player.start()
        }

        Player.ready()
      }

      requestAnimationFrame(() => {
        // if (gamepads.list[0]) start(gamepads.list[0])
        // else gamepads.on('connected', () => start(gamepads.list[0]))

        start(keyboard)
      })
    },
  }, [
    ['div', [state.Player.component]],
  ]]
}
