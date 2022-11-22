import { TablePipeline } from '../pipeline'

export interface FooterDataSourceFeatureOptions {

  /** 指定表格页脚每一行元信息的记录字段 */
  footerRowMetaKey?: string | symbol

  /** 表格页脚数据源 */
  dataSource?: any[]

}

export const footerRowMetaSymbol = Symbol('footer-row')

export function footerDataSource (opts: FooterDataSourceFeatureOptions = {}) {
  return function footerDataSourceStep (pipeline: TablePipeline) {
    const footerDataSource = opts.dataSource ?? pipeline.getFooterDataSource()
    const footerRowMetaKey = opts.footerRowMetaKey ?? footerRowMetaSymbol
    pipeline.setFeatureOptions('footerRowMetaKey', footerRowMetaKey)

    if (footerDataSource) {
      pipeline.footerDataSource(footerDataSource.map(row => ({ [footerRowMetaKey]: true, ...row })))
    } else {
      console.warn(
        '调用 pipeline.use(features.footerDataSource()) 前请先设置页脚数据源，设置方法有：pipeline.use(features.footerDataSource({dataSource:any[]})) 或者 pipeline.footerDataSource(any[])'
      )
    }
  }
}
