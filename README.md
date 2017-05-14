# hacker-typist for Atom

Write code automatically in Atom. Inspired by http://hackertyper.com/

It works by "pasting" the code you want from your clipboard and then that code is written out, no matter what keys you type*.

It inserts code character by character into atom and so all of your existing plugins will run such as autopair.

## How to use:

1. Open a file in Atom.
2. Copy some code to your clipboard
3. Press ctrl + alt + p to _paste the code into Hacker Typist_.
4. Type like a child
5. Hit `esc` when you're finished

## Client / Server (experimental)

This package also comes with an experimental client/server to send code to Hacker Typist. To use it

1. Press ctrl + alt + s to start a TCP server that lisens for code
2. In a new tab, run: `node ~/.atom/packages/hacker-typist/bin/ht-set-code.js <path-to-file>` or use stdin `pbpaste | node ~/.atom/packages/hacker-typist/bin/ht-set-code.js`
3. Return to new file, type like a child
4. Press `esc` to end and close the server

## Developing

```
git clone <repo>
cd hacker-typist
npm install
apm link
```

## Contributors

Forked from zamarrowski's [hacker-typer](https://github.com/zamarrowski/hacker-typer)

Written by Nate Murray
