// A local stand-in for GitHub's GraphQL endpoint, for running retrieve-open-source-contributions.js against
// known pull requests. The contributions query is answered from a fixed list, and an issue-state query from the
// closedIssues set contributionsServer is given; any other query is answered by mirroring its selection set with
// neutral values.
import http from "node:http";

// ---------------------------------------------------------------------------------------------------------
// A minimal GraphQL reader: operations, fields with aliases and arguments, inline fragments, named fragments.

function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/[\s,]/.test(c) || c === "﻿") {
      i++;
    } else if (c === "#") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (source.startsWith("...", i)) {
      tokens.push({ kind: "punct", value: "..." });
      i += 3;
    } else if ("{}():$!=[]@|&".includes(c)) {
      tokens.push({ kind: "punct", value: c });
      i++;
    } else if (source.startsWith("\"\"\"", i)) {
      const end = source.indexOf("\"\"\"", i + 3);
      tokens.push({ kind: "string", value: source.slice(i + 3, end) });
      i = end + 3;
    } else if (c === "\"") {
      let j = i + 1;
      let value = "";
      while (j < source.length && source[j] !== "\"") {
        if (source[j] === "\\") {
          value += source[j + 1];
          j += 2;
        } else {
          value += source[j];
          j++;
        }
      }
      tokens.push({ kind: "string", value });
      i = j + 1;
    } else if (/[-0-9]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[0-9.eE+-]/.test(source[j])) j++;
      tokens.push({ kind: "number", value: Number(source.slice(i, j)) });
      i = j;
    } else if (/[_A-Za-z]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[_0-9A-Za-z]/.test(source[j])) j++;
      tokens.push({ kind: "name", value: source.slice(i, j) });
      i = j;
    } else {
      i++;
    }
  }
  return tokens;
}

function parseDocument(source) {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const next = () => tokens[position++];
  const isPunct = (value) => peek()?.kind === "punct" && peek().value === value;
  const expect = (value) => {
    const token = next();
    if (!token || token.value !== value) {
      throw new Error(`expected ${value}`);
    }
  };

  const parseValue = () => {
    const token = next();
    if (token.kind === "punct" && token.value === "$") {
      return { variable: next().value };
    }
    if (token.kind === "punct" && token.value === "[") {
      const list = [];
      while (!isPunct("]")) list.push(parseValue());
      expect("]");
      return list;
    }
    if (token.kind === "punct" && token.value === "{") {
      const object = {};
      while (!isPunct("}")) {
        const key = next().value;
        expect(":");
        object[key] = parseValue();
      }
      expect("}");
      return object;
    }
    if (token.kind === "name") {
      if (token.value === "true") return true;
      if (token.value === "false") return false;
      if (token.value === "null") return null;
      return token.value;
    }
    return token.value;
  };

  const parseArguments = () => {
    const args = {};
    if (isPunct("(")) {
      next();
      while (!isPunct(")")) {
        const name = next().value;
        expect(":");
        args[name] = parseValue();
      }
      expect(")");
    }
    return args;
  };

  const skipDirectives = () => {
    while (isPunct("@")) {
      next();
      next();
      parseArguments();
    }
  };

  const parseSelectionSet = () => {
    const selections = [];
    expect("{");
    while (!isPunct("}")) {
      if (isPunct("...")) {
        next();
        if (peek()?.kind === "name" && peek().value === "on") {
          next();
          const type = next().value;
          skipDirectives();
          selections.push({ inline: true, type, selections: parseSelectionSet() });
        } else if (isPunct("{") || isPunct("@")) {
          skipDirectives();
          selections.push({ inline: true, type: null, selections: parseSelectionSet() });
        } else {
          selections.push({ spread: next().value });
          skipDirectives();
        }
        continue;
      }
      let name = next().value;
      let alias = name;
      if (isPunct(":")) {
        next();
        name = next().value;
      }
      const args = parseArguments();
      skipDirectives();
      const field = { alias, name, args, selections: null };
      if (isPunct("{")) {
        field.selections = parseSelectionSet();
      }
      selections.push(field);
    }
    expect("}");
    return selections;
  };

  let operation = null;
  const fragments = {};
  while (position < tokens.length) {
    if (isPunct("{")) {
      operation = parseSelectionSet();
      continue;
    }
    const token = next();
    if (token.kind === "name" && token.value === "fragment") {
      const name = next().value;
      next(); // on
      next(); // type
      skipDirectives();
      fragments[name] = parseSelectionSet();
      continue;
    }
    if (token.kind === "name" && ["query", "mutation", "subscription"].includes(token.value)) {
      if (peek()?.kind === "name") next();
      if (isPunct("(")) {
        let depth = 0;
        do {
          const t = next();
          if (t.value === "(") depth++;
          if (t.value === ")") depth--;
        } while (depth > 0);
      }
      skipDirectives();
      operation = parseSelectionSet();
    }
  }
  return { operation: operation ?? [], fragments };
}

function resolveArgument(value, variables) {
  if (value && typeof value === "object" && "variable" in value) {
    return variables?.[value.variable];
  }
  return value;
}

