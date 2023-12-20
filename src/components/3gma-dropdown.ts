import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

const SHAPES = {
  cube: {
    name: 'Cube',
    icon: 'cube.svg',
  },
  sphere: {
    name: 'Sphere',
    icon: 'sphere.svg',
  },
  cylinder: {
    name: 'Cylinder',
    icon: 'cylinder.svg',
  },
}

class GmaDropdown extends LitElement {
  static properties = {
    opened: {
      type: Boolean,
      reflect: true,
    },
  };
  opened: boolean;
  selectedShape: string;
  createRenderRoot() {
    return this;
  }
  constructor() {
    super();

    this.opened = false;
    this.selectedShape = 'cube';

    document.addEventListener('click', () => this.opened = false);
  }

  _toggleDropdown(e) {
    e.stopPropagation();
    this.opened = !this.opened;
  }
  _closeDropdown(e) {
    e.stopPropagation();
    this.opened = false;
  }

  selectShape(shape) {
    this.selectedShape = shape;
    const event = new CustomEvent('shape-selected', {
      detail: shape
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`<div class="relative inline-block text-left">
      <div>
        <button 
          type="button"
          class="inline-flex w-full justify-center items-center gap-x-1.5 
            bg-white px-3 py-2 rounded-md
            text-sm font-semibold text-gray-900
            shadow-sm ring-1 ring-inset ring-gray-300 
            hover:bg-indigo-50"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          @click="${() => this.selectShape(this.selectedShape)}"
        >
          <div class="flex items-center">
            <img class="w-8 h-8 object-contain" src="/src/assets/images/${SHAPES[this.selectedShape].icon}">
            <span>${SHAPES[this.selectedShape].name}</span>
          </div>
          <svg class="-mr-1 h-full w-5 text-gray-400 hover:translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" @click="${this._toggleDropdown}">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    
      ${this.opened
        ? html`<div class="absolute left-0 z-10 mt-2 w-max origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
          <div class="py-1" role="none" @click="${this._closeDropdown}">
            <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
            ${Object.keys(SHAPES).map(shape => html`
              <button
                class="text-gray-700 flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                tabindex="-1"
                @click="${() => this.selectShape(shape)}"
              >
                <img class="w-8 h-8 object-contain" src="/src/assets/images/${SHAPES[shape].icon}">
                <span>${SHAPES[shape].name}</span>
              </button>
            `)}
          </div>
        </div>`
        : ''}
    </div>`;
  }
}

customElements.define('gma-dropdown', GmaDropdown);
