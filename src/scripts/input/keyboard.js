import { EventEmitter } from 'events'

const keyboardEmitter = new EventEmitter()

let keyCount = 0

const keys = { }

const bindings = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd',
  rotateLeft: 'j',
  rotateRight: 'k',
  place: 'h',
  pause: 'Escape',
}

window.addEventListener('keydown', ({ key }) => {
  if (keys[key] === undefined) {
    keys[key] = true
    keyboardEmitter.emit(`keyboard-${key}`)
    keyboardEmitter.emit(`keyboard-any`, keyboard, key)
    keyCount++
  }
})

window.addEventListener('keyup', ({ key }) => {
  delete keys[key]
  keyboardEmitter.emit(`keyboard-${key}-up`)
  keyboardEmitter.emit(`keyboard-any-up`, keyboard, key)
  keyCount--
})

export const keyboard = {
  bindings,

  index: 'keyboard',

  getButtonDown: key => keys[key],
  getAnyButtonDown: () => keyCount > 0,
  
  onButtonPress (key, callback) {
    keyboardEmitter.on(`keyboard-${key}`, callback)
    
    let releaseListener

    return {
      removeListener: () => {
        if (releaseListener) releaseListener.removeListener()

        keyboardEmitter.removeListener(`keyboard-${key}`, callback)
      },

      onRelease: (callback) => {
        const releaseListener = this.onButtonRelease(key, callback)

        return releaseListener
      },
    }
  },

  onButtonRelease (key, callback) {
    keyboardEmitter.on(`keyboard-${key}-up`, callback)
    
    return {
      removeListener: () => keyboardEmitter.removeListener(`keyboard-${key}-up`, callback),
    }
  },

  
  onAnyButtonPress (callback) {
    keyboardEmitter.on(`keyboard-any`, callback)
    
    return {
      removeListener: () => keyboardEmitter.removeListener(`keyboard-any`, callback),
    }
  },
}
