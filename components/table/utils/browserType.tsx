/*
 * @Author: wqhui
 * @Date: 2022-05-13 17:06:51
 * @LastEditTime: 2024-05-29 16:25:48
 * @Description:
 */
type IBrowserData = {
  name?: string
  version?: string
}

export const browserData = getBrowserData()

export const browserType = {
  isEdge: browserData.name === 'Edge',
  isNewEdge: browserData.name === 'NewEdge',
  isIE: browserData.name === 'IE',
  isFireFox: browserData.name === 'Firefox',
  isChrome: browserData.name === 'Chrome',
  isSafari: browserData.name === 'Safari'
}


function getBrowserData () {
  const ua = navigator.userAgent
  const browser:IBrowserData = {}
  let match

  // 旧Edge浏览器可能隐藏其版本号，因此我们需要特别处理
  if ((match = ua.match(/Edge\/(.*?)(?=\s|$)/))) {
    browser.name = 'Edge'
    browser.version = match[1]
  }

  // 新Edge浏览器
  if (!browser.name) {
    if ((match = ua.match(/Edg\/(.*?)(?=\s|$)/))) {
      browser.name = 'NewEdge'
      browser.version = match[1]
    }
  }

  // 如果未找到Edge版本，尝试Chrome
  if (!browser.name) {
    if ((match = ua.match(/Chrome\/(.*?)(?=\s|$)/))) {
      browser.name = 'Chrome'
      browser.version = match[1]
    }
  }

  // 如果未找到Chrome版本，尝试Safari
  if (!browser.name) {
    if ((match = ua.match(/Safari\/(.*?)(?=\s|$)/))) {
      browser.name = 'Safari'
      browser.version = match[1]
    }
  }

  // 如果未找到Safari版本，尝试Firefox
  if (!browser.name) {
    if ((match = ua.match(/Firefox\/(.*?)(?=\s|$)/))) {
      browser.name = 'Firefox'
      browser.version = match[1]
    }
  }

  // 如果未找到Firefox版本，尝试IE
  if (!browser.name) {
    if (/Trident\/(\d+)/.test(ua)) {
      browser.name = 'IE'
      match = ua.match(/Trident.*rv:([\d.]+)/) || []
      browser.version = match[1]
    } else if ((match = ua.match(/MSIE\s(.*?);/))) {
      browser.name = 'IE'
      browser.version = match[1]
    }
  }

  return browser
}
