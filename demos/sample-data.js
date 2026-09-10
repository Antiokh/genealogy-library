export const family = {
  people: [
    { id: 'P1', name: 'Alex Morgan', years: '1948–2019', sex: 'M' },
    { id: 'P2', name: 'Elena Morgan', years: '1950–', sex: 'F' },
    { id: 'P3', name: 'Daniel Morgan', years: '1973–', sex: 'M' },
    { id: 'P4', name: 'Sofia Reed', years: '1975–', sex: 'F' },
    { id: 'P5', name: 'Marta Bell', years: '1978–', sex: 'F' },
    { id: 'P6', name: 'Nina Morgan', years: '2001–', sex: 'F' },
    { id: 'P7', name: 'Leo Morgan', years: '2004–', sex: 'M' },
    { id: 'P8', name: 'Eva Morgan', years: '2012–', sex: 'F' },
    { id: 'P9', name: 'Owen Reed', years: '1949–2020', sex: 'M' },
    { id: 'P10', name: 'Clara Reed', years: '1952–', sex: 'F' },
    { id: 'P11', name: 'Mark Bell', years: '1951–', sex: 'M' },
    { id: 'P12', name: 'Irene Bell', years: '1954–', sex: 'F' },
    { id: 'P13', name: 'Mia Morgan', years: '2027–', sex: 'F' }
  ],
  families: [
    { id: 'F1', partners: ['P1', 'P2'], children: ['P3'] },
    { id: 'F2', partners: ['P9', 'P10'], children: ['P4'] },
    { id: 'F3', partners: ['P11', 'P12'], children: ['P5'] },
    { id: 'F4', partners: ['P3', 'P4'], children: ['P6', 'P7'], label: '1998–2010' },
    { id: 'F5', partners: ['P3', 'P5'], children: ['P8'], label: '2011–' },
    { id: 'F6', partners: ['P7'], children: ['P13'] }
  ]
}

export const byId = Object.fromEntries(family.people.map(person => [person.id, person]))
