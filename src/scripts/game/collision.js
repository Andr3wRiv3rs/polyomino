const gridColliders = []

export const testGridCollide = ({ x, y }) => {
  return gridColliders[x] && gridColliders[x][y] ? true : false
}

export const addGridColliders = (coordinatesArray) => {
  for (const { x, y } of coordinatesArray) {
    if (gridColliders[x] === undefined) gridColliders[x] = []
    gridColliders[x][y] = true
  }
}

export const removeGridColliders = (coordinatesArray) => {
  for (const { x, y } of coordinatesArray) {
    gridColliders[x].splice(y, 1)
  }
}
