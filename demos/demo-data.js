import { family as realFamily } from './anton-family/data.js';
import { family as sampleFamily } from './sample-data.js';

const params = new URLSearchParams(window.location.search);
export const family = params.get('sample') === '1' ? sampleFamily : realFamily;
export const byId = Object.fromEntries(family.people.map(person => [person.id, person]));
