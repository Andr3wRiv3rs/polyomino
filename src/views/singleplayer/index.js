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
    },
  }, [
    state.Player.component,
  ]]
}
