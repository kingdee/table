/**
 * 检查数组value的值是否唯一
 * @param value 需要检查值是否唯一的数组
 */
export const isArrayValueRepeat = (value: any[]): boolean => {
  const hash: any = {}
  for (const i in value) {
    if (hash[value[i]]) {
      return true
    }
    hash[value[i]] = true
  }
  return false
}
