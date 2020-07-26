# marked-forms
[![CI](https://github.com/jldec/marked-forms/workflows/CI/badge.svg)](https://github.com/jldec/marked-forms/actions)

Marked.js plugin for generating HTML form inputs from markdown.

Generates labels and input controls from markdown links like `[text ?input?](name)`.

## installation

```sh
npm install marked-forms
```
## breaking changes
- As of v3.0.0, this library uses the [`marked.use()`](https://marked.js.org/#/USING_PRO.md#use) plugin api.
- As of v4.0.0, the plugin will only patch the marked link tokenizer to allow spaces in unbracketed links if
  `opts.allowSpacesInLinks` is set. The recommended alternative is to use pointy brackets `[](<links with spaces>)`
  once the [marked](https://github.com/markedjs/marked) library complies with [commonmark](https://spec.commonmark.org/0.29/#link-destination) in this respect.

## usage

```javascript
var marked = require('marked');

var markedForms = require('marked-forms');
marked.use(markedForms(opts)); // optional opts { allowSpacesInLinks: true }

var html = marked(markdown);
```

## text input

markdown

```md
[Provide a Name ??]()
```

html

```html
<label for="provide-a-name">Provide a Name</label>
<input name="Provide a Name" id="provide-a-name">
```

- `??` at the start or end of the link text results in an `<input>` with a `<label>` before or after it.

- `id` and `for` and `name` attributes are derived from the text.

- `id` and `for` are sluglified, `name` is not.

- explicit `id`, `for`, `name` can be specified by doing

```md
[Different label ??](nme)
```

```html
<label for="nme">Different label</label>
<input name="nme" id="nme">
```

- if you don't need need any label, just do `[??](nme)`

```html
<input name="nme" id="nme">
```


## select

markdown

```md
[Choose one ?select?](nme)
- option 1 "val1"
- option 2 "val2"
- option 3
```

html

```html
<label for="nme">Choose one</label>
<select name="nme" id="nme">
<option value="val1">option 1</option>
<option value="val2">option 2</option>
<option value="option 3">option 3</option>
</select>
```

## check list

markdown

```md
[?checklist?](name)
- check1
- check2
- check3
```

html

```html
<label class="checkbox">check1<input type="checkbox" name="name" value="check1"></label>
<label class="checkbox">check2<input type="checkbox" name="name" value="check2"></label>
<label class="checkbox">check3<input type="checkbox" name="name" value="check3"></label>
```

## "Modern" check list

markdown

```md
[?checklist?M](name)
- check1
- check2
- check3
```

html

```html
<ul id="name" class="checklist">
  <li class="checkbox">
    <label class="checkbox" for="name-1">check-a1</label>
    <input id="name-1" type="checkbox" name="name" value="check-a1">
  </li>
  <li class="checkbox">
    <label class="checkbox" for="name-2">check2</label>
    <input id="name-2" type="checkbox" name="name" value="check2">
  </li>
  <li class="checkbox">
    <label class="checkbox" for="name-3">check3</label>
    <input id="name-3" type="checkbox" name="name" value="check3">
  </li>
</ul>
```

## radio list

markdown

```md
[?radiolist? ](name)
- radio 1 "value1"
- radio 2 "value2"
- radio 3 "value3"
```

html

```html
<label class="radio"><input type="radio" name="name" value="value1">radio 1</label>
<label class="radio"><input type="radio" name="name" value="value2">radio 2</label>
<label class="radio"><input type="radio" name="name" value="value3">radio 3</label>
```

## "Modern" radio list

markdown

```md
[?radiolist?M ](name)
- radio 1 "value1"
- radio 2 "value2"
- radio 3 "value3"
```

html

```html
<ul id="name" class="radiolist">
  <li class="radio">
    <input id="name-1" type="radio" name="name" value="radio1">
    <label class="radio" for="name-1">radio1</label>
  </li>
  <li class="radio">
    <input id="name-2" type="radio" name="name" value="radio2">
    <label class="radio" for="name-2">radio2</label>
  </li>
  <li class="radio">
    <input id="name-3" type="radio" name="name" value="radio3">
    <label class="radio" for="name-3">radio3</label>
  </li>
</ul>
```

## * for required fields

markdown

```md
[Label Text ??*](Name)
```


html

```html
<label for="name" class="required">Label Text</label>
<input required name="Name" id="name" class="required">
```


## H for hidden fields

markdown

```md
[Label Text ??H](foo)
```


html

```html
<label style="display:none;" for="foo">Label Text</label>
<input style="display:none;" disabled name="foo" id="foo">
```


## CSS styles 

markdown

```md
[?submit? Submit text](- "class1 class2")
```


html

```html
<input type="submit" value="Submit text" class="class1 class2">
```

For more details check out the [tests](test/test-marked-forms.js).

