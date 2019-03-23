// Every scale starts with an extra 0
// because notes are indexed from 1
export default {
  names: {
    major: 'major',
    minor: 'minor',
    melodicMinor: 'melMi',
    harmonicMinor: 'harMi',
    diminished: 'dimin',
    wholeTone: 'whlTn',
    blues: 'blues',
    minorPentatonic: 'minPn',
    majorPentatonic: 'majPn',
    hungarianMinor: 'hngMi',
    persian: 'persn',
    hirojoshi: 'hiroj',
    arabian: 'arabn',
  },
  notes: {
    major: [0, 0, 2, 4, 5, 7, 9, 11, 12, 14],
    minor: [0, 0, 2, 3, 5, 7, 8, 10, 12, 14],
    melMi: [0, 0, 2, 3, 5, 7, 9, 11, 13, 14],
    harMi: [0, 0, 2, 3, 5, 7, 8, 11, 12, 14],
    dimin: [0, 0, 2, 3, 5, 6, 8, 9, 11, 12],
    whlTn: [0, 0, 2, 4, 6, 8, 10, 12, 14, 16],
    blues: [0, 0, 3, 5, 6, 7, 10, 12, 15, 17],
    minPn: [0, 0, 3, 5, 7, 10, 12, 15, 17, 19],
    majPn: [0, 0, 2, 4, 7, 9, 12, 14, 16, 19],
    hngMi: [0, 0, 2, 3, 6, 7, 8, 11, 12, 14],
    persn: [0, 0, 1, 4, 5, 6, 8, 11, 12, 13],
    hiroj: [0, 0, 2, 3, 7, 8, 12, 14, 15, 19],
    arabn: [0, 0, 2, 4, 5, 6, 8, 10, 12, 14],
  },
};
