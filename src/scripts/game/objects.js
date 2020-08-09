export const gameObjects = []

export const gameObject = (create) => {
  const state = {}

  const destroy = () => gameObjects.splice(gameObjects.indexOf(object), 1)
  const update = create(state, { destroy })

  const object = { state, update, destroy }

  gameObjects.push(object)

  return object
}
