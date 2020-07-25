import '@/styles/index.css'

import { router } from 'bitt'

import routes from '@/routes'

router(document.body /* mount point */, routes).catch(console.error)
