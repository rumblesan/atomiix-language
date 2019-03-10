# OSC Communications

The messages that javascript will send to SuperCollider.

## Play Patterns

### Percussive

address
* /play/pattern

arguments
* patternType: string
* agentName: string
* notes: [integer]
* durations: [integer]
* instruments: [string]
* sustain: [integer]
* attack: [integer]
* panning: [float]
* offset: integer
* repeats: integer or inf

### Melodic

address
* /play/pattern

arguments
* patternType: string
* agentName: string
* notes: [integer]
* durations: [integer]
* instrument: string
* sustain: [integer]
* attack: [integer]
* panning: [float]
* offset: integer
* repeats: integer or inf

### Concrete

address
* /play/pattern

arguments
* patternType: string
* agentName: string
* pitch: integer
* amplitudes: [integer]
* durations: [integer]
* instrument: string
* panning: [float]
* offset: integer
* repeats: integer or inf

## Freeing Agents

address
* /free

arguments
* agentName: string

## Changing Agent Amplitude

address
* /agent/amplitude

arguments
* agentName: string
* change: float

## Adding Agent Effects

address
* /agent/effects/add

arguments
* agentName: string
* effects: [string] 

## Removing Agent Effects

address
* /agent/effects/remove

arguments
* agentName: string
* effects: [string] 

If effects is an empty array then all effects are removed

