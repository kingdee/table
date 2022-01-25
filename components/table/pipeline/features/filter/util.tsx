const DEFAULT_FILTER_OPTIONS = [
    {
        title: '包含',
        key: 'contain',
        filter: (value) => (data) => {
            if (data == null) {
                return false
            }
            if (typeof data === 'number') {
                data = data + ''
            }
            return data.includes(value)
        }
    },
    {
        title: '不包含',
        key: 'notContain',
        filter: (value) => (data) => {
            if (data == null) {
                return true
            }
            if (typeof data === 'number') {
                data = data + ''
            }
            return !data.includes(value)
        }
    },
    {
        title: '等于',
        key: 'equal',
        filter: (value) => (data) => {
            return value !== data
        }
    },
    {
        title: '不等于',
        key: 'notEqual',
        filter: (value) => (data) => {
            return value !== data
        }
    },
    {
        title: '为空',
        key: 'isNull',
        filter: () => (data) => {
            return !data
        }
    },
    {
        title: '不为空',
        key: 'notIsNull',
        filter: () => (data) => {
            return !!data
        }
    }
]


export { DEFAULT_FILTER_OPTIONS }