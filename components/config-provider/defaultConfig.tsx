import { getLangMsg, getCompLangMsg } from '../locale'
const defaultConfig = {
  getPrefixCls: (configPrefixCls?: string, suffixCls?: string, customizePrefixCls?: string) => {
    // 获取样式前缀方法
    if (customizePrefixCls) return customizePrefixCls
    configPrefixCls = configPrefixCls || 'kd'
    return suffixCls ? `${configPrefixCls}-${suffixCls}` : configPrefixCls
  },
  prefixCls: 'kd', // 样式前缀
  locale: { getLangMsg, getCompLangMsg },
}
export default defaultConfig
