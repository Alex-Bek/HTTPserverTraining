// @ts-check

import http from "http";
import fs from "fs/promises";
import _ from "lodash";

let id = 1000;

const nextId = () => {
  id += 1;
  return id;
};

const validate = ({ name, phone }) => {
  const result = [];
  // BEGIN (write your solution here)
  if (name.length === 0) {
    result.push({
      source: "name",
      title: "can't be blank",
    });
  } else if (!/^[\w.]+$/.test(name)) {
    result.push({
      source: "name",
      title: "bad format",
    });
  }
  if (phone.length === 0) {
    result.push({
      source: "phone",
      title: "can't be blank",
    });
  }
  return result;
  // END
};

const getParams = (address, host) => {
  const url = new URL(address, `http://${host}`);
  return Object.fromEntries(url.searchParams);
};

const router = {
  GET: {
    "/": (req, res, matches, body, usersById) => {
      const messages = [
        "Welcome to The Phonebook",
        `Records count: ${Object.keys(usersById).length}`,
      ];
      res.end(messages.join("\n"));
    },

    "/search.json": (req, res, matches, body, usersById) => {
      res.setHeader("Content-Type", "application/json");

      const { q = "" } = getParams(req.url, req.headers.host);
      const normalizedSearch = q.trim().toLowerCase();
      const ids = Object.keys(usersById);

      const usersSubset = ids
        .filter((id) =>
          usersById[id].name.toLowerCase().includes(normalizedSearch)
        )
        .map((id) => usersById[id]);
      res.end(JSON.stringify({ data: usersSubset }));
    },

    "/users.json": (req, res, matches, body, usersById) => {
      res.setHeader("Content-Type", "application/json");

      const { page = 1, perPage = 10 } = getParams(req.url, req.headers.host);
      const ids = Object.keys(usersById);

      const usersSubset = ids
        .slice(page * perPage - perPage, page * perPage)
        .map((id) => usersById[id]);
      const totalPages = Math.ceil(ids.length / perPage);
      res.end(
        JSON.stringify({
          meta: { page, perPage, totalPages },
          data: usersSubset,
        })
      );
    },

    "/users/(\\w+).json": (req, res, matches, body, usersById) => {
      const id = matches[1];
      res.setHeader("Content-Type", "application/json");
      const user = usersById[id];
      if (!user) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.end(JSON.stringify({ data: user }));
    },
  },
  POST: {
    "/users.json": (req, res, matches, body, usersById) => {
      const newId = nextId();
      const newData = JSON.parse(body);
      const inputErrArr = validate(newData);
      if (inputErrArr.length !== 0) {
        res.writeHead(422);
        res.end(
          JSON.stringify({
            errors: inputErrArr,
          })
        );
      } else {
        usersById[newId] = newData;
        res.writeHead(201);
        const splitAdress = matches[0].split(".");
        const newLoc = splitAdress[0] + `/${newId}` + "." + splitAdress[1];
        res.end(
          JSON.stringify({
            meta: { location: newLoc },
            data: {
              name: usersById[newId].name,
              phone: usersById[newId].phone,
              id: newId,
            },
          })
        );
      }
    },
  },
};

const makeServer = (users) =>
  http.createServer((request, response) => {
    const body = [];

    request
      .on("data", (chunk) => body.push(chunk.toString()))
      .on("end", () => {
        const { pathname } = new URL(
          request.url,
          `http://${request.headers.host}`
        );
        const routes = router[request.method];

        const result =
          pathname &&
          Object.keys(routes).find((str) => {
            const regexp = new RegExp(`^${str}$`);
            const matches = pathname.match(regexp);
            if (!matches) {
              return false;
            }

            routes[str](request, response, matches, body, users);
            return true;
          });

        if (!result) {
          response.writeHead(404);
          response.end();
        }
      });
  });

const startServer = async (port, callback = () => {}) => {
  const data = await fs.readFile("phonebook.txt");
  const users = data
    .toString()
    .trim()
    .split("\n")
    .map((value) => value.split("|").map((item) => item.trim()));
  const usersIds = users.map(([id]) => id);
  const usersData = users.map(([, name, phone]) => ({ name, phone }));
  const usersById = _.zipObject(usersIds, usersData);

  const server = makeServer(usersById);
  server.listen(port, callback.bind(null, server));
};

startServer(80, () => {
  console.log("started server");
});
