# <p align="center"><img alt="TOSIOS" src="images/title.png" /></p>

## Hathora Cloud Integration

This project is a fork of the popular Colyseus project [TOSIOS](https://github.com/halftheopposite/TOSIOS) by halftheopposite. It serves as a demonstration for integrating a serverless hosting offerring (in this case, [Hathora Cloud](https://hathora.dev/docs)) with the Colyseus multiplayer framework.

You can view the integration code diff [here](https://github.com/hathora/TOSIOS-hathora/commit/8997ee00ae535bcef1eb0c4186602b78e958e744). The key difference is that in the Hathora Cloud version, server instances are created and destroyed on demand rather than having a fixed set of server instances running 24/7. There are three main benefits with this approach:
1. Scale: every time a player creates a room, a new server instance is dynamically provisioned in Hathora Cloud (it takes ~5s for a server instance to boot). Each server instance has a unique host+port for connecting. This ensures that even if many thousands of rooms are requested by players at the same time, you'll never run out of server capacity.
2. Cost: the serverless model means that you only pay for the resources you use. Instead of paying for the server 24/7, you only pay for the duration of active game sessions.
3. Performance: Rather than running your servers in a single region, the server placement is automatically chosen to be the closest [Hathora region](https://hathora.dev/docs/faq/scale-globally) to the player who creates the room. This lets you deliver a good gameplay experience to players around the world.

You can try out a live deployment of this project at https://tosios-hathora.surge.sh.

**Desktop version**

![banner](images/banner.jpg "In-game screenshot of desktop")

**Mobile version**

<img src="images/mobile.jpg" alt="In-game screenshot of mobile" width="400"/>

## 🕹️ Playing

Want to play right away? You can play the game by following (and sharing) this link https://tosios.online/ (or https://tosios-demo.herokuapp.com/).

**Rules**

The game principles are fairly easy to grasp:

1. Every player is positionned randomly on the map during the `lobby`.
2. When the `game` starts, each player must take down others (either in death match, or team death match).
3. There are some `potions` on the map that restore health.
4. The last player (or team) alive wins 🎉.

You can see a very small amount of gameplay below (the framerate of this GIF is low):

![banner](images/game.gif "An in-game animation")

**Movements**

- Move: <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd>.
- Aim: <kbd>Mouse</kbd>
- Shoot: <kbd>Left click</kbd> or <kbd>Space</kbd>
