# IXI Reimplementaion

## Functionality

This is the basic functionality that will be targeted for the MVP.

### Create and run an agent

Percussive

`<agentname> -> <pattern>`

Melodic/concrete

`<agentname> -> <samplename><pattern>`

Patterns can be the standard percussive, melodic or concrète modes.

Percussive (letters represent samples):
```
mydrums -> |a  bcb d|
```
Melodic (numbers represent pitch):
```
mytune -> marimba[1  232 4]
```
Concrete (numbers represent amplitude):
```
mysound -> waves{1  232 4}
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
Number of seconds to change tempo is dictated by number after the tempo number:

```
tempo 120:4
```

### Create a grid in the editor

`grid <gridspacing>`

```
grid 5
```

###
