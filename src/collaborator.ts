import { getPlayersPosition, setPlayerPosition } from "./firebase";
import { get3DMousePosition, getMousePosition } from "./helpers";
import { createTargetShape } from "./objectCreator.helper";
import { EDITOR_STATE } from "./state";

export function initPresence() {
  const cursor = createTargetShape(generateRandomHexColor());

  EDITOR_STATE.sceneHelper.add(cursor);

  document.addEventListener('mousemove', (event) => {
    const { x, y } = getMousePosition(event);

    const worldPosition = get3DMousePosition(event);

    setPlayerPosition(EDITOR_STATE.PROJECT_ID, { x: worldPosition.x, z: worldPosition.z });

    if (!worldPosition.x && !worldPosition.z) {
      cursor.visible = false;
    } else {
      cursor.visible = true;
      cursor.position.copy(worldPosition);
    }
  });

  displayPlayerPosition();
}

const playerMap = new Map();

export function displayPlayerPosition() {
  getPlayersPosition(EDITOR_STATE.PROJECT_ID, (players) => {
    if (!playerMap.has(players.id)) {
      console.log('add player');

      const cursor = createTargetShape(generateRandomHexColor());
      cursor.visible = true;
      EDITOR_STATE.sceneHelper.add(cursor);
      playerMap.set(players.id, cursor);
    }
    if (!players.x && !players.z) {
      playerMap.get(players.id).visible = false;
    } else {
      playerMap.get(players.id).visible = true;
      playerMap.get(players.id).position.set(players.x, 0, players.z);
    }
  });
}

function generateRandomHexColor() {
  // Generate a random number and convert it to a hexadecimal string
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);

  // Ensure it's 6 characters long. If it's less, pad with zeroes at the start
  while (randomColor.length < 6) {
    randomColor = '0' + randomColor;
  }

  return Number('0x' + randomColor);
}