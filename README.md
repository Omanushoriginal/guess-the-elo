# Guess The Elo

A browser chess-rating guessing game, hosted on GitHub Pages.

## Game modes

- **Singleplayer:** Guess the average of both players’ ratings. Earn 7 points for an exact guess or 3 points within 100 Elo. Play a five-round challenge without a timer.
- **Multiplayer:** Guess White and Black separately. Each guess scores 7 points within 10 Elo, 5 within 25, and 3 within 100. Multiplayer includes configurable instant-victory rules and 2–5 player matches.
- **Pass & Play:** Take turns on one device.
- **Online rooms:** Create a room, share its six-character code, and have friends join from their own devices. The host starts the match after everyone joins.

Online rooms use PeerJS for signaling and WebRTC for peer-to-peer game updates. Players need an internet connection. Some networks block direct peer connections; this static GitHub Pages setup does not include a TURN relay.

## Development

```sh
npm ci
npm run dev
npm run build
```

GitHub Actions builds the app and deploys the `dist` folder to GitHub Pages when changes are pushed to `main`.
