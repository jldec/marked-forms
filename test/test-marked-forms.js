/**
 * test-marked-forms
 * tests for marked-forms plugin
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
 *
**/
/*eslint indent: "off"*/

var test = require('tape');

var inspect = require('util').inspect;
var marked = require('marked');

var markedForms = require('../marked-forms');
marked.use(markedForms({ allowSpacesInLinks:true }));

var tests = [

{in:'[regular link](url)',
out:'<a href="url">regular link</a>'}
,
{comment: ' (NOTE: violates commonmark,but is required for forms with spaces in field names',
in:'[regular link](url space)',
out:'<a href="url%20space">regular link</a>'}
,
{in:'- regular list\n- with 2 list items',
out:'regular list</li>\n<li>with 2 list items'} // see unwrap2 below
,
{in:'[??]()',
out:'\n<input>'}
,
{in:'[??](name)',
out:'\n<input name="name" id="name">'}
,
{in:'[??](name "cssname")',
out:'\n<input name="name" id="name" class="cssname">'}
,
{comment: ' (NOTE: not recognized as a link)',
 in:'[??]("cssname")',
out:'[??](&quot;cssname&quot;)'}
,
{in:'[??*](name)',
out:'\n<input required name="name" id="name" class="required">'}
,
{in:'[?? Label Text](Name)',
out:'\n<input name="Name" id="name">' +
    '\n<label for="name">Label Text</label>'}
,
{in:'[Label Text ??](Name)',
out:'\n<label for="name">Label Text</label>' +
    '\n<input name="Name" id="name">'}
,
{in:'[?? Label Text](Name With Spaces)',
out:'\n<input name="Name With Spaces" id="name-with-spaces">' +
    '\n<label for="name-with-spaces">Label Text</label>'}
,
{in:'[Label Text ??](Name With Spaces)',
out:'\n<label for="name-with-spaces">Label Text</label>' +
    '\n<input name="Name With Spaces" id="name-with-spaces">'}
,
{in:'[?? Label Text]()',
out:'\n<input name="Label Text" id="label-text">' +
    '\n<label for="label-text">Label Text</label>'}
,
{in:'[Label Text ??]()',
out:'\n<label for="label-text">Label Text</label>' +
    '\n<input name="Label Text" id="label-text">'}
,
{in:'[??H Label Text]()',
out:'\n<input style="display:none;" disabled name="Label Text" id="label-text">' +
    '\n<label style="display:none;" for="label-text">Label Text</label>'}
,
{in:'[Label Text ??H](foo)',
out:'\n<label style="display:none;" for="foo">Label Text</label>' +
    '\n<input style="display:none;" disabled name="foo" id="foo">'}
,
{in:'[??* Label Text](Name)',
out:'\n<input required name="Name" id="name" class="required">' +
    '\n<label for="name" class="required">Label Text</label>'}
,
{in:'[Label Text ??*](Name)',
out:'\n<label for="name" class="required">Label Text</label>' +
    '\n<input required name="Name" id="name" class="required">'}
,
{in:'[??* Label Text]()',
out:'\n<input required name="Label Text" id="label-text" class="required">' +
    '\n<label for="label-text" class="required">Label Text</label>'}
,
{in:'[Label Text ??*]()',
out:'\n<label for="label-text" class="required">Label Text</label>' +
    '\n<input required name="Label Text" id="label-text" class="required">'}
,
{in:'[??*H Label Text]()',
out:'\n<input style="display:none;" disabled required name="Label Text" id="label-text" class="required">' +
    '\n<label style="display:none;" for="label-text" class="required">Label Text</label>'}
,
{in:'[Label Text ??*H]()',
out:'\n<label style="display:none;" for="label-text" class="required">Label Text</label>' +
    '\n<input style="display:none;" disabled required name="Label Text" id="label-text" class="required">'}
,
{in:'[??*H Label Text]()',
out:'\n<input style="display:none;" disabled required name="Label Text" id="label-text" class="required">' +
    '\n<label style="display:none;" for="label-text" class="required">Label Text</label>'}
,
{in:'[Label Text ??*H]()',
out:'\n<label style="display:none;" for="label-text" class="required">Label Text</label>' +
    '\n<input style="display:none;" disabled required name="Label Text" id="label-text" class="required">'}
,
{in:'- [Label Text ?select?](Name)' +
    '\n    - option1',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n</select>'}
,
{in:'- [?select? Label Text](Name)' +
    '\n    - option1',
out:'\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n</select>' +
    '\n<label for="name">Label Text</label>'}
,
{in:'- [Label Text ?select?*](Name)' +
    '\n    - option1',
out:'\n<label for="name" class="required">Label Text</label>' +
    '\n<select required name="Name" id="name" class="required">' +
    '\n<option value="option1">option1</option>' +
    '\n</select>'}
,
{in:'- [?select?* Label Text](Name)' +
    '\n    - option1',
out:'\n<select required name="Name" id="name" class="required">' +
    '\n<option value="option1">option1</option>' +
    '\n</select>' +
    '\n<label for="name" class="required">Label Text</label>'}
,
{in:'- [?select? Label Text](Name)' +
    '\n    - option1' +
    '\n    - option2' +
    '\n    - option3',
out:'\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>' +
    '\n<label for="name">Label Text</label>'}
,
{in:'- [Label Text ?select?](Name)' +
    '\n    - option1' +
    '\n    - option2' +
    '\n    - option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Label Text ?select?](Name)' +
    '\n' +
    '\n- option1' +
    '\n- option2' +
    '\n- option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Label Text ?select?](Name)' +
    '\n' +
    '\n- option1' +
    '\n' +
    '\n- option2' +
    '\n' +
    '\n- option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Label Text ?select?](Name)' +
    '\n' +
    '\n* option1' +
    '\n' +
    '\n* option2' +
    '\n' +
    '\n* option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Label Text ?select?](Name)' +
    '\n' +
    '\n  1. option1' +
    '\n' +
    '\n  2. option2' +
    '\n' +
    '\n  8. option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Label Text ?select?](Name)' +
    '\n' +
    '\n- option1 "val1" ' +
    '\n- option2 " ' +
    '\n- option3 with "quoted" text "val3"',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="val1">option1</option>' +
    '\n<option value="option2 &quot; ">option2 &quot; </option>' +
    '\n<option value="val3">option3 with &quot;quoted&quot; text</option>' +
    '\n</select>'}
,
{in:'* [Label Text ?select?](Name)' +
    '\n    - option1' +
    '\n    - option2' +
    '\n    - option3',
out:'\n<label for="name">Label Text</label>' +
    '\n<select name="Name" id="name">' +
    '\n<option value="option1">option1</option>' +
    '\n<option value="option2">option2</option>' +
    '\n<option value="option3">option3</option>' +
    '\n</select>'}
,
{in:'[Email ?email?](name)',
out:'\n<label for="name">Email</label>' +
    '\n<input type="email" name="name" id="name">'}
,
{in:'[Non-standard ?non-standard?*](name)',
out:'\n<label for="name" class="required">Non-standard</label>' +
    '\n<input required type="non-standard" name="name" id="name" class="required">'}
,
{in:'[?checklist?](name)' +
    '\n' +
    '\n- check1' +
    '\n- check2' +
    '\n- check3',
out:'\n<label class="checkbox">check1<input type="checkbox" name="name" value="check1"></label>' +
    '\n<label class="checkbox">check2<input type="checkbox" name="name" value="check2"></label>' +
    '\n<label class="checkbox">check3<input type="checkbox" name="name" value="check3"></label>' +
    '\n'}
,
{in:'[  ?checklist?](name)' +
    '\n' +
    '\n- check1' +
    '\n- check2' +
    '\n- check3',
out:'\n<label class="checkbox">check1<input type="checkbox" name="name" value="check1"></label>' +
    '\n<label class="checkbox">check2<input type="checkbox" name="name" value="check2"></label>' +
    '\n<label class="checkbox">check3<input type="checkbox" name="name" value="check3"></label>' +
    '\n'}
,
{in:'[?checklist?  ](name)' +
    '\n' +
    '\n- check1' +
    '\n- check2' +
    '\n- check3',
out:'\n<label class="checkbox"><input type="checkbox" name="name" value="check1">check1</label>' +
    '\n<label class="checkbox"><input type="checkbox" name="name" value="check2">check2</label>' +
    '\n<label class="checkbox"><input type="checkbox" name="name" value="check3">check3</label>' +
    '\n'}
,
{in:'[?radiolist?  ](name)' +
    '\n' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<label class="radio"><input type="radio" name="name" value="radio1">radio1</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="radio2">radio2</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="radio3">radio3</label>' +
    '\n'}
,
{in:'[?radiolist? Radiolist with a label after](name)' +
    '\n' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<label class="radio"><input type="radio" name="name" value="radio1">radio1</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="radio2">radio2</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="radio3">radio3</label>' +
    '\n' +
    '\n<label>Radiolist with a label after</label>'}
,
{in:'[Radiolist with a label before ?radiolist?](name)' +
    '\n' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<label>Radiolist with a label before</label>'+
    '\n<label class="radio">radio1<input type="radio" name="name" value="radio1"></label>' +
    '\n<label class="radio">radio2<input type="radio" name="name" value="radio2"></label>' +
    '\n<label class="radio">radio3<input type="radio" name="name" value="radio3"></label>' +
    '\n'}
,
{in:'- [?radiolist? ](name)' +
    '\n  - radio 1 "value1"' +
    '\n  - radio 2 "value2"' +
    '\n  - radio 3 "value3"',
out:'\n<label class="radio"><input type="radio" name="name" value="value1">radio 1</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="value2">radio 2</label>' +
    '\n<label class="radio"><input type="radio" name="name" value="value3">radio 3</label>' +
    '\n'}
,
{in:'[?checklist?M](name)' +
    '\n- check-a1' +
    '\n- check2' +
    '\n- check3',
out:'\n<ul id="name" class="checklist">' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-1">check-a1</label><input id="name-1" type="checkbox" name="name" value="check-a1"></li>' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-2">check2</label><input id="name-2" type="checkbox" name="name" value="check2"></li>' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-3">check3</label><input id="name-3" type="checkbox" name="name" value="check3"></li>' +
    '\n</ul>'}
,
{in:'[  ?checklist?M](name)' +
    '\n- check1' +
    '\n- check2' +
    '\n- check3',
out:'\n<ul id="name" class="checklist">' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-1">check1</label><input id="name-1" type="checkbox" name="name" value="check1"></li>' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-2">check2</label><input id="name-2" type="checkbox" name="name" value="check2"></li>' +
    '<li class="checkbox">' +
    '\n<label class="checkbox" for="name-3">check3</label><input id="name-3" type="checkbox" name="name" value="check3"></li>' +
    '\n</ul>'}
,
{in:'[?checklist?M  ](name)' +
    '\n- check1' +
    '\n- check2' +
    '\n- check3',
out:'\n<ul id="name" class="checklist">' +
    '<li class="checkbox"><input id="name-1" type="checkbox" name="name" value="check1">' +
    '\n<label class="checkbox" for="name-1">check1</label></li>' +
    '<li class="checkbox"><input id="name-2" type="checkbox" name="name" value="check2">' +
    '\n<label class="checkbox" for="name-2">check2</label></li>' +
    '<li class="checkbox"><input id="name-3" type="checkbox" name="name" value="check3">' +
    '\n<label class="checkbox" for="name-3">check3</label></li>' +
    '\n</ul>'}
,
{in:'[?radiolist?M  ](name)' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<ul id="name" class="radiolist">' +
    '<li class="radio"><input id="name-1" type="radio" name="name" value="radio1">' +
    '\n<label class="radio" for="name-1">radio1</label></li>' +
    '<li class="radio"><input id="name-2" type="radio" name="name" value="radio2">' +
    '\n<label class="radio" for="name-2">radio2</label></li>' +
    '<li class="radio"><input id="name-3" type="radio" name="name" value="radio3">' +
    '\n<label class="radio" for="name-3">radio3</label></li>' +
    '\n</ul>'}
,
{in:'[?radiolist?M Radiolist with a label after](name)' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<ul id="name" class="radiolist">' +
    '<li class="radio"><input id="name-1" type="radio" name="name" value="radio1">' +
    '\n<label class="radio" for="name-1">radio1</label></li>' +
    '<li class="radio"><input id="name-2" type="radio" name="name" value="radio2">' +
    '\n<label class="radio" for="name-2">radio2</label></li>' +
    '<li class="radio"><input id="name-3" type="radio" name="name" value="radio3">' +
    '\n<label class="radio" for="name-3">radio3</label></li>' +
    '\n</ul>' +
    '\n<label for="name">Radiolist with a label after</label>'}
,
{in:'[Radiolist with a label before ?radiolist?M](name)' +
    '\n- radio1' +
    '\n- radio2' +
    '\n- radio3',
out:'\n<label for="name">Radiolist with a label before</label>' +
    '\n<ul id="name" class="radiolist">' +
    '<li class="radio">' +
    '\n<label class="radio" for="name-1">radio1</label><input id="name-1" type="radio" name="name" value="radio1"></li>' +
    '<li class="radio">' +
    '\n<label class="radio" for="name-2">radio2</label><input id="name-2" type="radio" name="name" value="radio2"></li>' +
    '<li class="radio">' +
    '\n<label class="radio" for="name-3">radio3</label><input id="name-3" type="radio" name="name" value="radio3"></li>' +
    '\n</ul>'}
,
{in:'- [?radiolist?M ](name)' +
    '\n  - radio 1 "value1"' +
    '\n  - radio 2 "value2"' +
    '\n  - radio 3 "value3"',
out:'\n<ul id="name" class="radiolist">' +
    '<li class="radio"><input id="name-1" type="radio" name="name" value="value1">' +
    '\n<label class="radio" for="name-1">radio 1</label></li>' +
    '<li class="radio"><input id="name-2" type="radio" name="name" value="value2">' +
    '\n<label class="radio" for="name-2">radio 2</label></li>' +
    '<li class="radio"><input id="name-3" type="radio" name="name" value="value3">' +
    '\n<label class="radio" for="name-3">radio 3</label></li>' +
    '\n</ul>'}
,
{in:'[?label? Label text]()',
out:'\n<label>Label text</label>'}
,
{in:'[?label? Label text](-)',
out:'\n<label>Label text</label>'}
,
{in:'[?label? Label text](name "classname1 classname2")',
out:'\n<label for="name" class="classname1 classname2">Label text</label>'}
,
{in:'[?label? Label text](- "classname1 classname2")',
out:'\n<label class="classname1 classname2">Label text</label>'}
,
{in:'[Label text ?label?](name with spaces "classname1 classname2")',
out:'\n<label for="name-with-spaces" class="classname1 classname2">Label text</label>'}
,
{in:'[?checkbox?*X Label Text](name)',
out:'\n<input required checked type="checkbox" name="name" value="checked" id="name" class="required">' +
    '\n<label for="name" class="required">Label Text</label>'}
,
{in:'[?checkbox?X Label Text](name "custom-class")',
out:'\n<input checked type="checkbox" name="name" value="checked" id="name" class="custom-class">' +
    '\n<label for="name" class="custom-class">Label Text</label>'}
,
{in:'[Label Text ?checkbox?]()',
out:'\n<label for="label-text">Label Text</label>' +
    '\n<input type="checkbox" name="Label Text" value="checked" id="label-text">'}
,
{in:'[Label Text ?checkbox?](name)',
out:'\n<label for="name">Label Text</label>' +
    '\n<input type="checkbox" name="name" value="checked" id="name">'}
,
{comment: ' hidden submit input not allows - breaks chrome validation',
in:'[Submit text ?submit?]()',
out:'\n<input type="submit" value="Submit text">'}
,
{in:'[Submit text ?submit?H]()',
out:'\n<input type="submit" value="Submit text">'}
,
{in:'[?submit? Submit text]()',
out:'\n<input type="submit" value="Submit text">'}
,
{in:'[?submit? Submit text](- "booger")',
out:'\n<input type="submit" value="Submit text" class="booger">'}
,
{in:'[Submit text ?submit?](name)',
out:'\n<input type="submit" name="name" value="Submit text" id="name">'}
,
{comment: ' (NOTE: dup ids prevent labels from associating - use ?radiolist?)',
in:  '[Radio 1 ?radio?](name) [Radio 2 ?radio?](name)',
out:'\n<label for="name">Radio 1</label>' +
    '\n<input type="radio" name="name" value="checked" id="name"> ' +
    '\n<label for="name">Radio 2</label>' +
    '\n<input type="radio" name="name" value="checked" id="name">'}
,
{in:'- [Cellphone Service Provider ?select?](carrier)' +
    '\n  - Please select ""' +
    '\n  - T-Mobile "TMO"' +
    '\n  - Verizon' +
    '\n  - AT&T "ATT"',
out:'\n<label for="carrier">Cellphone Service Provider</label>' +
    '\n<select name="carrier" id="carrier">' +
    '\n<option value="">Please select</option>' +
    '\n<option value="TMO">T-Mobile</option>' +
    '\n<option value="Verizon">Verizon</option>' +
    '\n<option value="ATT">AT&amp;T</option>' +
    '\n</select>'},
{in:'First Header | Second Header' +
    '\n------------ | -------------' +
    '\nContent from cell 1 | Content from cell 2' +
    '\nContent in the first column | Content in the second column',
out:'<table>' +
    '\n<thead>' +
    '\n<tr>' +
    '\n<th>First Header</th>' +
    '\n<th>Second Header</th>' +
    '\n</tr>' +
    '\n</thead>' +
    '\n<tbody><tr>' +
    '\n<td>Content from cell 1</td>' +
    '\n<td>Content from cell 2</td>' +
    '\n</tr>' +
    '\n<tr>' +
    '\n<td>Content in the first column</td>' +
    '\n<td>Content in the second column</td>' +
    '\n</tr>' +
    '\n</tbody></table>\n'}
];

// for convenience of writing test cases, unwrap strips paragraph or list markup from around the output
function wrap(s) { return '<p>' + s + '</p>\n'; }
function wrap2(s) { return '<ul>\n<li>' + s + '</li>\n</ul>\n'; }
function unwrap(s) { return (/^<p>/.test(s) ? s.slice(3,-5) : (/^<ul>/.test(s) ? s.slice(9,-12) : s)); }

test('sanity check unwrap()', function(t) {
  t.equal(unwrap('hello'),'hello');
  t.equal(unwrap(wrap('hello')),'hello');
  t.equal(unwrap(wrap2('hello')),'hello');
  t.end();
});

tests.forEach(function(tst){
  test(inspect(tst.in).slice(1,-1) + (tst.comment || ''), function(t){
    var actual = marked(tst.in);
    // console.log('@@@\n%s\n@@@', actual);
    t.equal(unwrap(actual), tst.out);
    t.end();
  });
});
