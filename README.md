# Atomiix

A reimplementation of IxiLang with an Atom editor frontend.


## Description

Very much a WIP.

There are currently three parts to the project :-
* A JavaScript language client
* A SuperCollider quark
* An Atom editor plugin

The language client is responsible for taking text, parsing it, and then converting that into OSC messages to send to the SuperCollider backend.
SuperCollider is responsible for all the sound generation and the state management for that.
The Atom plugin allows actually interacting with the language by letting the user decide what text is evaluated.


## Installation

The expectation is that the repo will be cloned locally, so installation is assuming that.

Installing the quark should be simple enough. Just follow the instructions available in the [SuperCollider docs](doc.sccode.org/Guides/UsingQuarks.html).

The JavaScript client is available as a command line tool, and can be used by piping text in.

```
cd js
echo "foo -> harp[1 6 33 7  ]<28>+3\nbar -> |a    b   c|" | npm run cli
```


## Contact

Drop me an email at guy@rumblesan.com


## License

BSD License.

