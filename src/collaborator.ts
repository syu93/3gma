import { getPlayersPosition, getUser, setPlayerPosition } from "./firebase";
import { get3DMousePosition, getMousePosition } from "./helpers";
import { createTargetShape } from "./objectCreator.helper";
import { EDITOR_STATE } from "./state";

export function initPresence() {
  document.addEventListener('mousemove', (event) => {
    const { x, z } = get3DMousePosition(event);
    setPlayerPosition({ x, z, color: generateRandomHexColor() });
  });

  displayPlayerPosition();
}

export function displayPlayerPosition() {
  const playersMap = new Map();
  getPlayersPosition((players) => {
    const currentUser = getUser();
    if (currentUser && players.id === currentUser.uid) {
      return;
    }
    if (!playersMap.has(players.id)) {
      const cursor = createTargetShape(players.color);
      cursor.visible = true;
      EDITOR_STATE.sceneHelper.add(cursor);
      playersMap.set(players.id, cursor);
    }

    if (!players.x && !players.z) {
      playersMap.get(players.id).visible = false;
    } else {
      playersMap.get(players.id).visible = true;
      playersMap.get(players.id).position.set(players.x, 0, players.z);
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