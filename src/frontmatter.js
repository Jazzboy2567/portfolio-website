// Minimal front matter: `key: value` lines between `---` fences. Values may be
// [a, b, c] lists, true/false, or (optionally quoted) strings. Lines starting
// with # are comments. Shared by the build script and the admin API.

const unquote = (s) => s.replace(/^(["'])(.*)\1$/, '$2');

function parse(src, file = 'post') {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing front matter (--- block at the top)`);
  const data = {};
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf(':');
    if (i === -1) throw new Error(`${file}: bad front matter line "${line}"`);
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s.trim()))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else {
      value = unquote(value);
    }
    data[key] = value;
  }
  return { data, body: match[2] };
}

// Quote a string only when parse() would otherwise misread it.
function scalar(value) {
  const s = String(value).replace(/[\r\n]+/g, ' ').trim();
  if (s === 'true' || s === 'false' || /^["'[]/.test(s)) return s.includes('"') ? `'${s}'` : `"${s}"`;
  return s;
}

function stringify(data, body) {
  const lines = Object.entries(data).map(([key, value]) => {
    if (Array.isArray(value)) return `${key}: [${value.join(', ')}]`;
    if (typeof value === 'boolean') return `${key}: ${value}`;
    return `${key}: ${scalar(value)}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n${String(body).replace(/\r\n/g, '\n').trim()}\n`;
}

module.exports = { parse, stringify };
