![](./examples/banner.png)

# Game of Life WebGL

![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/feydor/game-of-life?include_prereleases)
![GitHub last commit](https://img.shields.io/github/last-commit/feydor/game-of-life)
![GitHub issues](https://img.shields.io/github/issues-raw/feydor/game-of-life)
![GitHub stars](https://img.shields.io/github/stars/feydor/game-of-life)
![GitHub](https://img.shields.io/github/license/feydor/game-of-life)
![Github StandardJS](https://img.shields.io/badge/code_style-standard-brightgreen.svg)

A React.js web app to interact with a WebGL(three.js) implementation of Conway's Game of Life.

# Table of contents

- [Live Version](#liveversion)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development](#development)
  - [Codebase](#codebase)
    - [Technologies](#technologies)
    - [Folder Structure](#folder-structure)
  - [Design Overview](#design-overview)
- [License](#license)

# Live Version
[(Back to top)](#table-of-contents)

![Heroku](https://heroku-badges.herokuapp.com/?app=#&root=index.html)
[Go to live version.](#)

# Screenshots
[(Back to top)](#table-of-contents)

![](./examples/main.png)
![](./examples/function.png)

# Installation
[(Back to top)](#table-of-contents)

Clone this repository, navigate into the project folder, and build the dependencies by executing:

```sh
git clone https://github.com/feydor/game-of-life.git
cd game-of-life
npm install
```

After installing the dependencies, start the development server by executing:

```sh
npm start
```

By default a development server will start at ``http://localhost:3001``. 

# Development
[(Back to top)](#table-of-contents)

## Codebase

### Technologies

Technologies used in this mono repo include:

- React.Js: front-end framework
- Three.js: WebGL library
- ExpressJS: RESTful api
- MongoDB: NoSQL database
- React-Bootstrap: CSS and HTML framework
- create-react-app: Web application bundler and setup
- Prettier: JS code style formatter
- Jest: Testing framework

### Folder Structure

```sh
nummifier/
├── client     # Front-end React.js app
│   ├── build               # Static build, served by server.js
│   ├── public              # HTML, favicons, etc
│   └── src                 # React components, containers, tests, numerological methods
│       ├── algorithims     # Gematria, Tic-Xenotation, digital reduction
│       ├── components      # Function components
│       ├── images          # gifs, resources
│       └── containers      # Stateful class container and entrypoint
├── db         # Database seeding functions
├── examples   # Screenshots and assorted images
├── models     # MongoDB schemas, models, and pre-hooks
└── server.js  # Back-end Express.js app
```

## Design Overview
[(Back to top)](#table-of-contents)

## Psuedocode

### Conway's Game of Life
The following is main algorithm for calculating the next game state:
```
```

# License
[(Back to top)](#table-of-contents)

MIT, see the [LICENSE](./LICENSE) file.
