
function isOutput () {
  return true
}

function log (...msg) {
  if (isOutput()) {
    console.log('[kd-table]', ...msg)
  }
}

function warn (...msg) {
  if (isOutput()) {
    console.warn('[kd-table]', ...msg)
  }
}

function error (...msg) {
  console.error('[kd-table]', ...msg)
}

function table (...msg) {
  if (isOutput()) {
    console.table('[kd-table]', ...msg)
  }
}

export default {
  log,
  warn,
  error,
  table
}
