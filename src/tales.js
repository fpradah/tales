
function parseTales(text) {
  var f_c = text.replace(/#.*/g, ''),
      item_re = /(?:\n{0,1}(.+))+/g,
      tab_re = /((?:\n {2}|\n\t{1}).+)+/g,
      item, tab, current_item,
      result = [];

  tab = tab_re.exec(f_c);
  if (!tab) {
    tab = [];
  }
  while ((item = item_re.exec(f_c)) !== null) {
    if (item.index === item_re.lastIndex) {
      item_re.lastIndex++;
    }
    if (item[0] === tab[0]) {
      if (tab.index === tab_re.lastIndex) {
        tab_re.lastIndex++;
      }
      current_item.subtale += tab[0].replace(/\n {2}|\n\t{1}/g, '\n') + '\n';
      tab = tab_re.exec(f_c);
      if (!tab) {
        tab = [];
      }
    } else {
      current_item = {
        tale: item[0],
        subtale: ""
      }
      result.push(current_item);
    }
  }
  return result;
}

export function parse(text) {
  var result = [],
      tale, tales,
      title_re = /(.+)/,
      title,
      description;
  parseTales(text).forEach((item) => {
    tale = {};
    title = title_re.exec(item.tale);
    description = item.tale.replace(title[0], '').trim().replace(/(  )+/g, ' ').replace(/(  )+/g, ' ');
    tale.title = title[0].trim().replace(/(  )+/g, ' ').replace(/(  )+/g, ' ');
    tale.description = description.trim();
    if (item.subtale !== "") {
      tale.tales = parse(item.subtale);
    }
    result.push(tale);
  });
  return result;
}

function match(tale, definitions) {
  var result,
      arg, min = Infinity, params;
  for (var definition of definitions.items) {
    if (definition.title.constructor === String) {
      if (definition.title === tale.title) {
        return definition;
      }
    } else if (definition.title.constructor === RegExp) {
      arg = tale.title.match(definition.title);
      if (arg) {
        if (arg[0] === arg.input) {
          params = arg.slice(1);
          if (min > params.length) {
            min = params.length;
            result = definition;
          }
        }
      }
    } else {
      throw new Error(`unrecognized type of data for "${definition.title}" at "${tale.title}"`);
    }
  }
  if (result) {
    return result;
  }
  throw new Error(`not found "${tale.title}"`);
}

function executeTale(tale, parent) {
  var matched,
      context;
  matched = match(tale, parent);
  if (matched) {
    this.setParent(matched);
    context = JSON.parse(JSON.stringify(tale));
    matched.fn(context);
    this.setParent(parent);
  }
  return matched;
}

function runTales(tales, parent) {
  var executed;
  tales.forEach((tale) => {
    executed = executeTale.call(this, { title: tale.title, description: tale.description }, parent);
    if (tale.tales) {
      if (tale.tales.length > 0) {
        runTales.call(this, tale.tales, executed);
      }
    }
  });
}

export class Context {
  constructor() {
    var definitions = {
          items:[],
          parent: null
        },
        current_parent = definitions;

    this.getParent = function getParent() {
      return current_parent;
    }
    this.setParent = function setParent(parent) {
      current_parent = parent;
    }
  }

  tell(fn, title) {
    var definitions = this.getParent();
    definitions.items.push({
      fn: fn,
      title: title,
      items: [],
      parent: definitions
    });
  }
  run(...arg) {
    var result = {
      ok: false,
      tales: []
    },
        process = (resolve, reject) => {
      var urls = [];
      for (var url of arg) {
        urls.push(fetch(url).then((response) => {
          if (response.ok) {
            return response.text().then((text) => { return parse(text); });
          } else {
            throw new Error(`${response.url} ${response.statusText} (${response.status})`);
          }
        }).then((tales) => {
          runTales.call(this, tales, this.getParent());
          result.tales.push(url);
        }, (error) => {
          throw error;
        }));
      }

      Promise.all(urls).then(() => {
        result.ok = true;
        resolve(result);
      }, (error) => {
        reject(error);
      });
    };
    return new Promise(process);
  }
}

