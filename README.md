# marked-forms

Custom [marked renderer](https://github.com/chjj/marked#renderer) to generate html form inputs.

## installation

```sh
npm install marked-forms
```

## usage

```javascript
var marked = require('marked');
var renderer = require('marked-forms')(new marked.Renderer());

var html = marked(markdown, {renderer:renderer});
```

## **text** input

```md
[Provide a Name ??]()
```

<label for="provide-a-name">Provide a Name</label> <input name="Provide a Name" id="provide-a-name">

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


## **select**

<label for="name">Choose one</label> <select name="Name" id="name">
<option value="option1">option1</option>
<option value="option2">option2</option>
<option value="option3">option3</option>
</select>

markdown:

```md
[Choose one ?select?](nme)
- option1
- option2
- option3
```

html:

```html
<label for="nme">Choose one</label>
<select name="nme" id="nme">
<option value="option1">option1</option>
<option value="option2">option2</option>
<option value="option3">option3</option>
</select>
```

## **check list**

```md
[?checklist?](name)
- check1
- check2
- check3
```

[?checklist?](name)
- check1
- check2
- check3

## there's more
Additional doc coming soon. For now check out [code](marked-forms.js) and [tests](test/test-marked-forms.js).