function scalarFor(field, variables, login) {
  const number = resolveArgument(field.args.number, variables);
  switch (field.name) {
    case "login": return login;
    case "closed": return false;
    case "merged": return false;
    case "state": return "OPEN";
    case "number": return typeof number === "number" ? number : 1;
    case "__typename": return "Issue";
    case "totalCount": return 0;
    case "hasNextPage": return false;
    case "endCursor": return null;
    case "isPrivate": return false;
    default: return null;
  }
}

function mirror(selections, fragments, variables, login, context = {}) {
  const result = {};
  for (const selection of selections) {
    if (selection.spread) {
      Object.assign(result, mirror(fragments[selection.spread] ?? [], fragments, variables, login, context));
    } else if (selection.inline) {
      Object.assign(result, mirror(selection.selections, fragments, variables, login, context));
    } else if (selection.selections === null) {
      const number = resolveArgument(selection.args.number, variables);
      result[selection.alias] = selection.name === "number" && typeof context.number === "number"
        ? context.number
        : scalarFor(selection, variables, login);
      if (selection.name === "number" && typeof number === "number") {
        result[selection.alias] = number;
      }
    } else if (["nodes", "edges"].includes(selection.name)) {
      result[selection.alias] = [];
    } else {
      const number = resolveArgument(selection.args.number, variables);
      result[selection.alias] = mirror(
        selection.selections,
        fragments,
        variables,
        login,
        typeof number === "number" ? { number } : context,
      );
    }
  }
  return result;
}

export function mirrorQuery(query, variables, login) {
  const { operation, fragments } = parseDocument(query);
  return mirror(operation, fragments, variables, login);
}

// ---------------------------------------------------------------------------------------------------------
// Pull request nodes as contributionsCollection returns them, with every field the script might select.

export function pullRequestNode({
  owner,
  repo,
  number,
  title,
  merged = false,
  mergedBy = null,
  closed = merged,
  isPrivate = false,
  author = "alexey-pelykh",
  ownerIsUser = false,
}) {
  const url = `https://github.com/${owner}/${repo}/pull/${number}`;
  const repositoryUrl = `https://github.com/${owner}/${repo}`;
  return {
    pullRequest: {
      id: `PR_${owner}_${repo}_${number}`,
      number,
      title,
      body: "BODY-MARKDOWN-MARKER",
      bodyHTML: "<p>BODY-HTML-MARKER</p>",
      bodyText: "BODY-TEXT-MARKER",
      permalink: url,
      url,
      merged,
      mergedBy: mergedBy ? { login: mergedBy } : null,
      closed,
      state: merged ? "MERGED" : closed ? "CLOSED" : "OPEN",
      createdAt: "2026-03-04T05:06:07Z",
      updatedAt: "2026-03-06T05:06:07Z",
      mergedAt: merged ? "2026-03-05T05:06:07Z" : null,
      closedAt: closed ? "2026-03-05T05:06:07Z" : null,
      author: { login: author },
      repository: {
        id: `R_${owner}_${repo}`,
        name: repo,
        nameWithOwner: `${owner}/${repo}`,
        description: `Description of ${repo}`,
        url: repositoryUrl,
        isPrivate,
        isFork: false,
        owner: ownerIsUser
          ? { __typename: "User", login: owner, url: `https://github.com/${owner}`, name: owner }
          : {
            __typename: "Organization",
            login: owner,
            url: `https://github.com/${owner}`,
            name: `${owner} organization`,
            description: `The ${owner} organization`,
          },
      },
    },
  };
}

// Serves the given nodes once, on the first window the script asks for, 25 to a page. Answers an issue-state query with closed: true for the keys in closedIssues and closed: false for every other key.
export function contributionsServer({ login, nodes, closedIssues = new Set() }) {
  const requests = [];
  let servedWindow = null;
  const server = http.createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Problems parsing JSON" }));
        return;
      }
      requests.push(payload);
      const { query, variables = {} } = payload;
      let data;
      if (/contributionsCollection/.test(query)) {
        const windowKey = `${variables.from}|${variables.to}`;
        if (servedWindow === null) {
          servedWindow = windowKey;
        }
        const windowNodes = windowKey === servedWindow ? nodes : [];
        const offset = variables.cursor ? Number(variables.cursor) : 0;
        const page = windowNodes.slice(offset, offset + 25);
        const hasNextPage = offset + 25 < windowNodes.length;
        data = {
          viewer: {
            login,
            contributionsCollection: {
              pullRequestContributions: {
                totalCount: windowNodes.length,
                pageInfo: { hasNextPage, endCursor: hasNextPage ? String(offset + 25) : null },
                nodes: page,
              },
            },
          },
        };
      } else if (/issueOrPullRequest/.test(query)) {
        const key = `${variables.owner}/${variables.name}#${variables.number}`;
        data = { repository: { issueOrPullRequest: { closed: closedIssues.has(key) } } };
      } else {
        try {
          data = mirrorQuery(query, variables, login);
        } catch (error) {
          data = {};
        }
      }
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ data }));
    });
  });
  return { server, requests };
}

export function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve(`http://127.0.0.1:${server.address().port}/graphql`);
    });
  });
}

export function close(server) {
  return new Promise((resolve) => {
    server.closeAllConnections?.();
    server.close(() => resolve());
  });
}
