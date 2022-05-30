export const browserType = {
  isEdge: !!window.navigator.userAgent.match(/Edge\/(\d+)/),
  isIE: !!window.navigator.userAgent.match(/Trident\/(\d+)/),
  isFireFox: !!window.navigator.userAgent.match(/Firefox\/(\d+)/),
  isChrome: !!window.navigator.userAgent.match(/Chrome\/(\d+)/)
}
