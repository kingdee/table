const path = require('path')

// 严格区分commonJS文件和ES6文件
// https://babel.docschina.org/docs/en/options#sourcetype
// https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
function editBabelConfig(rules) {
  rules.forEach((rule) => {
    if (rule.loader && rule.loader.includes('babel-loader')) {
      rule.options = {
        ...rule.options,
        sourceType: 'unambiguous',
      }
      if (rule.exclude) {
        rule.exclude = /node_modules\/(?!(regexpu-core)\/).*/
      }
    } else if (rule.use) {
      editBabelConfig(rule.use)
    }
  })
  return rules
}

module.exports = {
  source: {
    // 读取markdown文件的目录
    components: './components',
    docs: './docs',
  },
  themeConfig: {
    // 这里为空也要配个空对象，不然报错
  },
  output: './_site',
  hash: true,
  theme: './site/src',
  htmlTemplate: './site/src/static/template.html',
  port: 8004,
  webpackConfig (config) {
    console.log(path.join(process.cwd(), 'site/src'))
    config.resolve.alias = {
      'kd-table': path.join(process.cwd(), 'index'),
      '@src': path.join(process.cwd(), 'site/src')
    }
    config.module.rules = editBabelConfig(config.module.rules)
    return config
  }
}
