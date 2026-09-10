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

export class GenealogyPersonCard extends HTMLElement {
  static get observedAttributes() {
    return ['person-id', 'name', 'years'];
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
          box-shadow: 0 4px 14px rgba(48,42,34,.09);
          text-align: left;
        }
        .avatar {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eeebe4;
          color: #59534a;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .02em;
          user-select: none;
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
        <div class="avatar" aria-hidden="true">${esc(initials(name))}</div>
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
  return `<genealogy-person-card
    style="display:block;width:${PERSON_CARD_WIDTH}px;height:${PERSON_CARD_HEIGHT}px"
    person-id="${esc(person.id || '')}"
    name="${esc(person.name || 'Unknown person')}"
    years="${esc(person.years || '')}"
  ></genealogy-person-card>`;
}
