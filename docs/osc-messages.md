# OSC Communications

## Outbound

The messages that JavaScript will send to SuperCollider.

### Play Patterns

#### Percussive

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

#### Melodic

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

#### Concrete

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

### Agent Commands

This currently covers freeing agents, as well as dozing and waking them.

address
* /command

arguments
* command: string
* agentName: string

### Changing Tempo

The syncTime is optional, and if not included then the tempo will be changed immediately.

address
* /tempo

arguments
* newTempo: float
* syncTime: float

### Changing Agent Amplitude

address
* /agent/amplitude

arguments
* agentName: string
* value: float

### Adding Agent Effects

address
* /agent/effects/add

arguments
* agentName: string
* effects: [string]

### Removing Agent Effects

If effects is an empty array then all effects are removed

address
* /agent/effects/remove

arguments
* agentName: string
* effects: [string]

### Registering Callbacks

Because SuperCollider is responsible for all timing, callbacks work by sending an OSC message to register, and then waiting for the return OSC message from SuperCollider.

address
* /callback

arguments
* time: float
* timeType: string   -   should be either \seconds or \beats
* repeats: integer
* callbackID: string

### Querying

Query SuperCollider for information about available instruments or effects.

address
* /query

arguments
* category: string


## Inbound

The messages that SuperCollider will send to JavaScript.

### Agent Finished

Sent when an agent finishes the number of repeats

address
* /finished

arguments
* agentName: string

### Callback Fired

Sent when a callbacks time is up. Can be sent multiple times for a callback with repeats.

address
* /callback

arguments
* callbackID: string
* remaining: integer

### Queried Information

Sent when the editor has queried for information.

address
* /query/response

arguments
* info: [string]
