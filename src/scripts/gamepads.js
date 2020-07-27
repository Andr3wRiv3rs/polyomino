import Emitter from 'events'

const gamepadEmitter = new Emitter()

const query = () => [...navigator.getGamepads()].filter(gamepad => gamepad && gamepad.mapping === 'standard')

let previousFrame = []
let frame = query()

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

const getGamepad = gamepadIndex => {
  return {
    index: gamepadIndex,

    getButtonDown: buttonIndex => frame.find(({ index }) => index === gamepadIndex).buttons[buttonIndex].pressed,
    getAnyButtonDown: () => frame.find(({ index }) => index === gamepadIndex).buttons.filter(({ pressed }) => pressed),
    
    onButtonPress (buttonIndex, callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-${ typeof buttonIndex === 'string' ? aliases[buttonIndex] : buttonIndex }`, callback)
    },
    
    onAnyButtonPress (callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-any`, callback)
    },
  }
}

const loop = () => {
  previousFrame = frame
  frame = query()

  for (const gamepadListIndex in frame) {
    const gamepad = frame[gamepadListIndex]
    const gamepadButtons = frame[gamepadListIndex].buttons
    const previousGamepadButtons = previousFrame[gamepadListIndex] && previousFrame[gamepadListIndex].buttons

    for (const buttonIndex in gamepadButtons) {
      if (gamepadButtons[buttonIndex].pressed && (!previousGamepadButtons || !previousGamepadButtons[buttonIndex].pressed)) {
        // console.log(`gamepad-${gamepadIndex}-${buttonIndex}`)
        gamepadEmitter.emit(`gamepad-${gamepad.index}-${buttonIndex}`)
        gamepadEmitter.emit(`gamepad-${gamepad.index}-any`, buttonIndex)
        gamepadEmitter.emit(`gamepad-any`, getGamepad(gamepad.index), buttonIndex)
      }
    }
  }

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

window.addEventListener('gamepadconnected', ({ gamepad }) => {
  if (gamepad.mapping === 'standard') {
    gamepadEmitter.emit('connected', getGamepad(gamepad.index))

    console.log(`Gamepad Connected [${ gamepad.id }]`)
  }
})

window.addEventListener('gamepaddisconnected', ({ gamepad }) => {
  if (gamepad.mapping === 'standard') {
    gamepadEmitter.emit('disconnected', gamepad.index)

    console.log(`Gamepad Disconnected [${ gamepad.id }]`)
  }
})

export default {
  getGamepad,

  on: (...props) => gamepadEmitter.on(...props),
  emit: (...props) => gamepadEmitter.emit(...props),
}
