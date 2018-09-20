# Extensions for dom-testing-library

API extensions to [dom-testing-library](https://github.com/kentcdodds/dom-testing-library) for easier DOM testing.

Designed specifically to facilitae form and field testing, including changing and submitting field values.

Can be used with [react-testing-library](https://github.com/kentcdodds/react-testing-library).
See React with Jest example below.

## Philosophy and design considerations

A core philosophy of this extension library is to better allow accessing elements by `id` or `name` as they are way less volatile reference markers.

Personally I like to use generators to generate most of my application artifacts from various schemas. Hence I don't know or care what labels will go in. This means that the core philosophy of "testing by end user usage" doesn't really suit my application development style, as I don't care about what the user sees at the end... until the end!

I personally tend to focus first on infrastructure and leave the UI/UX concerns including labels/text to the final stages of development (ie. "skinning").

Methods such as `getByText` and `getByLabel` are thus pretty useless to me, except perhaps for E2E testing at the end. Sure, you could somehow reference the same labels being injected, but why depend on that? And only works if the injection mechanism is "fixed" and not subject to change later, unless you then abstract away the mechanism with yet another wrapper :P

I much prefer to inject texts, labels, UI framework, theming etc. much later in the dev process. The key os to maintain flexibility with regards to _i18n_ and other such cross cutting concerns.

## Status

WIP: Under development. Has yet to be "battle tested" and is thus not published on npm just yet.

Currently using this library in [react-app-builder](https://github.com/kristianmandrup/react-app-builder)

## Quick start: react-testing-library

See [learning-material](https://www.npmjs.com/package/react-testing-library#learning-material)

## Dependencies

This library has no dependencies. It can be used directly with DOM elements, such as for _js-dom_.

PS: Might rename it later to not have the `react` name as it is really not React specific.

## Usage

```js
import { apiFor, eventsApi } from "dom-testing-lib-extensions";
```

## API

```js
import { fireEvent } from "react-testing-library";
```

use `eventsApi` to generate generic wrappers for `fireEvent` and other library specific methods

```js
const config = eventsApi({ fireEvent });
const api = apiFor(container, config);
```

The `api` returned exposes the following methods:

### elementBy

```js
// return a DOM element by selector
elementBy({
  parent, // parent selector
  element, // DOM element
  field, // DOM element
  tag, // tag name, such as: select
  id, // id of element
  testId, // data-testid value
  name, // name of element
  type // type of field, such as password or text
});
```

### elementsFor

```js
// retrieve a map of elements. Optionally execute an effect on each element
elementsFor(obj, effect);
```

Example:

```js
const elementsMap = {
  name: {
    // firstName field element selector
    name: "firstName",
    type: "text",
    value: "no name"
  },
  age: {
    // age field element selector
    testId: "age",
    value: 32
  }
};

// set value of each
api.elementsFor(elementsMap, (api, opts) => api.setValue(opts));
```

### forField

retrieve a dedicated form field value change API

```js
forField(field);
// => { changeValue(value, opts), setValue(value) }
```

### setValue

Set field `value` attribute for element matching `elementBy` selector.
Pass `value` option

```js
setValue({ name: "age", value: 32 });
```

Note: Can also handle `checked` option, passing it to `setChecked`

### setChecked

Set field `checked` attribute for element matching `elementBy` selector.
Pass `checked` option (`true` for checked, `false` unchecked)

```js
setChecked({ name: "married", checked: true });
```

### changeValue

Notify DOM that `value` attribute for element matching `elementBy` selector has been changed to a given value. Pass value as `value` option

```js
changeValue({ name: "role", value: "admin" });
```

Find element matching `elementBy` selector by default using: `type: 'submit'` and `element: 'button'`. If button found, clicks it, triggering form submit.

### changeChecked

Notify DOM that `checked` attribute for element matching `elementBy` selector has been changed to a given status (checked or unchecked). Pass checked status as `checked` option

```js
changeValue({ name: "married", checked: "true" });
```

### change

Generic `change` method that can be used with either `checked` or `value` option

```js
change({ name: "role", value: "admin" });
change({ name: "married", checked: "true" });
```

### check

Convenience method for `setChecked` with `checked: true`

```js
check({ name: "married" });
```

### uncheck

Convenience method for `setChecked` with `checked: false`

```js
uncheck({ name: "married" });
```

### setValues

Convenience methods to set or change multiple field inputs by iterating a map of property set configurations.

```js
setValues(obj);
```

Example:

```js
const elementsMap = {
  name: {
    // firstName field element selector
    name: "firstName",
    type: "text",
    value: "no name" // use setValue
  },
  age: {
    // age field element selector
    testId: "age",
    value: 32 // use setValue
  },
  married: {
    // age field element selector
    testId: "age",
    checked: true // use setChecked
  }
};

// set value of each
api.setValues(elementsMap);
```

### changeValues

```js
changeValues(obj
```

```js
const elementsMap = {
  name: {
    // firstName field element selector
    name: "firstName",
    type: "text",
    value: "no name"
  },
  age: {
    // age field element selector
    testId: "age",
    value: 32
  },
  married: {
    name: "married",
    checked: true // will fall back to use changeChecked instead
  }
};

// set value of each
api.changeValues(elementsMap);
```

### changeSelected

Call `onChange` DOM event with the list of `selectedOptions` as the target. An `option` in `selectedOptions` is set to state `selected` if it matches any value in the list passed in the `selected` option, such as `java` or `c#` in this example.

```js
api.changeSelected({ name: "languages", selected: ["java", "c#"] });
```

### setSelected

Similar to `setSelected` but simply sets state of options. Doesn't specifically call `onChange` DOM event. Set `option` elements of a multi `select` to be in state `selected` for each matching values in the list passed via `selected` option, such as `java` or `c#` in this example.

```js
api.setSelected({ name: "languages", selected: ["java", "c#"] });
```

### setUnselected

```js
api.setUnselected({ name: "languages", unselected: ["java", "c#"] });
```

### clearSelected

```js
api.clearSelected({ name: "languages" });
```

### clearValue

```js
api.clearValue({ name: "firstName" });
```

### withField

Execute function on matching field

```js
api.withField({ name: "firstName" }, field => (field.style = "color: red"));
```

### submit

Submit using first submit `button` element (with `type="submit"`)

```js
api.submit();
```

Submit using first submit `button` element (with `type="submit"`) that has a parent element with `id="payment-options"`

```js
api.submit({ parent: "#payment-options" });
```

### reset

Reset the values of all elements in the form

```js
api.reset({ name: "loginForm" });
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

## select element

See [react-select](https://jedwatson.github.io/react-select/) examples and [repo](https://github.com/JedWatson/react-select)

### Multi select

Could be done something like this:

```js
  handleChange({target}) {
    this.setState({
      selected: [...target.selectedOptions].map({value} => value)});
    }
  }

  render() {
    const { selected } = this.state
    return (
      <select multiple value={this.props.multiValue} onChange={this.handleChange}>
        {options.map(option => {
          <option value={option.value} selected={selected[option.value]}>{option.value}</option>
        })}
      </select>
    );
  }
```

#### Pre-fabricated select components

[react-select-multiple](https://www.npmjs.com/package/react-select-multiple) to display as list of checkboxes that syncs with a multi select.

See [react-select v2 demo with fixed options](https://react-select.com/home#fixed-options)

```js
export default class FixedOptions extends Component<*, State> {
  onChange(value, { action, removedValue }) {
    this.setState({ value: value });
  }

  render() {
    return (
      <Select
        value={this.state.value}
        isMulti
        styles={styles}
        isClearable={this.state.value.some(v => !v.isFixed)}
        name="colors"
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={this.onChange}
        options={colourOptions}
      />
    );
  }
}
```

## Development

### Create distribution

`npx babel src --out-dir dist`

## License

MIT

2018 Kristian Mandrup
