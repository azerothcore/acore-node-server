---
permalink: /
---

# ACORE-NODE-SERVER

Acore-Node-Server is a modular nodejs application written in TS/JS that exposes GraphQL and Rest API useful to create any kind of applications based on
azerothcore database.

It can be extended and customized with new features and extra databases support.

## Getting started

### local environment

1. clone this repo
2. run `npm install`
3. copy files in /conf/dist folder under conf/ folder and configure them with your connection info
4. run `npm start`
5. Open the url showed in your console to browse the graphql playground where you can get all the documentation about the APIs

### with docker

Work in progress...

## Documentation

### Directory structure

/src

- /database -> sequelize models + seeders
- /logic -> RealmMgr, adapters, entities & APIs
- /service -> apollo, express and everything is related to the starting phase
- index.ts -> export methods and objects
- run.ts -> used by package.json script to run the service

- [JSDOC documentation](jsdoc/)

- [test coverage](coverage/lcov-report)

### How to extend and customize

Work in progress...
