# Post-score Modifiers

The modifiers that can be specified after the score are :-

* timestretch
* transposition
* silences
* repeats
* sustain
* attack
* pan

TODO: work out what all of these do
TODO: work out if all of these accept floats

## Timestretch

Either `*` or `/` followed by a number.

```
foo -> |abcd|*2
bar -> |efgh|/3.5
```

## Transposition

Either `+` or `-` followed by a number.

```
foo -> |abcd|+2
bar -> |efgh|-3.5
```

## Silences

A `!` followed by an integer.

```
foo -> |abcd|!2
```

## Repeats

A `@` followed by an integer.

```
foo -> |abcd|@4
```

## Sustain

A number surrounded by `(` and `)`.

```
foo -> |abcd|(59)
```

If nothing is specified then a value of 4 is used.

TODO: work out what's going on with `_` and `~`

## Attack

A number surrounded by `^` and `^`.

```
foo -> |abcd|^59^
```

These will be divided by 9 to a make list of values between 0 and 1.
If nothing is specified then a value of 5 is used.

## Pan

A number surrounded by `<` and `>`.

```
foo -> |abcd|<59>
```

These will be run through a function to give values between -1.0 and 1.0.
If nothing is specified then a value of 5 is used.

