# ♠️ Bookkeeper

A fast, mobile-friendly scorekeeper for in-person games of Spades.

Bookkeeper handles the calculations that are easy to lose track of during a game—including contracts, sets, overtricks, bags, Nil bids, penalties, and winning scores—so players can focus on the cards instead of doing math.

> **Live Application:** [https://bookkeeper-sand.vercel.app/](https://bookkeeper-sand.vercel.app/)

## Why I Built It

My friends and I play Spades frequently, but keeping score manually can become complicated. Each round requires players to track bids, tricks, bags, penalties, and cumulative scores, which can slow down the game and lead to mistakes.

I built Bookkeeper to provide a quick and simple way to record each round and automatically calculate the results. The goal was to create something we could open on a phone, configure around our house rules, and use throughout an entire game without needing paper, calculators, or spreadsheets.

## Features

### Automatic Spades Scoring

Bookkeeper calculates each team’s score after every round, including:

* Successful contracts
* Failed contracts, or sets
* Overtricks and accumulated bags
* Configurable bag penalties
* Successful and failed Nil bids
* Custom winning scores
* Automatic winner detection

The application also verifies that the tricks recorded for both teams total 13 before calculating the round.

### Custom Game Settings

Each game can be configured to match the players’ preferred house rules:

* Custom room or game name
* Editable team names
* Winning score
* Bag limit
* Bag penalty
* Nil bonus and penalty
* Option to enable or disable Nil bids

### Game History

Every completed round is added to the game history, including:

* Each team’s bid
* Tricks won
* Cumulative scores
* Round number

This gives players a clear record of how the game progressed.

### Saved Games

Games are automatically saved in the browser so players can leave and return later.

Players can:

* Resume unfinished games
* Review completed games
* Delete saved games
* Store up to 10 recent games

Saved games are stored locally on the device and browser where they were created.

### Built-In Spades Guide

Bookkeeper includes a quick-reference guide explaining:

* Basic gameplay
* Bidding
* Standard scoring
* Bags and penalties
* Nil and Blind Nil
* Popular deck variations
* Alternative game modes
* Common Spades terminology

## Default Scoring Rules

Bookkeeper begins with the following standard settings:

| Rule                 |    Default |
| -------------------- | ---------: |
| Winning score        | 500 points |
| Bag limit            |    10 bags |
| Bag penalty          | 100 points |
| Nil bonus or penalty | 100 points |
| Nil bidding          |    Enabled |

All of these settings can be changed before starting a game.

## Scoring Logic

For a standard bid:

* A team that meets its bid receives **10 points per trick bid**.
* Tricks won beyond the bid are counted as **1-point bags**.
* A team that fails to meet its bid loses **10 points per trick bid**.
* Once a team reaches the configured bag limit, the configured bag penalty is deducted.

For a Nil bid:

* Winning zero tricks earns the configured Nil bonus.
* Winning one or more tricks applies the configured Nil penalty.

## Technology

* **React 19** for the user interface
* **TypeScript** for type-safe application logic
* **Tailwind CSS 4** for responsive styling
* **Vite** for local development and production builds
* **Lucide React** for interface icons
* **Local Storage** for persistent game sessions

Bookkeeper is currently a client-side application and does not require an account, database, or backend service.

## Planned Improvements

* **User accounts and authentication** to securely save game history, preferences, and active games across devices and platforms.
* **Cross-device game synchronization** so players can start a game on one device and continue it elsewhere.
* **Real-time multiplayer support** allowing each player to join a shared game, submit bids, and follow scores from their own device.
* **Blind bid support**, including configurable bonuses, penalties, and house-rule variations.
* **Improved user interface and experience** with a cleaner scoreboard, faster round entry, clearer scoring feedback, and more responsive mobile controls.
* **Additional Spades rules and game modes** to support more regional variations and custom house rules.
* **Automated testing** for scoring calculations, saved-game persistence, and edge cases.
* **Progressive Web App support** for installation, offline use, and a more app-like mobile experience.
* **Game sharing and score summaries** for exporting or sharing completed results.

## Feedback

Bug reports, feature ideas, and scoring-rule suggestions can be submitted through the repository’s [Issues](https://github.com/rickeyjohnson/bookkeeper/issues) page.

## Author

**Rickey Johnson Jr.**

* [GitHub](https://github.com/rickeyjohnson)
* [LinkedIn](https://www.linkedin.com/in/rickey-johnson-jr/)
