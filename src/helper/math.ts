export function randomRangeInt(minInclude: Integer, maxExclude: Integer) {
  return Math.round(Math.random() * (maxExclude - minInclude - 1)) + minInclude
}

export const degreesToRadians = cc.degreesToRadians
export const radiansToDegrees = cc.radiansToDegrees
