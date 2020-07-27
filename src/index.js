import '@/styles/index.css'

import { router } from 'bitt'

import routes from '@/routes'

import gamepads from '@/scripts/gamepads'

window.gamepads = gamepads

router(document.body /* mount point */, routes).catch(console.error)
