import Emitter from 'events'

const gamepadEmitter = new Emitter()

const query = () => [...navigator.getGamepads()].filter(gamepad => gamepad && gamepad.mapping === 'standard')

let previousFrame = []
let frame = query()

const getGamepad = gamepadIndex => {
  return {
    getButtonDown: buttonIndex => frame.find(({ index }) => index === gamepadIndex).buttons[buttonIndex].pressed,
    getAnyButtonDown: () => frame.find(({ index }) => index === gamepadIndex).buttons.filter(({ pressed }) => pressed),
    
    onButtonPress (buttonIndex, callback) {
      gamepadEmitter.on(`gamepad-${gamepadIndex}-${buttonIndex}`, callback)
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
        gamepadEmitter.emit(`gamepad-any`, gamepad.index, buttonIndex)
      }
    }
  }

  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

window.addEventListener('gamepadconnected', ({ gamepad }) => {
  if (gamepad.mapping === 'standard') {
    const player = getGamepad(gamepad.index)

    console.log(`Player ${gamepad.index} joined.`)

    player.onAnyButtonPress(console.log)
  }
})

export default {
  getGamepad,
  on: (event, callback) => gamepadEmitter(event, callback),
}
