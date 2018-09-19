# Extensions for react-testing-library

Useful extensions to react-testing-library for easier testing, including form/field input testing etc.

## Example Scenario

Imagine we have a person form with fields to update

- `name`
- `age`

The `personForm` is created via a factory function that returns an object, consisting of:

- an internal `state` pointer
- the form `Component`

```js
import { render } from "react-testing-library";
import { createPersonForm } from "./person/form/factory";

const personForm = createPersonForm({
  // some configuration
  // ...
  state: {
    // form state config here
  }
});
```

For testing we use `render` from `react-testing-library` to give us the rendered (DOM) form element

```js
const form = {
  state: personForm.state,
  element: render(<personForm.Component {...props} />)
};
```

We now want to simulate entering the following values into the form and perhaps test submit of the form as well

```js
const values = {
  name: "Kristian",
  age: 32
};
```

We want to test:

- `change` event handler to if state is changed to reflect input value change
- `submit` of the form (ie. clicking `submit` button)

We start with a few helper functions and factories for added convenience and efficiency

```js
const createTesterApi = (api, {name, value}) => {
  return {
    change() => api.changeValue(name, value),
    set() => api.setValue(name, value)
  }
}

const createInputTester = (field) => ({name, value, type = 'change'}) => {
  const api = apiFor(field)
  const testerApi = createTesterApi(api, {name, value})
  // changes or sets value for the input
  testerApi[type]()
}

const submitForm = (form, opts = {}) => {
  const api = apiFor(form)
  api.submit(opts)
}

const testInputs = ({inputs, form, type = 'change'}) => {
  Object
  .keys(inputs)
  .map(key => {
    const testInput = createInputTester(inputs[key])
    testInput({name: key, value: values[key], type})
  })

  const api = apiFor(form.element)
  // submit the form is we are using set
  type === 'set' && submitForm(form.element)
}
```

Testing the form and fields, we use `apiFor` to provide a convenient API for working efficiently with the DOM.

```js
const formApi = apiFor(form.element);
```

We then use `elementsBy` to get a map of the fields (DOM elements) in the form

```js
// retrieve the DOM elements for each field in the form, using name selector
const inputs = formApi.elementsBy({
  name: { name: "name" },
  age: { name: "age" }
});
```

We then pass these fields to `testInputs` to simulate `change` in each of the fields.
For simpliciy we here assume each field is a simple `<input>` element (why we call the helper method `testInputs`).

```js
// use the helper to test each input (field) value change handler
testInputs({ inputs, form, type: "change" });
```

```js
// TODO: iterate values
expect(form.state("name")).toEqual(values["name"]);
```

We then test using `type: 'set'` to test what happens when we simply set all the input values and then click submit at the end.

```js
testInputs({ inputs, form, type: "set" });

// TODO: test that state is submitted somehow...
```

## License

MIT

2018 Kristian Mandrup
