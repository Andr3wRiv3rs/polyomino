import style from './singleplayer.css'

import board from '@/components/board'

export default ({ newState }) => {
  let state 
  
  state = newState({
    Player: board({ state }),
  })

  return ['div', { 
    class: style.game,

    onMounted () {
      state.Player.on('lose', () => console.log('You lost!'))

      setTimeout(() => {
        const gamepad = gamepads.list[0]

        gamepad.onButtonPress('left', () => {
          let timeout, interval

          state.Player.goLeft()

          timeout = setTimeout(() => {
            interval = setInterval(() => {
              if (gamepad.getButtonDown('left')) state.Player.goLeft()
              else {
                clearTimeout(timeout)
                clearInterval(interval)
              }
            }, 50)
          }, 150)

          gamepad.onButtonRelease('left', () => {
            clearTimeout(timeout)
            clearInterval(interval)
          })
        })
        
        gamepad.onButtonPress('right', () => {
          let timeout, interval

          state.Player.goRight()

          timeout = setTimeout(() => {
            interval = setInterval(() => {
              if (gamepad.getButtonDown('right')) state.Player.goRight()
            }, 50)
          }, 150)

          gamepad.onButtonRelease('right', () => {
            clearTimeout(timeout)
            clearInterval(interval)
          })
        })

        gamepad.onButtonPress('b', state.Player.rotateRight)
        gamepad.onButtonPress('a', state.Player.rotateLeft)

        gamepad.onButtonPress('up', state.Player.instantlyPlace)

        gamepad.onButtonPress('down', () => {
          state.Player.setSpeedMultiplier(10)
          state.Player.restartLoop()
        })

        gamepad.onButtonRelease('down', () => state.Player.setSpeedMultiplier(1))

      }, 500)
    },
  }, [
    ['div', [state.Player.component]],
  ]]
}
