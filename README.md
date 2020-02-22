# marked-forms
![CI](https://github.com/jldec/marked-forms/workflows/CI/badge.svg)

Custom [marked renderer](https://marked.js.org/#/USING_PRO.md#renderer) to generate html form inputs.

## installation

```sh
npm install marked-forms
```

## usage

```javascript
var marked = require('marked');
var renderer = new marked.Renderer();

// note as of v2.0.0, the 2nd parameter is required to monkey-patch marked to support
// spaces in the url part of links, which is used for the form-field name attribute.

require('marked-forms')(renderer, marked);    // monkey-patches the renderer

var html = marked(markdown, {renderer:renderer});
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

