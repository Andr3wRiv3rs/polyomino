import { router } from 'bitt'

import routes from '@/routes'

import { 
  gamepads, 
  keyboard,
} from '@/scripts/input'

window.gamepads = gamepads
window.keyboard = keyboard

router(document.body /* mount point */, routes, { mode: 'hash' }).catch(console.error)
