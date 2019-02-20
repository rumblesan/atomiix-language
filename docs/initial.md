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
### Post-score arguments: multiplication/division

`<agentname> -> <pattern><multiplier>`

```
mytune -> marimba[1  232 4]*2
```
```
mytune -> marimba[1  232 4]/1.5
```
**Note: currently, multiply slows the playback speed and divide speeds it up. This is the reverse of the equivalent behaviour in Tidal - propose bringing it into line with Tidal?**


### Post-score arguments: per-note amplitude

`<agentname> -> <pattern><amplitude>`

```
mytune -> marimba[1  232 4]^1386^
```

### Post-score arguments: per-note panning

`<agentname> -> <pattern><amplitude>`

```
mytune -> marimba[1  232 4]<18>
```

### Create a group

`group <groupname> -> <agentnames>`

`group mygroup -> myagent myotheragent`

### Add and remove effects

`<agentname> >> <effectname>`

```
myagent >> reverb >> lowpass

myagent << reverb
```
`mygroup >> techno`

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

### Change the root note of the scale

Determined by midi number:
`tonic 60`

### Change the global tonality

`scale major`

### Create a grid in the editor

`grid <gridspacing>`

```
grid 5
```

###
