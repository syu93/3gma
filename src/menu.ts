import { addShape, SHAPE_ICON, AVAILABLE_SHAPES } from "./shape";
import { EDITOR_STATE } from "./state";

export enum AVAILABLE_TOOLS {
  SELECT = 'SELECT',
  ADD_SHAPE = 'ADD_SHAPE',
  MOVE = 'MOVE',
  ROTATE = 'ROTATE',
  SCALE = 'SCALE',
};

export enum TOOL_ICONS {
  SELECT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 9l5 12l1.8-5.2L21 14ZM7.2 2.2L8 5.1M5.1 8l-2.9-.8M14 4.1L12 6m-6 6l-1.9 2"/></svg>',
  ADD_SHAPE = SHAPE_ICON.CUBE,
  MOVE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 9l-3 3l3 3M9 5l3-3l3 3m0 14l-3 3l-3-3M19 9l3 3l-3 3M2 12h20M12 2v20"/></svg>',
  ROTATE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M16.466 7.5C15.643 4.237 13.952 2 12 2C9.239 2 7 6.477 7 12s2.239 10 5 10c.342 0 .677-.069 1-.2m2.194-8.093l3.814 1.86l-1.86 3.814"/><path d="M19 15.57c-1.804.885-4.274 1.43-7 1.43c-5.523 0-10-2.239-10-5s4.477-5 10-5c4.838 0 8.873 1.718 9.8 4"/></g></svg>',
  SCALE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21l-6-6m6 6v-4.8m0 4.8h-4.8M3 16.2V21m0 0h4.8M3 21l6-6m12-7.2V3m0 0h-4.8M21 3l-6 6M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>'
};

const ARROW_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z"/></svg>';

export const MENU = [
  { type: 'button', tool: AVAILABLE_TOOLS.SELECT, icon: TOOL_ICONS.SELECT, action: () => { } },
  { type: 'select', tool: AVAILABLE_TOOLS.ADD_SHAPE, icon: SHAPE_ICON[AVAILABLE_SHAPES.CUBE], options: Object.values(AVAILABLE_SHAPES), action: enablePointerMode },
  { type: 'button', tool: AVAILABLE_TOOLS.MOVE, icon: TOOL_ICONS.MOVE, action: setTransformControlMode },
  { type: 'button', tool: AVAILABLE_TOOLS.ROTATE, icon: TOOL_ICONS.ROTATE, action: setTransformControlMode },
  { type: 'button', tool: AVAILABLE_TOOLS.SCALE, icon: TOOL_ICONS.SCALE, action: setTransformControlMode },
];

export function initMenu(container: Element) {
  const menuToggle = container.querySelector('menu hr');
  menuToggle?.addEventListener('click', () => {
    container.querySelector('menu')?.classList.toggle('colapsed');
  });

  const menuCtn = getMenuCointainer();
  MENU.forEach((menu) => {
    const item = createMenuItem(menu);
    if (menu.tool === AVAILABLE_TOOLS.SELECT) {
      item.classList.add('active');
    }
    item.querySelector('button')?.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedTool(menu.tool, menu.action);
    });
    menuCtn?.appendChild(item);
  });
}

export function setSelectedTool(tool: AVAILABLE_TOOLS, executeAction: Function = () => { }) {
  const menuCtn = getMenuCointainer();
  const activeItem = menuCtn?.querySelector('.active');
  if (activeItem) {
    activeItem.classList.remove('active');
  }
  const item = menuCtn?.querySelector(`[data-tool="${tool}"]`);
  item?.classList.add('active');

  executeAction(tool);

  if ([AVAILABLE_TOOLS.MOVE, AVAILABLE_TOOLS.ROTATE, AVAILABLE_TOOLS.SCALE].includes(tool) && EDITOR_STATE.selectedObject) {
    EDITOR_STATE.transformControl.attach(EDITOR_STATE.selectedObject);
  } else {
    EDITOR_STATE.transformControl.detach();
  }
  if (tool !== AVAILABLE_TOOLS.ADD_SHAPE) {
    disablePointerMode();
  }

  EDITOR_STATE.selectedTool = tool;
}

function createMenuItem({ tool, icon, type, options, action }: { tool: AVAILABLE_TOOLS, icon: string, type: string, options?: string[], action: Function }) {
  const item = document.createElement('li');
  item.dataset.tool = tool;
  if (type === 'button') {
    const button = document.createElement('button');
    button.setAttribute('title', tool.toString());
    setMenuIcon(button, icon);
    item.appendChild(button);
  } else if (type === 'select') {
    item.classList.add('relative', 'flex', 'items-center', 'justify-between');
    item.setAttribute('title', tool.toString());

    const selected = document.createElement('button');
    setMenuIcon(selected, icon);

    const arrow = document.createElement('span');
    arrow.innerHTML = ARROW_ICON
    arrow.querySelector('svg')?.classList.add('w-5', 'hover:transform', 'hover:translate-y-1', 'transition', 'duration-300', 'ease-in-out');

    const dropdown = document.createElement('ul');
    dropdown.classList.add('absolute', 'top-7', 'left-0', 'hidden', 'bg-white', 'shadow', 'rounded', 'w-full', 'mt-2', 'py-2', 'z-10', 'space-y-1');
    options?.forEach((shape) => {
      const option = document.createElement('li');
      option.classList.add('text-gray-700', 'hover:bg-gray-200', 'hover:text-gray-900', 'cursor-pointer', 'flex', 'items-center', 'justify-center', 'px-2', 'py-1')

      setMenuIcon(option, SHAPE_ICON[shape])
      dropdown.appendChild(option);

      option.addEventListener('click', () => {
        EDITOR_STATE.selectedShape = AVAILABLE_SHAPES[shape];
        setMenuIcon(selected, SHAPE_ICON[EDITOR_STATE.selectedShape]);
        setSelectedTool(AVAILABLE_TOOLS.ADD_SHAPE, action);

        dropdown.classList.toggle('hidden');
      },);
    });

    arrow.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
    });

    item.appendChild(selected);
    item.appendChild(arrow);
    item.appendChild(dropdown);
  }
  return item;
}

function setTransformControlMode(mode: string) {
  switch (mode) {
    case AVAILABLE_TOOLS.MOVE:
      EDITOR_STATE.transformControl.setMode('translate');
      break;
    case AVAILABLE_TOOLS.ROTATE:
      EDITOR_STATE.transformControl.setMode('rotate');
      break;
    case AVAILABLE_TOOLS.SCALE:
      EDITOR_STATE.transformControl.setMode('scale');
      break;
  }
}

function setMenuIcon(containter: Element, shape: string) {
  containter.innerHTML = shape;
  containter.querySelector('svg')?.classList.add('w-6');
}

function getMenuCointainer() {
  return EDITOR_STATE.container.querySelector('menu ul');
}

function enablePointerMode() {
  EDITOR_STATE.pointerTarget.userData.enabled = true;
  document.addEventListener('click', addShape);
}

function disablePointerMode() {
  EDITOR_STATE.pointerTarget.userData.enabled = false;
  document.removeEventListener('click', addShape);
}
