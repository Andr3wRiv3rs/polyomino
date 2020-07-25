import style from './board.css'

export default () => ({ newState }) => {
  const state = newState({

  })

  let canvas, context
  
  return ['canvas', { 
    class: style.board,

    onMount () {
      canvas = this
      context = this.getContext('2d')
    },
  }]
}
