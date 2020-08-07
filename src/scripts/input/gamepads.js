import Emitter from 'events'

const gamepadEmitter = new Emitter()

const query = () => [...navigator.getGamepads()].filter(gamepad => gamepad && gamepad.mapping === 'standard')

let previousList = []
let list = query()

const aliases = {
  'a': 0,
  'b': 1,
  'x': 2,
  'y': 3,
  'left-bumper': 4, 
  'right-bumper': 5,
  'left-trigger': 6,
  'right-trigger': 7,
  'select': 8,
  'start': 9,
  'left-stick': 10,
  'right-stick': 11,
  'up': 12,
  'down': 13,
  'left': 14,
  'right': 15,
}

const bindings = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  nextTurret: 'right-bumper',
  previousTurret: 'left-bumper',
  buy: 'a',
  use: 'a',
  shoot: 'a',
  cancel: 'b',
  upgrade: 'x',
  pause: 'start',
}

const getGamepad = gamepadIndex => {
  return {
    index: gamepadIndex,

    bindings,

    getButtonDown: buttonIndex => list.find(({ index }) => index === gamepadIndex).buttons[typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex].pressed,
    getAnyButtonDown: () => list.find(({ index }) => index === gamepadIndex).buttons.filter(({ pressed }) => pressed),
    
    onButtonPress (buttonIndex, callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-${ typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex }`, callback)
      
      let releaseListener

      return {
        removeListener: () => {
          if (releaseListener) releaseListener.removeListener()

          gamepadEmitter.removeListener(`gamepad-${gamepadIndex}-${ typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex }`, callback)
        },

        onRelease: (callback) => {
          const releaseListener = this.onButtonRelease(buttonIndex, callback)

          return releaseListener
        },
      }
    },

    onButtonRelease (buttonIndex, callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-${ typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex }-up`, callback)
      
      return {
        removeListener: () => gamepadEmitter.removeListener(`gamepad-${gamepadIndex}-${ typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex }-up`, callback),
      }
    },

    
    onAnyButtonPress (callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-any`, callback)
    },
  }
}

const loop = () => {
  previousList = list
  list = query()

  for (const gamepadListIndex in list) {
    const gamepad = list[gamepadListIndex]
    const gamepadButtons = list[gamepadListIndex].buttons
    const previousGamepadButtons = previousList[gamepadListIndex] && previousList[gamepadListIndex].buttons

    for (const buttonIndex in gamepadButtons) {
      if (gamepadButtons[buttonIndex].pressed && (!previousGamepadButtons || !previousGamepadButtons[buttonIndex].pressed)) {
        gamepadEmitter.emit(`gamepad-${gamepad.index}-${buttonIndex}`)
        gamepadEmitter.emit(`gamepad-${gamepad.index}-any`, buttonIndex)
        gamepadEmitter.emit(`gamepad-any`, getGamepad(gamepad.index), buttonIndex)
      }

      if (!gamepadButtons[buttonIndex].pressed && (previousGamepadButtons && previousGamepadButtons[buttonIndex].pressed)) {
        gamepadEmitter.emit(`gamepad-${gamepad.index}-${buttonIndex}-up`)
        gamepadEmitter.emit(`gamepad-${gamepad.index}-any-up`, buttonIndex)
        gamepadEmitter.emit(`gamepad-any-up`, getGamepad(gamepad.index), buttonIndex)
      }
    }
  }

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

window.addEventListener('gamepadconnected', ({ gamepad }) => {
  if (gamepad.mapping === 'standard') {
    console.log(`Gamepad Connected [${ gamepad.id }]`)

    gamepadEmitter.emit('connected', getGamepad(gamepad.index))
  }
})

window.addEventListener('gamepaddisconnected', ({ gamepad }) => {
  if (gamepad.mapping === 'standard') {
    console.log(`Gamepad Disconnected [${ gamepad.id }]`)

    gamepadEmitter.emit('disconnected', gamepad.index)
  }
})

export const keyboard = {
  getGamepad,

  on: (...props) => gamepadEmitter.on(...props),
  emit: (...props) => gamepadEmitter.emit(...props),

  get list () {
    return list.map(({ index }) => getGamepad(index))
  },
}
