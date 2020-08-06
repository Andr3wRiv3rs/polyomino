import style from './singleplayer.css'

import board from '@/components/board'

import boardController from '@/scripts/boardController'

export default () => {
  return ['div', { 
    class: style.game,

    onMounted () {
      requestAnimationFrame(() => {
        // if (gamepads.list[0]) boardController.bind(state.Player, gamepads.list[0])
        // else gamepads.on('connected', () => boardController.bind(state.Player, gamepads.list[0]))

        boardController.bind(board, keyboard, { zeroG: true })

        board.start()
      })
    },
  }, [
    board.component,
  ]]
}
