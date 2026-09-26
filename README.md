# Guess The Elo

A browser chess-rating guessing game, hosted on GitHub Pages.

## Game modes

- **Singleplayer:** Guess the average of both players’ ratings. Earn 7 points for an exact guess or 3 points within 100 Elo. Play a five-round challenge without a timer.
- **Multiplayer:** Guess White and Black separately. Each guess scores 7 points within 10 Elo, 5 within 25, and 3 within 100. Multiplayer includes configurable instant-victory rules and 2–5 player matches.
- **Pass & Play:** Take turns on one device.
- **Private online rooms:** Create a code-only room and share its six-character code with friends.
- **Public online rooms:** Create a listed room that appears in the public room browser. Players can join from the listing; the host starts after everyone joins.

Online rooms use PeerJS for signaling and WebRTC for peer-to-peer game updates. Players need an internet connection. Some networks block direct peer connections; this static GitHub Pages setup does not include a TURN relay.

### Enable the public room directory

Public room discovery uses Firebase Realtime Database. Private rooms still work with PeerJS when Firebase is not configured.

1. Create a Firebase project and register a Web app. The current project's web config is in `src/services/onlineRooms.ts`; replace that object if you use a different Firebase project.
2. In Firebase Authentication, enable **Anonymous** sign-in.
3. Create a Realtime Database and publish the rules from [`database.rules.json`](database.rules.json).
4. The GitHub Pages workflow uses the config in the source by default. To override it without a code change, add a repository variable named `VITE_FIREBASE_CONFIG` under **Settings → Secrets and variables → Actions → Variables**, with the Web app config JSON as one line.
5. Rerun the **Deploy to GitHub Pages** workflow after applying the rules or changing the config.

For local development, you can also put an override on one line in `.env.local` as `VITE_FIREBASE_CONFIG={...}`. Firebase web config is public client configuration; the Realtime Database security rules enforce that each anonymous user can only create, update, or remove their own room listing. Listings are removed when the host leaves and stale listings are hidden after 90 seconds without a heartbeat.

## Development

```sh
npm ci
npm run dev
npm run build
```

GitHub Actions builds the app and deploys the `dist` folder to GitHub Pages when changes are pushed to `main`.
