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
  #defaultRemovePlayerSwitch = false;
  #defaultAnimationOffSwitch = false;

  constructor() {
    this.game = new Game();
    this.textArea = document.getElementById("players-area");
    this.addPlayerButton = document.getElementById("add-btn");
    this.addPlayerInput = document.getElementById("add-player");
    this.invalidForm = document.querySelector(".invalid-form");
    this.removeButtons = [];
    this.ignoreButtons = [];
    this.loadButton = document.getElementById("load-btn");
    this.saveButton = document.getElementById("save-btn");
    this.resetButton = document.getElementById("reset-btn");
    this.drawButton = document.getElementById("draw-btn");
    this.winnerField = document.getElementById("winner");
    this.removePlayerSwitch = document.getElementById("remove-player-swt");
    this.animationOffSwitch = document.getElementById("animation-off-swt");
    this.infoField = document.getElementById("info");

    this.renderTextArea();

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
  }

  drawPlayer() {
    const winner = this.game.drawPlayer(this.removePlayerSwitch.checked);
    console.info(winner);
    this.disableDrawButton();
    this.renderWinner(winner);
    this.renderTextArea();

    this.infoField.innerText = "The Game is on!";
  }

  disableDrawButton() {
    this.drawButton.innerText = "";
    this.drawButton.setAttribute("aria-busy", "true");
  }

  enableDrawButton() {
    this.drawButton.removeAttribute("aria-busy");
    this.drawButton.innerText = "Draw";
  }

  renderWinner(person) {
    if (!person) {
      this.winnerField.innerText = "Please add players to the list";
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
    const splitWinnerText = winnerText.split("");

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
    this.winnerField.innerText = "_______ __________";
    this.resetOptions();

    this.infoField.innerText = "Ready to play? 😉";
  }

  resetOptions() {
    this.removePlayerSwitch.checked = this.#defaultRemovePlayerSwitch;
    this.animationOffSwitch.checked = this.#defaultAnimationOffSwitch;
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

    this.infoField.innerText = "Game saved!";
  }

  loadFromLocalStorage() {
    this.game.loadGame();
    this.renderTextArea();

    // Load options
    this.removePlayerSwitch.checked =
      window.localStorage.getItem("remove-player-switch") === "true";

    this.animationOffSwitch.checked =
      window.localStorage.getItem("animation-off-switch") === "true";

    this.infoField.innerText = "Game loaded!";
  }
}

const ui = new UI();

window.ui = ui;
