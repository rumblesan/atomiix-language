# IXI Reimplementaion

## Functionality

This is the basic functionality that will be targeted for the MVP.

### Create and run an agent

`<agentname> -> <pattern>`

Patterns can be the standard percussive, melodic or concrète modes.

Percussive (letters represent samples):
```
mydrums -> |a  bcb d|
```
Melodic (numbers represent pitch):
```
mytune -> [1  232 4]
```
Concrete (numbers represent amplitude):
```
mysound -> {1  232 4}
```

### Add and remove effects

`<agentname> >> <effectname>`

```
myagent >> reverb >> lowpass

myagent << reverb
```

### Increase and decrease amplitude

`<agentname> ))`
`<agentname> ((`

```
mytune ))
```

### Change the tempo

`tempo <newtempo>`

```
tempo 120
```

### Create a grid in the editor

`grid <gridspacing>`

```
grid 5
```
