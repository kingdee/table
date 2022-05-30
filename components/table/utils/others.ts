export function flatMap<T, U>(array: T[], callback: (value: T, index: number, array: T[]) => U[]): U[] {
  const result: U[] = []

  array.forEach((value, index) => {
    result.push(...callback(value, index, array))
  })

  return result
}

export function fromEntries<T = any>(entries: Iterable<readonly [PropertyKey, T]>) {
  const result: { [k in PropertyKey]: T } = {}
  for (const [key, value] of entries) {
    result[key as any] = value
  }
  return result
}

export const arrayUtils = {
  diff(arr1: string[], arr2: Iterable<string>) {
    const set = new Set(arr2)
    return arr1.filter((x) => !set.has(x))
  },
  merge(arr1: string[], arr2: string[]) {
    const set = new Set(arr1)
    return arr1.concat(arr2.filter((x) => !set.has(x)))
  },
} as const

export function always<T>(value: T) {
  return (...args: any[]) => value
}

interface treeItem {
  children?: any[]
  code?: string
}

export function findByTree <T extends treeItem, U> (array: T[], condition:(item: T, index: number) => boolean): T {
  let index = 0
  const len = array.length
  const stack = []
  while (index < len || stack.length) {
    const item = array[index++] || stack.pop()
    if (condition(item, index)) {
      return item
    }
    if (item.children) {
      stack.splice(0, 0, ...item.children)
    }
  }
  return null
}
