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

