export const PERSON_CARD_WIDTH = 184;
export const PERSON_CARD_HEIGHT = 72;

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const initials = name => String(name || '?')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map(part => part[0])
  .slice(0, 2)
  .join('') || '?';

const normalizeSex = value => {
  const sex = String(value || '').toUpperCase();
  if (sex === 'M' || sex === 'MALE') return 'male';
  if (sex === 'F' || sex === 'FEMALE') return 'female';
  return 'unknown';
};

export class GenealogyPersonCard extends HTMLElement {
  static get observedAttributes() {
    return ['person-id', 'name', 'years', 'sex', 'deceased', 'photo'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  render() {
    const name = this.getAttribute('name') || 'Unknown person';
    const years = this.getAttribute('years') || '';
    const personId = this.getAttribute('person-id') || '';
    const sex = normalizeSex(this.getAttribute('sex'));
    const deceased = this.hasAttribute('deceased');
    const photo = this.getAttribute('photo') || '';

    const avatarContent = photo
      ? `<img class="avatar-photo" src="${esc(photo)}" alt="">`
      : `<span class="avatar-initials">${esc(initials(name))}</span>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${PERSON_CARD_WIDTH}px;
          height: ${PERSON_CARD_HEIGHT}px;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #25231f;
        }
        * { box-sizing: border-box; }
        .card {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr);
          gap: 11px;
          align-items: center;
          padding: 11px 12px;
          border-radius: 14px;
          border: 1px solid rgba(49,45,39,.13);
          background: rgba(255,255,255,.98);
          box-shadow: 0 2px 8px rgba(48,42,34,.07);
          text-align: left;
        }
        .avatar {
          --avatar-accent: #aaa49b;
          position: relative;
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
          border: 2px solid var(--avatar-accent);
          background: #eeebe4;
          color: #59534a;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .02em;
          user-select: none;
        }
        .avatar.male { --avatar-accent: #7899ad; }
        .avatar.female { --avatar-accent: #c48691; }
        .avatar.unknown { --avatar-accent: #aaa49b; }
        .avatar-photo {
          width: 36px;
          height: 36px;
          display: block;
          border-radius: 50%;
          object-fit: cover;
        }
        .avatar.deceased .avatar-photo {
          filter: grayscale(1);
        }
        .avatar.deceased .avatar-initials {
          filter: grayscale(1);
          opacity: .72;
        }
        .avatar.deceased::after {
          content: '';
          position: absolute;
          z-index: 2;
          right: -7px;
          bottom: 5px;
          width: 30px;
          height: 5px;
          background: rgba(10,10,10,.96);
          transform: rotate(-42deg);
          transform-origin: center;
          pointer-events: none;
        }
        .text { min-width: 0; }
        .name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 650;
          color: #26231f;
        }
        .years {
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          color: #827b71;
        }
      </style>
      <article class="card" data-person-id="${esc(personId)}">
        <div class="avatar ${sex}${deceased ? ' deceased' : ''}" aria-hidden="true">
          ${avatarContent}
        </div>
        <div class="text">
          <div class="name">${esc(name)}</div>
          <div class="years">${esc(years)}</div>
        </div>
      </article>`;
  }
}

if (!customElements.get('genealogy-person-card')) {
  customElements.define('genealogy-person-card', GenealogyPersonCard);
}

export function personCardElementHtml(person) {
  const deceasedAttribute = person.deceased ? '\n    deceased' : '';
  const photoAttribute = person.photo ? `\n    photo="${esc(person.photo)}"` : '';

  return `<genealogy-person-card
    style="display:block;width:${PERSON_CARD_WIDTH}px;height:${PERSON_CARD_HEIGHT}px"
    person-id="${esc(person.id || '')}"
    name="${esc(person.name || 'Unknown person')}"
    years="${esc(person.years || '')}"
    sex="${esc(person.sex || '')}"${deceasedAttribute}${photoAttribute}
  ></genealogy-person-card>`;
}
