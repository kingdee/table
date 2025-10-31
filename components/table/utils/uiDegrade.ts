/*
 * @Author: wqhui
 * @Date: 2024-05-06 16:16:16
 * @LastEditTime: 2024-05-06 16:41:24
 * @Description:
 */
import { browserData, browserType } from './browserType'

let isStickyUIDegradeFlag: boolean
export function isStickyUIDegrade () {
  if (typeof isStickyUIDegradeFlag === 'undefined') {
    isStickyUIDegradeFlag = browserType.isIE || isFirefoxOfLowerPerf(browserData.name, browserData.version)
  }
  return isStickyUIDegradeFlag
}

function isFirefoxOfLowerPerf (name: string, version: string | number) {
  return name === 'Firefox' && getVersionNum(version) <= 52
}

function getVersionNum (version) {
  if (typeof version === 'number') {
    return version
  }
  if (typeof version === 'string') {
    return Number(version.split('.')[0])
  }
  return Number(undefined)
}
