# Untitled Tile Game

I have played the board game Azul with some friends between study sessions, and I would like to be able to play it at other times too, especially when we're all at home.

This project aims to implement the entire game, including a lobby system, in a visually interesting way
on a stack of Vue for the frontend, express and express-ws for the backend, using WebSockets for pushing real-time updates to the clients.
The game state is stored in a "in-memory database" (read: a key-value dictionary) on the express server, and the communication protocol is stored in a sym-linked common directory (sorry Windows users).

## Game premise

In case you haven't played it, or couldn't find the manual somewhere online, Azul is a game where you take turns collecting tiles in an attempt to make a larger mosaic than the other players.

On your turn, you pick a color from either one of the 5-9 plates or the middle of the board.
You then place the tiles of that color in one of 5 rows on your board, moving the rest to the middle if you picked from a plate.

If the tiles do not entirely fit the row, the rest are "dropped", meaning they count as negative points.
These are placed in the designated area below the rows.

If you are the first player in the current round to pick from the middle, you also get the first player token, indicating that you go first in the next round.
It is automatically dropped when picked up, counting as negative points.

## Features

- Game lobby system, with sharable links
- ~~Fully functioning~~ game with automations and hints as to what moves will do
- Colorblind mode, where each tile has a letter indicating color

## Upcoming features

I'm working on these things right now. Nothing can stop my progress!

- Consequence hint for taking pieces from plates -- how does middle look after picking pieces?
- The ability to calculate scores
- The ability to end a round
- The ability to start a new round
- The ability to end the game, possibly with a victory screen
- Confirmation button for moves? Depends on feedback
- Better definitions of the rules in this very readme
- Animations for moving tiles around
- Cache cleanup for "in-memory database" to reduce rampant memory leaks
- Possibly ingame chat? Mostly just to say that I have implemented a real-time chat client before
- Maybe a cool tutorial which is a kind of overlay on the actual playfield, always wanted to try that
- Convert to a better abstraction for text, maybe allowing for i18n?

## Development

In one shell, open this repository, navigate to `server/` and run `yarn dev`:

```sh
cd server
yarn dev
```

In another shell, navigate to `client` and run `yarn dev` there:

```sh
cd client
yarn dev
```

Deployment involves building each project via their respective `yarn build` commands

