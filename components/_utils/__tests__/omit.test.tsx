import { omit } from '../omit'

describe('omit 单元测试', () => {
  it('omit', () => {
        interface Key<T> {
            [key: string]: T;
          }
        const myObj:Key<any> = {
          file1: {},
          file2: {},
          file3: {},
          file4: {}
        }
        type objKey = keyof Key<string>
        const fields: objKey[] = ['file1', 'file2']
        const newObj = omit(myObj, fields)

        expect(Object.keys(newObj).length).toBe(2)
  })
})
