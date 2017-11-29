# HUBOT GAMES

Game library for your (hu)bot! Hangman, Blackjack, TicTacToe, 24, ...!

## INSTALL

```
npm install --save hubot-games
```

external-scripts.json:
```javascript
[
  "hubot-games"
]
```

## GAMES

- Blackjack
- 24
- Connect 4
- Hangman
- Quiz
- TicTacToe

## CMDS

- !help
- !calc {calc} - e.g. !calc 1+1(2)-3

*Games*:
- !21
- !24
- !con4
- !hang
- !quiz
- !tic

Type ```!{game} help``` for help.

## MODULES

A series of modules were also developed to improve game development.

- **session**: controls the session/instance of every game; supports multiplayer
- **stats**: takes care of all stat (W, D & L) actions
- **db**: takes care of all the database actions
- **rw**: reads & writes a unique JSON file that works as the DB

## Made with ♥ by a bunch of monkeys
