import singleplayer from './views/singleplayer'

export default [
  {
    regex: /^\/?$/,
    component: singleplayer,
  },
  {
    regex: /^\/editor\/?$/,
    module: () => import('./views/editor/'),
  },
]
