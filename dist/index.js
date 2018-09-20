"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const eventsApi = exports.eventsApi = ({
  fireEvent
}) => {
  fireEvent: (name, ...args) => {
    fireEvent[name](...args);
  };
};

const createEventOpts = (event, opts) => {
  const api = {
    setFor(name) {
      if (opts[key]) event[key] = opts[key];
      return api;
    },

    get event() {
      return event;
    }

  };

  api.setAll = (...names) => {
    names.map(api.setFor);
    return event;
  };

  return api;
};

const apiFor = exports.apiFor = (container, config) => {
  const {
    fireEvent
  } = config;

  const change = (field, {
    name,
    value
  }) => {
    fireEvent('change', field, {
      target: {
        name,
        value
      }
    });
    return field;
  };

  const elementBy = ({
    parent,
    tag,
    id,
    testId,
    name,
    type
  }) => {
    const sel = (name, value) => {
      return value && `[${name}="${value}"]`;
    };

    let elem = sel('id', id) || sel('name', name) || sel('data-testid', testId);
    const typeSel = type ? `type=${type}` : undefined;
    let attrSel = `[${elem}]`;
    attrSel = typeSel ? `${attrSel}[${typeSel}]` : attrSel;
    const selector = tag ? `${tag}${attrSel}` : attrSel;
    const fullSelector = parent ? `${parent} ${selector}` : selector;
    return container.querySelector(fullSelector);
  };

  const api = {
    elementBy
  };

  api.elementsFor = (obj, effect) => {
    return Object.keys(obj).reduce((acc, key) => {
      const opts = obj[key];
      const element = api.elementBy(opts);
      effect && effect(api, opts);
      acc[key] = element;
      return acc;
    }, {});
  };

  api.forField = field => {
    const api = {
      setValue: value => {
        field.value = value;
        return field;
      },
      setChecked: checked => {
        if (checked === undefined) {
          throw new Error(`setChecked. checked option must be set to something that is truthy or falsy, not undefined`);
        }

        field.checked = Boolean(checked);
        return field;
      },
      // handles both checked and value
      change: opts => {
        const event = createEventOpts({}, opts).setAll('name', 'value', 'checked');

        if (!(event.value || event.checked)) {
          throw new Error(`Invalid change event. Must have either checked or value option`);
        }

        if (event.value && event.checked) {
          throw new Error(`Invalid change event. Must have either checked or value option but not both`);
        }

        return change(element, event);
      }
    };

    api.changeValue = opts => {
      delete opts.checked;
      api.change(opts);
    }; // alias


    api.changeChecked = opts => {
      delete opts.value;
      api.change(opts);
    };

    return api;
  };

  api.setValue = opts => {
    const field = api.elementBy(opts);
    const fieldApi = api.forField(field);
    return opts.value ? fieldApi.setValue(opts.value) : fieldApi.setChecked(opts.checked);
  };

  api.setChecked = opts => {
    const field = api.elementBy(opts);
    return api.forField(field).setChecked(opts.checked);
  };

  api.check = opts => {
    return api.setChecked(_objectSpread({}, opts, {
      checked: true
    }));
  };

  api.uncheck = opts => {
    return api.setChecked(_objectSpread({}, opts, {
      checked: false
    }));
  };

  api.setValues = obj => {
    return api.elementsFor(obj, (api, opts) => api.setValue(opts));
  };

  api.changeValues = obj => {
    return api.elementsFor(obj, (api, opts) => api.change(opts));
  };

  api.submit = opts => {
    const submitButton = api.elementBy(_objectSpread({}, opts, {
      tag: 'button',
      type: 'submit'
    }));
    fireEvent('click', submitButton);
    return submitButton;
  };

  api.change = opts => {
    const field = api.elementBy(opts);
    const name = opts.id || opts.name;
    let changeEventOpts = createEventOpts({
      name
    }).setAll('checked', 'value');
    return api.forField(field).changeValue(changeEventOpts);
  };

  api.changeValue = opts => {
    delete opts.checked;
    return api.change(opts);
  };

  api.changeChecked = opts => {
    delete opts.value;
    return api.change(opts);
  };

  return api;
};