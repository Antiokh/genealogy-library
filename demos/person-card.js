export const PERSON_CARD_WIDTH = 240;
export const PERSON_CARD_HEIGHT = 120;

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

const nameSizeClass = name => {
  const length = String(name || '').trim().length;
  if (length > 52) return ' name-xlong';
  if (length > 34) return ' name-long';
  return '';
};

const shouldShowBirthSurname = (name, birthSurname) => {
  const surname = String(birthSurname || '').trim();
  if (!surname) return false;
  const displayName = String(name || '').trim().toLocaleLowerCase();
  return !displayName.endsWith(surname.toLocaleLowerCase());
};

export class GenealogyPersonCard extends HTMLElement {
  static get observedAttributes() {
    return ['person-id', 'name', 'years', 'sex', 'deceased', 'photo', 'birth-surname'];
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
    const birthSurname = this.getAttribute('birth-surname') || '';
    const showBirthSurname = shouldShowBirthSurname(name, birthSurname);

    // Initials are always rendered underneath the optional photo. This makes
    // expired/private/temporarily unavailable media URLs degrade cleanly
    // without ever exposing a browser broken-image icon.
    const avatarContent = `
      <span class="avatar-initials">${esc(initials(name))}</span>
      ${photo ? `<img class="avatar-photo" src="${esc(photo)}" alt="" draggable="false">` : ''}`;

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
          grid-template-columns: 48px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(49,45,39,.13);
          background: rgba(255,255,255,.98);
          box-shadow: 0 2px 8px rgba(48,42,34,.07);
          text-align: left;
        }
        .avatar {
          --avatar-accent: #aaa49b;
          position: relative;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 50%;
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
        .avatar-initials {
          position: relative;
          z-index: 1;
        }
        .avatar-photo {
          position: absolute;
          z-index: 2;
          inset: 1px;
          width: 46px;
          height: 46px;
          display: block;
          border-radius: 50%;
          object-fit: cover;
          opacity: 0;
          transition: opacity .12s ease-out;
          user-select: none;
          -webkit-user-drag: none;
        }
        .avatar-photo.loaded { opacity: 1; }
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
          z-index: 3;
          right: -8px;
          bottom: 9px;
          width: 41px;
          height: 5px;
          background: rgba(10,10,10,.96);
          transform: rotate(-42deg);
          transform-origin: center;
          pointer-events: none;
        }
        .avatar::before {
          content: '';
          position: absolute;
          z-index: 4;
          inset: 0;
          border: 2px solid var(--avatar-accent);
          border-radius: 50%;
          pointer-events: none;
        }
        .avatar-shield {
          position: absolute;
          z-index: 5;
          inset: 0;
          border-radius: 50%;
          background: transparent;
          user-select: none;
          -webkit-user-select: none;
        }
        .text {
          min-width: 0;
          align-self: center;
        }
        .name {
          font-size: 14px;
          line-height: 1.18;
          font-weight: 650;
          color: #26231f;
          white-space: normal;
          overflow: visible;
          overflow-wrap: anywhere;
          word-break: normal;
          hyphens: auto;
        }
        .name-long { font-size: 13px; line-height: 1.16; }
        .name-xlong { font-size: 12px; line-height: 1.14; }
        .birth-surname {
          margin-top: 4px;
          font-size: 11px;
          line-height: 1.15;
          color: #9a7368;
          white-space: normal;
          overflow-wrap: anywhere;
        }
        .years {
          margin-top: 5px;
          font-size: 12px;
          line-height: 1.2;
          color: #827b71;
          white-space: nowrap;
        }
      </style>
      <article class="card" data-person-id="${esc(personId)}">
        <div class="avatar ${sex}${deceased ? ' deceased' : ''}" aria-hidden="true">
          ${avatarContent}
          <span class="avatar-shield"></span>
        </div>
        <div class="text">
          <div class="name${nameSizeClass(name)}">${esc(name)}</div>
          ${showBirthSurname ? `<div class="birth-surname">при рожд. ${esc(birthSurname)}</div>` : ''}
          <div class="years">${esc(years)}</div>
        </div>
      </article>`;

    const image = this.shadowRoot.querySelector('.avatar-photo');
    if (image) {
      const showPhoto = () => image.classList.add('loaded');
      const useFallback = () => image.remove();

      image.addEventListener('load', showPhoto, { once: true });
      image.addEventListener('error', useFallback, { once: true });

      // Cached images may already be complete before listeners are attached.
      if (image.complete) {
        if (image.naturalWidth > 0) showPhoto();
        else useFallback();
      }
    }
  }
}

if (!customElements.get('genealogy-person-card')) {
  customElements.define('genealogy-person-card', GenealogyPersonCard);
}

export function personCardElementHtml(person) {
  const deceasedAttribute = person.deceased ? '\n    deceased' : '';
  const photoAttribute = person.photo ? `\n    photo="${esc(person.photo)}"` : '';
  const birthSurnameAttribute = person.birthSurname ? `\n    birth-surname="${esc(person.birthSurname)}"` : '';
  const displayName = person.cardName || person.name || 'Unknown person';

  return `<genealogy-person-card
    style="display:block;width:${PERSON_CARD_WIDTH}px;height:${PERSON_CARD_HEIGHT}px"
    person-id="${esc(person.id || '')}"
    name="${esc(displayName)}"
    years="${esc(person.years || '')}"
    sex="${esc(person.sex || '')}"${deceasedAttribute}${photoAttribute}${birthSurnameAttribute}
  ></genealogy-person-card>`;
}
