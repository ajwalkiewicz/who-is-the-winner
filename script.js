import { defaultPlayers, Person } from "./players.js";

const GameState = Object.freeze({
  Saved: "gameSavedMessage",
  Loaded: "gameLoadedMessage",
  Reset: "gameResetMessage",
  On: "gameOnMessage",
});

class Game {
  constructor(restoreGame = false) {
    if (window.localStorage.getItem("current-game-status") && restoreGame) {
      this.loadGame("current-game-status");
    } else {
      this.players = [...defaultPlayers];
    }
  }

  drawPlayer(removePlayer = false) {
    const numberOfPlayers = this.players.length;
    const playerID = Math.floor(Math.random() * numberOfPlayers);
    const player = this.players[playerID];

    if (removePlayer) {
      this.removePlayer(playerID);
    }

    this.saveGame("current-game-status");

    return player;
  }

  updatePlayersList(newPlayers) {
    this.players = newPlayers;
  }

  addPlayer(person) {
    this.players.push(person);
  }

  removePlayer(id) {
    this.players.splice(id, 1);
  }

  resetGame() {
    this.players = [...defaultPlayers];
  }

  saveGame(source = "players") {
    window.localStorage.setItem(source, JSON.stringify(this.players));
  }

  loadGame(source = "players") {
    const tempPlayers = JSON.parse(window.localStorage.getItem(source));
    if (!tempPlayers) return;
    this.players = [];
    tempPlayers.forEach((player) => {
      this.players.push(new Person(player.first_name, player.last_name));
    });
    this.saveGame("current-game-status");
  }
}

class UI {
  _defaultRemovePlayerSwitch = false;
  _defaultAnimationOffSwitch = false;
  _defaultRestoreGameSwitch = false;
  _defaultLanguage = navigator.languages[1];

  constructor() {
    this.languageDropdown = document.getElementsByClassName("language")[0];
    this.titleText = document.getElementById("title-txt");
    this.subtitleText = document.getElementById("subtitle-txt");
    this.playersText = document.getElementById("players-txt");
    this.optionsText = document.getElementById("options-txt");
    this.textArea = document.getElementById("players-area");
    this.loadButton = document.getElementById("load-btn");
    this.saveButton = document.getElementById("save-btn");
    this.resetButton = document.getElementById("reset-btn");
    this.drawButton = document.getElementById("draw-btn");
    this.winnerField = document.getElementById("winner");
    this.removePlayerSwitch = document.getElementById("remove-player-swt");
    this.animationOffSwitch = document.getElementById("animation-off-swt");
    this.restoreGameSwitch = document.getElementById("restore-game-swt");
    this.infoField = document.getElementById("info");

    this.switchMap = Object.freeze({
      "remove-player-switch": this.removePlayerSwitch,
      "animation-off-switch": this.animationOffSwitch,
      "restore-game-switch": this.restoreGameSwitch,
    });

    this.loadCurrentSwitchFromLocalStorage("remove-player-switch");
    this.loadCurrentSwitchFromLocalStorage("animation-off-switch");
    this.loadCurrentSwitchFromLocalStorage("restore-game-switch");

    this.game = new Game(this.restoreGameSwitch.checked);
    this.gameState = GameState.Reset;

    this.renderTextArea();
    this.updateLanguage(this._defaultLanguage);
    this.languageDropdown.value = this._defaultLanguage;
    this.setLoadButton();

    this.removePlayerSwitch.addEventListener("change", () =>
      this.saveCurrentSwitchToLocalStorage("remove-player-switch")
    );
    this.animationOffSwitch.addEventListener("change", () =>
      this.saveCurrentSwitchToLocalStorage("animation-off-switch")
    );
    this.restoreGameSwitch.addEventListener("change", () =>
      this.saveCurrentSwitchToLocalStorage("restore-game-switch")
    );
    this.drawButton.addEventListener("click", () => this.drawPlayer());
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.saveButton.addEventListener("click", () => this.saveToLocalStorage());
    this.loadButton.addEventListener("click", () =>
      this.loadFromLocalStorage()
    );
    this.textArea.addEventListener("change", () => {
      this.fetchDataFromTextArea();
      this.game.updatePlayersList(this.players);
      console.log(this.players);
    });
    this.languageDropdown.addEventListener("change", () =>
      this.updateLanguage(this.languageDropdown.value)
    );
  }

  drawPlayer() {
    const winner = this.game.drawPlayer(this.removePlayerSwitch.checked);
    console.info(winner);
    this.disableDrawButton();
    this.renderWinner(winner);
    this.renderTextArea();

    this.gameState = GameState.On;
    this.infoField.innerText = this.translation.gameOnMessage;
  }

  disableDrawButton() {
    this.drawButton.innerText = "";
    this.drawButton.setAttribute("aria-busy", "true");
  }

  enableDrawButton() {
    this.drawButton.removeAttribute("aria-busy");
    this.drawButton.innerText = this.translation.drawButton;
  }

