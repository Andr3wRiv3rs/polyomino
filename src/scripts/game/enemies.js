import { timer } from '../utils'

export const square = ({ translateTileSize: t }, layer) => (state) => {
  return () => {
    const { x, y } = state

    layer.drawRect(x, y, t(1), t(1))
  }
}

export const generateEnemies = (...enemies) => {
  return enemies.map(([count, enemy]) => {
    return new Array(count).fill(enemy)
  }).flat()
}

export const spawnEnemy = async (globals, layer, enemy) => {
  const { state, destroy } = globals.gameObject(enemy(globals, layer))

  const { level, translateTileSize: t } = globals

  let x = 0, y = 0

  const speed = 1000

  const move = async (moveX, moveY) => {
    x += 0.05 * moveX
    y += 0.05 * moveY

    state.x = Math.ceil(x * globals.tileSize + globals.offsetX)
    state.y = Math.ceil(y * globals.tileSize + globals.offsetY)

    await timer(1000 / 60 / speed)
  }
  
  const moveTo = async (newX, newY) => {
    if (x < newX) while (x < newX) await move(1, 0)
    else if (x > newX) while (x > newX) await move(-1, 0)
    else if (y < newY) while (y < newY) await move(0, 1)
    else if (y > newY) while (y > newY) await move(0, -1)

    x = newX
    y = newY
  }

  const path = level.path()

  const { x: startX, y: startY } = path.next().value

  x = startX
  y = startY
  state.x = t(startX) + globals.offsetX
  state.y = t(startY) + globals.offsetY

  for (const { x, y } of path) {
    await moveTo(x, y)
  }

  destroy()
}
