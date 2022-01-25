import console from './console'
const copyDataToClipboard = (data:string) => (element:HTMLInputElement) => {
  element.value = data
  element.select()
  element.focus()
  document.execCommand('copy')
  document.body.removeChild(element)
}

function executeOnTempElement (callback) {
  var eTempInput = document.createElement('textarea')
  eTempInput.style.width = '1px'
  eTempInput.style.height = '1px'
  eTempInput.style.top = '0px'
  eTempInput.style.left = '0px'
  eTempInput.style.position = 'absolute'
  eTempInput.style.opacity = '0.0'
  document.body.appendChild(eTempInput)
  try {
    callback(eTempInput)
  } catch (err) {
    console.warn('Browser does not support document.execCommand(\'copy\') for clipboard operations')
  }
}

export { copyDataToClipboard, executeOnTempElement }
