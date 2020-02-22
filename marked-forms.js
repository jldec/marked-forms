/**
 * marked-forms.js
 *
 * forms-renderer for marked.js
 * generates labels and input controls from [text ?input?](name)
 *
 * usage: formsRenderer = markedForms(renderer, marked)
 * NOTE: 2nd paramater is optional - required to monkey-patch to allow links with spaces
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
 *
**/

var fallbacks = undefined;

module.exports = function markedForms(renderer, marked) {

  // avoid extending more than once (creates recursive method calls)
  if (fallbacks) return;

  // call fallback methods when not rendering forms
  fallbacks =
  { link: renderer.link,
    list: renderer.list,
    listitem: renderer.listitem,
    paragraph: renderer.paragraph };

  // monkey-patch marked to allow urls with spaces in links (gfm only)
  if (marked && marked.InlineLexer && marked.InlineLexer.rules && marked.InlineLexer.rules.gfm && marked.InlineLexer.rules.gfm.link) {
    marked.InlineLexer.rules.gfm.link =
      new RegExp(marked.InlineLexer.rules.gfm.link.source.replace('|[^\\s\\x00-\\x1f', '|[^"\\x00-\\x1f'));
  }

  // mutate renderer with forms-capable methods
  renderer.link = link;
  renderer.listitem = listitem;
  renderer.list = list;
  renderer.paragraph = paragraph;

  return renderer;
};

// markdown link syntax extension for forms
function link(href, title, text) {

  var reLabelFirst = /^(.*?)\s*\?([^?\s]*)\?(\*?)(X?)(H?)$/;
  var reLabelAfter = /^\?([^?\s]*)\?(\*?)(X?)(H?)\s*(.*)$/;

  var m = text.match(reLabelFirst);
  if (m) return renderInput(m[1], m[2], m[3], m[4], m[5], href, title, true);

  m = text.match(reLabelAfter);
  if (m) return renderInput(m[5], m[1], m[2], m[3], m[4], href, title, false);

  return fallbacks.link.call(this, href, title, text);
}

// capture listitems for select, checklist, radiolist
function listitem(text) {
  if (inList()) {

    // capture value in trailing "text" - unescape makes regexp work
    var m = unescapeQuotes(text).match(/^(.*)\s+"([^"]*)"\s*$/);

    var txt = m ? escapeQuotes(m[1]) : text;
    var val = m ? escapeQuotes(m[2]) : text;

    return renderOption(txt, val);
  }
  return fallbacks.listitem.call(this, text);
}

// strip p tags while collecting listitems
function paragraph(text) {
  if (inList()) return text;
  return fallbacks.paragraph(text);
}

// rendering the list terminates listitem collector
function list(body, ordered) {
  if (inList()) return body + endList();
  return fallbacks.list.call(this, body, ordered);
}


function renderInput(text, type, required, checked, hidden, name, css, labelFirst) {

  required = required ? ' required' : '';
  checked = checked ? ' checked' : '';
  hidden = hidden ? ' style="display:none;"' : '';
  var disabled = hidden ? ' disabled' : ''; // hidden fields are also disabled

  css = (required + (css ? ' ' + css : '')).slice(1);

  var value = '';
  if (type === 'submit' || type === 'button' || type === 'hidden') {
    value = text;
    text = '';
  } else if (type === 'checkbox' || type === 'radio') {
    value = 'checked';
  }

  if ( ! (type === 'submit' || type === 'button' || type === 'label')) {
    name = name || text;
  }

  if (type === 'submit') {
    hidden = disabled = ''; // don't allow submit to be hidden/disabled - breaks chrome auto-validation
  }

  if (name === '-') { name = ''; }

  var id = name && name.toLowerCase().replace(/[^\w]+/g, '-');

  var labelfor = id;
  if (type === 'checklist' || type === 'radiolist') {
    labelfor = '';
  }

  var label = text ?
    '\n<label' + hidden + attr('for', labelfor) + attr('class', css) + '>' + text + '</label>' :
    '';

  var out = endList();

  if (type === 'label') return out + label;

  var el = 'input';

  if (type === 'select' || type === 'checklist' || type === 'radiolist') {
    // suppress input except for select
    el = (type !== 'select' ?  '' : type);
    startList(type, name, el, label, labelFirst);
    type = '';
  }

  if (type === 'textarea') {
    el = type;
    type = '';
  }

  var input = el ?
    '\n<' + el + hidden + disabled + required + checked +
      attr('type', type) +
      attr('name', name) +
      attr('value', value) +
      attr('id', id) +
      attr('class', css) + '>' :
    '';

  if (el === 'textarea') { input += '</' + el + '>'; }

  if (labelFirst) { out += label + input; }
  else if (inList()) { out += input; }
  else { out += input + label; }

  return out;
}

function renderOption(text, value) {
  var out;
  var list = listState;

  if (list.type === 'select') {
    out = '\n<option' + attr('name', list.name) + attr('value', value, true) + '>' ;
    return out + text + '</option>';
  }

  var type = {checklist:'checkbox', radiolist:'radio'}[list.type];
  var openLabel = text ? '\n<label' + attr('class', type) + '>' : '';
  var closeLabel = text ? '</label>' : '';

  out = '<input' + attr('type', type) + attr('name', list.name) + attr('value', value, true) + '>' ;

  if (list.labelFirst) return openLabel + text + out + closeLabel;
  return openLabel + out + text + closeLabel;
}


// mini state machine for listitem capture
// used for select, checklist, and radiolist

var listState = { pending:'' };

function startList(type, name, el, label, labelFirst) {
  listState = {
    pending    : '\n' + (el ? '</' + el + '>' : '') + (labelFirst ? '' : label ),
    type       : type,
    name       : (type !== 'select' ? name : ''),
    labelFirst : labelFirst
  };
}

function inList() {
  return !!listState.pending;
}

function endList() {
  var out = listState.pending;
  listState = { pending:'' };
  return out;
}

// utility

function attr(nme, val, all) {
  return val || all ? ' ' + nme + '="' + escapeQuotes(val) + '"' : '';
}

function escapeQuotes(s) {
  return s.replace(/"/g, '&quot;');
}

function unescapeQuotes(s) {
  return s.replace(/&quot;/g, '"');
}
