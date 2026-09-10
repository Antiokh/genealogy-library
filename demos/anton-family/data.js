import { people1 } from './people-1.js';
import { people2 } from './people-2.js';
import { people3 } from './people-3.js';
import { people4 } from './people-4.js';
import { people5 } from './people-5.js';
import { people6 } from './people-6.js';
import { families1 } from './families-1.js';

export const family = {
  source: 'MyHeritage snapshot 2023-11-25',
  root: 'I500001',
  people: [...people1, ...people2, ...people3, ...people4, ...people5, ...people6],
  families: [...families1]
};

export const byId = Object.fromEntries(family.people.map(person => [person.id, person]));
