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

      const start = () => {
        const gamepad = gamepads.list[0]

        const zeroG = false

        moveInterval(gamepad, 'left', Player.goLeft)
        moveInterval(gamepad, 'right', Player.goRight)

        gamepad.onButtonPress('b', Player.rotateRight)
        gamepad.onButtonPress('a', Player.rotateLeft)

        if (zeroG) {
          moveInterval(gamepad, 'down', Player.goDown)
          moveInterval(gamepad, 'up', Player.goUp)
  
          gamepad.onButtonPress('x', Player.place)
        } else {
          gamepad.onButtonPress('up', Player.instantlyPlace)
          gamepad.onButtonPress('down', () => Player.setSpeedMultiplier(10)).onRelease(() => Player.setSpeedMultiplier(1))

          Player.start()
        }

        Player.ready()
      }

      if (gamepads.list[0]) requestAnimationFrame(start)
      else {
        gamepads.on('connected', () => requestAnimationFrame(start))
      } 
    },
  }, [
    ['div', [state.Player.component]],
  ]]
}
