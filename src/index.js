export const eventsApi = ({fireEvent}) {
  fireEvent: (name, ...args) => {
    fireEvent[name](...args)
  }
}

export const apiFor = (container, config) => {
  const {fireEvent} = config

  const change = (field, {name, value}) => {
    fireEvent('change', field, {
      target: {
        name,
        value
      }
    })
  }

  const elementBy = ({
    parent,
    tag,
    id,
    testId,
    name,
    type
  }) => {
    const sel = (name, value) => {
      return value && `[${name}="${value}"]`
    }

    let elem = sel('id', id) || sel('name', name) || sel('data-testid', testId)
    const typeSel = type
      ? `type=${type}`
      : undefined
    let attrSel = `[${elem}]`;
    attrSel = typeSel
      ? `${attrSel}[${typeSel}]`
      : attrSel
    const selector = tag
      ? `${tag}${attrSel}`
      : attrSel;
    const fullSelector = parent
      ? `${parent} ${selector}`
      : selector;
    return container.querySelector(fullSelector)
  }

  const api = {
    elementBy
  }

  api.elementsFor = (obj, effect) => {
    return Object
      .keys(obj)
      .reduce((acc, key) => {
        const opts = obj[key]
        const element = api.elementBy(opts)
        effect && effect(api, opts)
        acc[key] = element
        return acc
      }, {})
  }

  api.forField = (field) => ({
    setValue: (value) => {
      field.value = value
      return field
    },
    changeValue: (value, opts) => {
      const name = opts.name || opts.id
      !name && warn(`missing name to change for`)
      change(element, {
        name: name,
        value
      })
    }
  })

  api.setValue = (opts) => {
    const field = api.elementBy(opts)
    return api
      .forField(field)
      .setValue(opts.value)
  }

  api.setValues = (obj) => {
    return api.elementsFor(obj, (api, opts) => api.setValue(opts))
  }

  api.changeValues = (obj) => {
    return api.elementsFor(obj, (api, opts) => api.changeValue(opts))
  }

  api.submit = (opts) => {
    const submitButton = api.elementBy({
      ...opts,
      tag: 'button',
      type: 'submit'
    })
    fireEvent('click', submitButton)
  }
  api.changeValue = (opts) => {
    const field = api.elementBy(opts)
    return api
      .forField(field)
      .changeValue(opts.value, {
        name: opts.id || opts.name
      })
  }
  return api
}
