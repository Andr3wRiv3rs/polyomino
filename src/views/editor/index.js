import style from './editor.css'

import blockTypes from '@/components/tetris/blockTypes'

export default () => {
  let canvas, context, resolutionQuotient

  const held = {
    x: 0,
    y: 0,
    rotation: 1,
    block: blockTypes[2],
    index: 0,
  }

  const iterate = ({ x: gridX, y: gridY, block }, callback) => {
    for (let x = 0; x < block[0].length; x++) {
      for (let y = 0; y < block.length; y++) {
        const value = block[y][x]
  
        if (value) callback({ 
          x: gridX + x, 
          y: gridY + y, 
          value,
        })
      }
    }
  }
  
  const iterateHeld = (held, callback) => {
    iterate({
      ...held,
      block: held.block[held.rotation],
    }, callback)
  }

  const fills = ['white', 'cyan']

  const draw = () => {
    iterateHeld(held, ({ x, y, value }) => {
      context.fillStyle = fills[value - 1]
      context.fillRect(x, y, 1, 1)
      console.log({ 
        x, 
        y,
      })
    })
  }

  return ['div', { class: style.container }, [
    ['canvas', {
      class: style.editor,

      onMounted () {
        canvas = this
        context = this.getContext('2d')

        canvas.height = 5
        canvas.width = 5

        draw()
      },
    }],
  ]]
}
