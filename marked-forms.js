/**
 * marked-forms.js
 *
 * forms-renderer for marked.js
 * generates labels and input controls from [text ?input?](name)
 *
 * usage: marked.use(markedForms())
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
 *
**/

/*eslint no-unused-vars: "off"*/

module.exports = function markedForms() {

  // for state machine used by renderOption
  var listState = { pending:'' };

  return {
    renderer: { link:link, listitem:listitem, list:list, paragraph:paragraph },
    tokenizer: { link: tokenizeLink }
  };

  //--//--//--//--//--//--//--//--//--//--//

  // patch the link tokenizer regexp on first usage
  function tokenizeLink(src) {
    if (!this._marked_forms_patched_link_rule) {
      var rules = this.rules.inline;
      rules.link = new RegExp(rules.link.source.replace('|[^\\s\\x00-\\x1f', '|[^"\\x00-\\x1f'));
      this._marked_forms_patched_link_rule = true;
    }
    return false;
  }

  // markdown link syntax extension for forms
  function link(href, title, text) {

    var reLabelFirst = /^(.*?)\s*\?([^?\s]*)\?(\*?)(X?)(H?)(M?)$/;
    var reLabelAfter = /^\?([^?\s]*)\?(\*?)(X?)(H?)(M?)\s*(.*)$/;

    var m = text.match(reLabelFirst);
    if (m) return renderInput(m[1], m[2], m[3], m[4], m[5], m[6], href, title, true);

    m = text.match(reLabelAfter);
    if (m) return renderInput(m[6], m[1], m[2], m[3], m[4], m[5], href, title, false);

    return false; // fallbacks.link.call(this, href, title, text);
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
    return false; // fallbacks.listitem.call(this, text);
  }

  // strip p tags while collecting listitems
  function paragraph(text) {
    if (inList()) return text;
    return false; // fallbacks.paragraph(text);
  }

  // rendering the list terminates listitem collector
  function list(body, ordered) {
    if (inList()) return body + endList();
    return false; // fallbacks.list.call(this, body, ordered);
  }


  function renderInput(text, type, required, checked, hidden, modern, name, css, labelFirst) {

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
    if (!modern && (type === 'checklist' || type === 'radiolist')) {
      labelfor = '';
    }

    var label = text ?
      '\n<label' + hidden + attr('for', labelfor) + attr('class', css) + '>' + text + '</label>' :
      '';

    var out = endList();

    if (type === 'label') return out + label;

    var el = 'input';

    if (type === 'select' || type === 'checklist' || type === 'radiolist') {
      el = (type === 'select' ? 'select' : (modern ? 'ul' : ''));
      startList(id, type, name, el, label, labelFirst, modern, required, checked);
      if (modern && !css) { css = type; }
      if (el === 'ul') { name=''; }
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

    var id = list.modern ? (list.id + '-' + (++list.count)) : '';
    var type = {checklist:'checkbox', radiolist:'radio'}[list.type];
    var openLabel = text ? '\n<label' + attr('class', type) + attr('for', id) + '>' : '';
    var closeLabel = text ? '</label>' : '';

    out = '<input' + list.required + list.checked + attr('id', id) + attr('class', list.required) + attr('type', type) + attr('name', list.name) + attr('value', value, true) + '>' ;

    if ( list.modern &&  list.labelFirst) return '<li class="' + type + '">' + openLabel + text + closeLabel + out + '</li>';
    if ( list.modern && !list.labelFirst) return '<li class="' + type + '">' + out + openLabel + text + closeLabel + '</li>';
    if (!list.modern &&  list.labelFirst) return openLabel + text + out + closeLabel;
    if (!list.modern && !list.labelFirst) return openLabel + out + text + closeLabel;
  }

  // mini state machine for listitem capture
  // used for select, checklist, and radiolist

  function startList(id, type, name, el, label, labelFirst, modern, required, checked) {
    listState = {
      pending    : '\n' + (el ? '</' + el + '>' : '') + (labelFirst ? '' : label ),
      id         : id,
      count      : 0,
      type       : type,
      name       : (type !== 'select' ? name : ''),
      labelFirst : labelFirst,
      modern     : modern,
      required   : required,
      checked    : checked
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

};
