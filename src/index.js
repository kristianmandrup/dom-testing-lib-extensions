export const eventsApi = ({fireEvent}) => {
  fireEvent : (name, ...args) => {
    fireEvent[name](...args)
  }
}

const count = (...vals) => vals.reduce((acc, val) => acc += Boolean(val)
  ? 1
  : 0, 0)

const createEventOpts = (event, opts) => {
  const api = {
    setFor(name) {
      if (opts[key]) {
        event[key] = opts[key]
      }
      return api
    },
    get event() {
      return event
    }
  }

  api.setAll = (...names) => {
    names.map(api.setFor)
    return event
  }
  return api
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
    return field
  }

  const elementBy = ({
    parent,
    field,
    element,
    tag,
    id,
    testId,
    name,
    type
  }) => {
    const elem = element || field
    if (elem) {
      return elem
    }

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

  api.forField = (field) => {
    const api = {
      clearValue: (value) => {
        field.value = ''
        return field
      },
      setValue: (value) => {
        field.value = value
        return field
      },
      setChecked: (checked) => {
        if (checked === undefined) {
          throw new Error(`setChecked: checked option must be set to something that is truthy or falsy, not undefined`)
        }
        field.checked = Boolean(checked)
        return field
      },

      setSelected: (selected) => {
        if (!Array.isArray(selected)) {
          throw new Error(`setSelected: must take an array of option values to be selected`)
        }
        const {options} = field
        options.map(option => {
          if (options.includes(option.value)) {
            option.selected = true
          }
        })
        return field
      },

      clearSelected: () => {
        const {options} = field
        options.map(option => {
          option.selected = false
        })
        return field
      },

      setUnselected: (unselected) => {
        if (!Array.isArray(unselected)) {
          throw new Error(`setUnselected: must take an array of option values to be unselected`)
        }
        const {options} = field
        options.map(option => {
          if (options.includes(option.value)) {
            option.selected = false
          }
        })
        return field
      },

      // handles both checked and value
      change: (opts) => {
        const event = createEventOpts({}, opts).setAll('name', 'value', 'checked', 'selectedOptions')

        if (!(event.value || event.checked || event.selectedOptions)) {
          throw new Error(`Invalid change event. Must have 'checked', 'value' or 'selectedOptions' option`)
        }
        if (count(event.value, event.checked, event.selectedOptions) > 1) {
          throw new Error(`Invalid change event. Must have 'checked', 'value' or 'selectedOptions' option but not multiple`)
        }
        return change(element, event)
      }
    }

    api.withField = (opts, fn) => {
      const field = api.elementBy(opts)
      fn(field)
    }

    api.clearSelected = (opts) => {
      const field = api.elementBy(opts)
      return api
        .forField(field)
        .clearSelected()
    }

    api.clearValue = (opts) => {
      const field = api.elementBy(opts)
      return api
        .forField(field)
        .clearValue()
    }

    // TODO: make sure that field supports whatever attribute we are clearing
    api.clear = (opts) => {
      const field = api.elementBy(opts)
      field.clearValue()
      field.clearSelected()
      field.uncheck()
      return field
    }

    api.changeSelected = (opts) => {
      delete opts.checked
      delete opts.value
      api.change(opts)
    }

    api.changeValue = (opts) => {
      delete opts.checked
      delete opts.selected
      api.change(opts)
    }

    api.changeChecked = (opts) => {
      delete opts.value
      delete opts.selected
      api.change(opts)
    }
    return api
  }

  api.setValue = (opts) => {
    const field = api.elementBy(opts)
    const fieldApi = api.forField(field)
    return opts.value
      ? fieldApi.setValue(opts.value)
      : fieldApi.setChecked(opts.checked)
  }

  api.setChecked = (opts) => {
    const field = api.elementBy(opts)
    return api
      .forField(field)
      .setChecked(opts.checked)
  }

  api.setSelected = (opts) => {
    const field = api.elementBy(opts)
    return api
      .forField(field)
      .setSelected(opts.selected)
  }

  api.check = (opts) => {
    return api.setChecked({
      ...opts,
      checked: true
    })
  }

  api.uncheck = (opts) => {
    return api.setChecked({
      ...opts,
      checked: false
    })
  }

  api.setValues = (obj) => {
    return api.elementsFor(obj, (api, opts) => api.setValue(opts))
  }

  api.changeValues = (obj) => {
    return api.elementsFor(obj, (api, opts) => api.change(opts))
  }

  api.submit = (opts) => {
    const submitButton = api.elementBy({
      ...opts,
      tag: 'button',
      type: 'submit'
    })
    fireEvent('click', submitButton)
    return submitButton
  }

  api.reset = (opts) => {
    const field = api.elementBy({
      ...opts,
      tag: 'form'
    })
    field && field.reset()
  }

  api.change = (opts) => {
    const field = api.elementBy(opts)
    const name = opts.id || opts.name
    let changeEventOpts = createEventOpts({name}).setAll('checked', 'value')
    return api
      .forField(field)
      .changeValue(changeEventOpts)
  }

  api.changeValue = (opts) => {
    delete opts.checked
    return api.change(opts)
  }

  api.changeChecked = (opts) => {
    delete opts.value
    return api.change(opts)

  }
  return api
}
