// A small HTML reader for the built pages under out/. The tests need no new dependency, and React's static
// output is regular enough for this: tags, attributes, text, comments, void elements and raw-text elements.

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
]);
const RAW_TEXT_ELEMENTS = new Set(["script", "style"]);
const ESCAPABLE_RAW_TEXT_ELEMENTS = new Set(["title", "textarea"]);
const NON_RENDERED_ELEMENTS = new Set(["script", "style", "template", "noscript", "head"]);

const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " ", ndash: "–", mdash: "—",
  hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", middot: "·",
  copy: "©", star: "☆", bull: "•",
};

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, body) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    const value = NAMED_ENTITIES[body.toLowerCase()];
    return value === undefined ? match : value;
  });
}

export function parseHtml(html) {
  const lower = html.toLowerCase();
  const root = { type: "element", tag: "#root", attrs: {}, children: [], parent: null };
  let current = root;
  let i = 0;
  const n = html.length;
  const pushText = (text) => {
    if (text.length > 0) {
      current.children.push({ type: "text", text: decodeEntities(text), parent: current });
    }
  };
  while (i < n) {
    if (html.startsWith("<!--", i)) {
      const end = html.indexOf("-->", i + 4);
      i = end < 0 ? n : end + 3;
      continue;
    }
    if (html.startsWith("<!", i) || html.startsWith("<?", i)) {
      const end = html.indexOf(">", i);
      i = end < 0 ? n : end + 1;
      continue;
    }
    if (html[i] === "<" && html[i + 1] === "/") {
      const end = html.indexOf(">", i);
      const tag = html.slice(i + 2, end < 0 ? n : end).trim().toLowerCase();
      i = end < 0 ? n : end + 1;
      let node = current;
      while (node && node !== root && node.tag !== tag) {
        node = node.parent;
      }
      if (node && node !== root) {
        current = node.parent;
      }
      continue;
    }
    if (html[i] === "<" && /[a-zA-Z]/.test(html[i + 1] ?? "")) {
      let j = i + 1;
      while (j < n && /[^\s/>]/.test(html[j])) j++;
      const tag = html.slice(i + 1, j).toLowerCase();
      const attrs = {};
      let selfClosing = false;
      while (j < n) {
        while (j < n && /\s/.test(html[j])) j++;
        if (html[j] === ">") {
          j++;
          break;
        }
        if (html[j] === "/" && html[j + 1] === ">") {
          selfClosing = true;
          j += 2;
          break;
        }
        if (html[j] === "/") {
          j++;
          continue;
        }
        let k = j;
        while (k < n && /[^\s=/>]/.test(html[k])) k++;
        const name = html.slice(j, k).toLowerCase();
        j = k;
        while (j < n && /\s/.test(html[j])) j++;
        let value = "";
        if (html[j] === "=") {
          j++;
          while (j < n && /\s/.test(html[j])) j++;
          if (html[j] === "\"" || html[j] === "'") {
            const quote = html[j];
            const end = html.indexOf(quote, j + 1);
            value = html.slice(j + 1, end < 0 ? n : end);
            j = end < 0 ? n : end + 1;
          } else {
            let end = j;
            while (end < n && /[^\s>]/.test(html[end])) end++;
            value = html.slice(j, end);
            j = end;
          }
        }
        if (name) {
          attrs[name] = decodeEntities(value);
        }
      }
      const element = { type: "element", tag, attrs, children: [], parent: current };
      current.children.push(element);
      if (RAW_TEXT_ELEMENTS.has(tag) || ESCAPABLE_RAW_TEXT_ELEMENTS.has(tag)) {
        const close = lower.indexOf(`</${tag}`, j);
        const end = close < 0 ? n : close;
        const raw = html.slice(j, end);
        element.children.push({
          type: "text",
          text: ESCAPABLE_RAW_TEXT_ELEMENTS.has(tag) ? decodeEntities(raw) : raw,
          parent: element,
        });
        const gt = close < 0 ? n : html.indexOf(">", close);
        i = gt < 0 ? n : gt + 1;
        continue;
      }
      if (!VOID_ELEMENTS.has(tag) && !selfClosing) {
        current = element;
      }
      i = j;
      continue;
    }
    const next = html.indexOf("<", html[i] === "<" ? i + 1 : i);
    const end = next < 0 ? n : next;
    pushText(html.slice(i, end));
    i = end;
  }
  return root;
}

export function walk(node, visit) {
  visit(node);
  if (node.type === "element") {
    for (const child of node.children) {
      walk(child, visit);
    }
  }
}

export function findAll(node, predicate) {
  const found = [];
  walk(node, (candidate) => {
    if (candidate !== node && candidate.type === "element" && predicate(candidate)) {
      found.push(candidate);
    }
  });
  return found;
}

export function findFirst(node, predicate) {
  return findAll(node, predicate)[0];
}

export function byTag(tag) {
  return (element) => element.tag === tag;
}

export function closest(node, predicate) {
  let candidate = node;
  while (candidate && candidate.tag !== "#root") {
    if (candidate.type === "element" && predicate(candidate)) {
      return candidate;
    }
    candidate = candidate.parent;
  }
  return undefined;
}

export function isInside(node, ancestor) {
  let candidate = node.parent;
  while (candidate) {
    if (candidate === ancestor) {
      return true;
    }
    candidate = candidate.parent;
  }
  return false;
}

// The text a reader sees: text nodes in document order, outside script, style, template, noscript and head.
export function textOf(node) {
  if (node.type === "text") {
    return node.text;
  }
  if (NON_RENDERED_ELEMENTS.has(node.tag)) {
    return "";
  }
  return node.children.map(textOf).join("");
}

export function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

export function classesOf(element) {
  return (element.attrs.class ?? "").split(/\s+/).filter(Boolean);
}

export function isAriaHidden(element) {
  return Boolean(closest(element, (candidate) => candidate.attrs["aria-hidden"] === "true"));
}

// The accessible name of a link, after the accessible-name computation in its simple form: aria-label first,
// then the text and the alt text of the content, skipping content hidden with aria-hidden.
export function accessibleName(element, root) {
  const label = element.attrs["aria-label"];
  if (label && label.trim()) {
    return label.trim();
  }
  const labelledBy = element.attrs["aria-labelledby"];
  if (labelledBy && root) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => findFirst(root, (candidate) => candidate.attrs.id === id))
      .filter(Boolean)
      .map((target) => normalize(textOf(target)))
      .join(" ");
    if (text.trim()) {
      return text.trim();
    }
  }
  const parts = [];
  const collect = (node) => {
    if (node.type === "text") {
      parts.push(node.text);
      return;
    }
    if (node.attrs["aria-hidden"] === "true" || NON_RENDERED_ELEMENTS.has(node.tag)) {
      return;
    }
    if (node !== element && node.attrs["aria-label"]) {
      parts.push(` ${node.attrs["aria-label"]} `);
      return;
    }
    if (node.tag === "img" && node.attrs.alt) {
      parts.push(` ${node.attrs.alt} `);
      return;
    }
    node.children.forEach(collect);
  };
  collect(element);
  return normalize(parts.join(""));
}
