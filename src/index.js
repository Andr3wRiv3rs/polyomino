import '@/styles/index.css'

import { router } from 'bitt'

import routes from '@/routes'

import gamepad from '@/scripts/gamepad'

window.gamepad = gamepad

router(document.body /* mount point */, routes).catch(console.error)
