import style from './singleplayer.css'

import board from '@/components/board'

import boardController from '@/scripts/boardController'

export default ({ newState }) => {
  let state 
  
  state = newState({
    Player: board({ state }),
  })

  return ['div', { 
    class: style.game,

    onMounted () {
      requestAnimationFrame(() => {
        if (gamepads.list[0]) boardController.bind(state.Player, gamepads.list[0])
        else gamepads.on('connected', () => boardController.bind(state.Player, gamepads.list[0]))

        // boardController.bind(state.Player, keyboard)
      })
    },
  }, [
    ['div', [state.Player.component]],
  ]]
}
