# Extensions for react-testing-library

Useful extensions to react-testing-library for easier testing.

Includes specific API methods for form/field input testing

A core philosophy of this project is to better allow accessing elements by `id` or `name` as they are less volatile.

Personally I like to use generators to generate most of my application artifacts from schemas, without knowing what labels would go in, so the core philosophy of "testing by usage" doesn't really suit my application development style.

I tend to focus first on infrastructure and leave the UI concerns including labels/text to the final stage. Hence methods such as `getByText` or `getByLabel` is pretty useless to me except perhaps for E2E testing at the end.

I like to inject texts, labels, UI framework, theming etc. much later in the dev process and maintain flexibility with regards to _i18n_ etc.

## API

```js
const api = apiFor(container);
```

```js
// return a DOM element by selector
elementBy({
  parent,
  tag,
  id,
  testId,
  name,
  type
});

// retrieve a map of elements. Optionally execute an effect on each element
elementsFor(obj, effect)

// retrieve a dedicated form field value change API
forField(field)
// {
//   changeValue(value, opts)
//   setValue()
// }

// set field value for element matching elementBy selector
// pass value option
setValue(opts)  // same options as elementBy

// set field value for element matching elementBy selector
// pass value option
changeValue(opts)  // same options as elementBy

// find element matching elementBy selector
// by default using: type: 'submit' and element: 'button'
// if button found, clicks it
submit(opts)  // same options as elementBy

// convenience methods to set or change multiple field inputs by iterating a map
setValues(obj)
changeValues(obj
```

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
  rendered: render(<personForm.Component {...props} />)
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

Testing the form and fields, we use `apiFor` to provide a convenient API for working efficiently with the DOM. We extract container from the `form.rendered` object returned by the `render` method of `react-testing-library`

```js
const { container } = form.rendered;
const formApi = apiFor(container);
```

We have all the usual `getByXYZ` methods available as usual if we need them.

```js
const { container, getByTestId, getByLabelText, getByText } = form.rendered;
```

We use `elementsBy` provided by the api returned to get a map of the fields (DOM elements) in the form

We could also extract the api methods we want to use directly as follows

```js
const { elementsFor, setValues, changeValues } = apiFor(container);
```

We then use `elementsFor` to retieve a map of DOM elements of the fields we want to put under test.

```js
// retrieve the DOM elements for each field in the form, using name selector
const inputs = formApi.elementsFor({
  name: { name: "name" },
  age: { name: "age" }
});
```

We can then pass these field referenced to our helper `testInputs` to simulate firing `change` in each of the fields.

Note: For simplicity we here assume each field is a simple `<input>` element (why we call the helper method `testInputs`).

```js
// use the helper to test each input (field) value change handler
testInputs({ inputs, form, type: "change" });
```

```js
// TODO: iterate values
expect(form.state("name")).toEqual(values["name"]);
```

After having tested the effect of `change` value events on the form state, we then test what happens when we set the input values and click `submit`.

We use `type: 'set'` to test to tell our test helper `testInputs` to use `setValue` instead of `changeValue`.

```js
testInputs({ inputs, form, type: "set" });

// TODO: test that state is submitted somehow...
```

Please note that we could optimize this testing further using the `setValues` and `changeValues` methods, but this scenario walk-through was meant to illustrate most of the core methods exposed. You can always add extra higher level methods as needed.

## License

MIT

2018 Kristian Mandrup
