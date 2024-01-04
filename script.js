import { defaultPlayers, Person } from "./players.js";

class Game {
  constructor() {
    this.players = [...defaultPlayers];
  }

  drawPlayer(removePlayer = false) {
    const numberOfPlayers = this.players.length;
    const playerID = Math.floor(Math.random() * numberOfPlayers);
    const player = this.players[playerID];

    if (removePlayer) {
      this.removePlayer(playerID);
    }

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

  saveGame() {
    window.localStorage.setItem("players", JSON.stringify(this.players));
  }

  loadGame() {
    const tempPlayers = JSON.parse(window.localStorage.getItem("players"));
    this.players = [];
    tempPlayers.forEach((player) => {
      this.players.push(new Person(player.first_name, player.last_name));
    });
  }
}

class UI {
  _defaultRemovePlayerSwitch = false;
  _defaultAnimationOffSwitch = false;
  _defaultLanguage = navigator.languages[1];

  constructor() {
    this.game = new Game();
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
    this.infoField = document.getElementById("info");

    this.renderTextArea();
    this.updateLanguage(this._defaultLanguage);
    this.languageDropdown.value = this._defaultLanguage;

    this.gameState = "gameResetMessage";

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

    this.gameState = "gameOnMessage";
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

    this.gameState = "gameResetMessage";
    this.infoField.innerText = this.translation.gameResetMessage;
  }

  resetOptions() {
    this.removePlayerSwitch.checked = this._defaultRemovePlayerSwitch;
    this.animationOffSwitch.checked = this._defaultAnimationOffSwitch;
  }

  saveToLocalStorage() {
    this.game.saveGame();

    // Save options
    window.localStorage.setItem(
      "remove-player-switch",
      this.removePlayerSwitch.checked
    );

    window.localStorage.setItem(
      "animation-off-switch",
      this.animationOffSwitch.checked
    );

    this.gameState = "gameSavedMessage";
    this.infoField.innerText = this.translation.gameSavedMessage;
  }

  loadFromLocalStorage() {
    this.game.loadGame();
    this.renderTextArea();

    // Load options
    this.removePlayerSwitch.checked =
      window.localStorage.getItem("remove-player-switch") === "true";

    this.animationOffSwitch.checked =
      window.localStorage.getItem("animation-off-switch") === "true";

    this.gameState = "gameLoadedMessage";
    this.infoField.innerText = this.translation.gameLoadedMessage;
  }

  async updateLanguage(alphaCode) {
    return await fetch(`./lang/${alphaCode}.json`)
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

window.ui = ui;
