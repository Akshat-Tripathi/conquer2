# Conquer2

The thrilling sequel to [Conquer](https://github.com/Akshat-Tripathi/Conquer), it'll blast you away!

---
## Motivation
This project exists for 2 main reasons:
1. Many players wanted to see new features in the game
2. The Conquer codebase wasn't designed with future maintenance and upgrades in mind.

---
## New Features
Players can now:
- Create their own games
- Use custom username
- Play different game modes

UI updates:
- Smart action selection
- New game map, with the possibility of several independent game maps
- Player box with all players and their colours

---
## Upcoming Features
Coming soon:
- A leaderboard
- Accounts
- Different game maps
- Updated attack rng

---
## Code changes 
### Backend
- Requests are processed concurrently
    - In Conquer, thread-safety was achieved by using a single channel to store each request, with a single workeer processing them
   - Now each country and player has a mutex, so several goroutines can access the critical section concurrently
- Clear separation of concerns has been achieved
  - Conquer was a mess when it came to this, since the main processing function was called validateAction, which *should* have only validated actions
  - Now the backend is split into several different packages and structs, each with its own concern and purpose, making it easy to add functionality, e.g. adding new game modes
- Can no longer log in from multiple devices concurrently
  - This was a rarely used feature in Conquer, which also made it less apparent when someone hijacked your game code
  - This has been scrapped in Conquer2 which also reduces the memory used by the ```sockets``` package
- Transitioned to [```gin```](https://github.com/gin-gonic/gin) rather than using the standard library's ```net/http``` package

### Frontend
- Using [ReactJs](https://reactjs.org/) rather than vanilla JavaScript
- Uses [```react-simple-maps```](www.react-simple-maps.io/) instead of custom svgs

---
## Contributing Guidelines
### Creating new game modes
If you've decidied to contribute, you probably want to make a new game mode. Well you're in luck, because this subsection deals with exactly that!

Game logic has been separated into 2 separate packages; [```game```]("https://github.com/Akshat-Tripathi/conquer2/tree/master/internal/game") and [```stateProcessors```]("https://github.com/Akshat-Tripathi/conquer2/tree/master/internal/game/stateProcessors"). [```stateProcessors```]("https://github.com/Akshat-Tripathi/conquer2/tree/master/internal/game/stateProcessors") handles the "global" game logic i.e. handling attacks, moves, deploys etc, whereas [```game```]("https://github.com/Akshat-Tripathi/conquer2/tree/master/internal/game") combines all the individual parts of a game.

#### StateProcessors
There are already 2 different stateProcessors in the package: [```defaultProcessor```](https://github.com/Akshat-Tripathi/conquer2/blob/master/internal/game/stateProcessors/defaultProcessor.go) and [```capitalProcessor```](https://github.com/Akshat-Tripathi/conquer2/blob/master/internal/game/stateProcessors/capitalProcessor.go). The defaultProcessor was built as a base for all further stateProcessors, so it's a good idea to compose it into any new processors *read: if you want your PR to be accepted, do this*. Create a new stateProcessor if you want to fundamentally change how some part of the game works, for example capitalProcessor changes which players can access which countries, and changes the win condition.

#### Game
There are 3 different games implemented here: [```defaultGame```](https://github.com/Akshat-Tripathi/conquer2/blob/master/internal/game/defaultGame.go), [```capitalGame```](https://github.com/Akshat-Tripathi/conquer2/blob/master/internal/game/capitalGame.go) and [```campaignGame```](https://github.com/Akshat-Tripathi/conquer2/blob/master/internal/game/campaignGame.go). Again the defaultGame serves as a base for all other game modes. Another thing to note here is that for every stateProcessor you make, you'll need to make a corresponding game struct, for players to be able to play the new mode. If your game mode needs to communicate differently, or has a different troop update timing rule, this is the place for you.

Be sure to check out the [docs]() for explanations on how each package works 
See [contributing.md]() for more details