  renderWinner(person) {
    if (!person) {
      this.winnerField.innerText = this.translation.addPlayersMessage;
      this.enableDrawButton();
      return;
    }

    // Winner
    const winnerText =
      `${person.first_name} ${person.last_name}`.trim() + "! 👑";

    // If animation disabled
    if (this.animationOffSwitch.checked) {
      this.winnerField.innerText = winnerText;
      this.enableDrawButton();
      return;
    }

    // If animation allowed
    const splitWinnerText = winnerText
      .slice(0, winnerText.indexOf("👑"))
      .split("")
      .concat("👑");

    this.winnerField.innerText = "";

    splitWinnerText.forEach((character) => {
      this.winnerField.innerHTML += `<span>${character}</span>`;
    });

    const interval = 50; // milliseconds
    let char = 0;
    let timer = setInterval(() => {
      const span = document.querySelectorAll("span")[char];
      span.classList.add("fade");
      char++;
      if (char === splitWinnerText.length) {
        clearInterval(timer);
        timer = null;
        this.enableDrawButton();
      }
    }, interval);
  }

  renderTextArea() {
    this.textArea.value = "";

    this.game.players.forEach((player) => {
      this.textArea.value += `${player.first_name} ${player.last_name}\n`;
    });
  }

  fetchDataFromTextArea() {
    this.players = [];
    this.textArea.value.split("\n").forEach((player) => {
      if (player.trim()) {
        this.players.push(new Person(...player.split(" ")));
      }
    });
    return this.players;
  }

  resetGame() {
    this.game.resetGame();
    this.renderTextArea();
    this.winnerField.innerText = "? ? ?";
    this.resetOptions();

    this.gameState = GameState.Reset;
    this.infoField.innerText = this.translation.gameResetMessage;
  }

  resetOptions() {
    this.removePlayerSwitch.checked = this._defaultRemovePlayerSwitch;
    this.animationOffSwitch.checked = this._defaultAnimationOffSwitch;
    this.restoreGameSwitch.checked = this._defaultRestoreGameSwitch;
    this.saveCurrentSwitchToLocalStorage("remove-player-switch");
    this.saveCurrentSwitchToLocalStorage("animation-off-switch");
    this.saveCurrentSwitchToLocalStorage("restore-game-switch");
  }

  saveCurrentSwitchToLocalStorage(switchName) {
    window.localStorage.setItem(switchName, this.switchMap[switchName].checked);
  }

  saveToLocalStorage() {
    this.game.saveGame();

    const switchOptions = {
      removePlayerSwitch: this.removePlayerSwitch.checked,
      animationOffSwitch: this.animationOffSwitch.checked,
      restoreGameSwitch: this.restoreGameSwitch.checked,
    };

    window.localStorage.setItem("switchOptions", JSON.stringify(switchOptions));

    this.gameState = GameState.Saved;
    this.infoField.innerText = this.translation.gameSavedMessage;
    this.setLoadButton();
  }

  loadCurrentSwitchFromLocalStorage(switchName) {
    this.switchMap[switchName].checked =
      window.localStorage.getItem(switchName) === "true";
  }

  setLoadButton() {
    if (window.localStorage.getItem("players")) {
      this.loadButton.disabled = false;
    } else {
      this.loadButton.disabled = true;
    }
  }

  loadFromLocalStorage() {
    this.game.loadGame();
    this.renderTextArea();

    const switchOptions = JSON.parse(
      window.localStorage.getItem("switchOptions")
    );

    if (!switchOptions) {
      this.infoField.innerText = this.translation.errorLoadGameMessage;
      return;
    }

    this.removePlayerSwitch.checked = switchOptions.removePlayerSwitch;
    this.animationOffSwitch.checked = switchOptions.animationOffSwitch;
    this.restoreGameSwitch.checked = switchOptions.restoreGameSwitch;

    this.saveCurrentSwitchToLocalStorage("remove-player-switch");
    this.saveCurrentSwitchToLocalStorage("animation-off-switch");
    this.saveCurrentSwitchToLocalStorage("restore-game-switch");

    this.gameState = GameState.Loaded;
    this.infoField.innerText = this.translation.gameLoadedMessage;
  }

  async updateLanguage(alphaCode) {
    return fetch(`./lang/${alphaCode}.json`)
      .then((response) => response.json())
      .then((data) => {
        this.translation = data;
        this.infoField.innerText = data[this.gameState];
        this.titleText.innerText = data.titleText;
        this.subtitleText.innerText = data.subtitleText;
        this.drawButton.innerText = data.drawButton;
        this.playersText.innerText = data.playersText;
        this.optionsText.innerText = data.optionsText;
        this.removePlayerSwitch.nextSibling.data = data.removePlayerSwitch;
        this.animationOffSwitch.nextSibling.data = data.animationOffSwitch;
        this.restoreGameSwitch.nextSibling.data = data.restoreGameSwitch;
        this.loadButton.innerText = data.loadButton;
        this.saveButton.innerText = data.saveButton;
        this.resetButton.innerText = data.resetButton;

        return data;
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

const ui = new UI();

// Storing reference to UI in window object
// to access it from the console
window.ui = ui;
