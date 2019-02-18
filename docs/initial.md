# IXI Reimplementaion

## Functionality

This is the basic functionality that will be targeted for the MVP.

### Create and run an agent

`<agentname> -> <pattern>`

Patterns can be the standard percussive, melodic or concrète modes.

```
mytune -> |a  bcb d|
```

### Add and remove effects

`<agentname> >> <effectname>`

```
myagent >> reverb >> lopass

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

