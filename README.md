# Atomiix

A reimplementation of IxiLang with an Atom editor frontend.


## Description

Very much a WIP.

There are currently two parts to the project :-
* A JavaScript client
* A SuperCollider quark

The client will eventually be built into the Atom editor, though will also be available as a JavaScript library so it can be embedded elsewhere.


## Installation

The expectation is that the repo will be cloned locally, so installation is assuming that.

Installing the quark should be simple enough. Just follow the instructions available in the [SuperCollider docs](doc.sccode.org/Guides/UsingQuarks.html).

The JavaScript client is currently just a command line tool, and can be used by piping text in.

```
cd js
echo "foo -> harp[1 6 33 7  ]<28>+3\nbar -> |a    b   c|" | npm run cli
```


## Contact

Drop me an email at guy@rumblesan.com


## License

BSD License.

