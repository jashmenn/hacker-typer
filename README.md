# hacker-typist for Atom

Write code automatically in Atom. Inspired by http://hackertyper.com/

When enabled, it starts a server which listens for code input. It comes with a tool to set the code that will be typed.

## How to use:

1. Open a file in Atom.
2. Press ctrl + alt + s to start.
3. In a new tab, run: `node ~/.atom/packages/hacker-typist/bin/ht-set-code.js <path-to-file>` or use stdin `pbpaste | node ~/.atom/packages/hacker-typist/bin/ht-set-code.js`
4. Return to new file, type like a child
5. Press ctrl + alt + e to end

## Contributors

Forked from zamarrowski's [hacker-typer](https://github.com/zamarrowski/hacker-typer)

Written by Nate Murray
