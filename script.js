import { players, Person } from "./players.js";

class Game {
  constructor() {
    this.players = [...players];
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

  addPlayer(person) {
    this.players.push(person);
  }

  removePlayer(id) {
    this.players.splice(id, 1);
  }

  resetGame() {
    this.players = [...players];
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
    this.table = document.getElementById("participants-table");
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

    this.renderTable();

    this.drawButton.addEventListener("click", () => this.drawPlayer());
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.saveButton.addEventListener("click", () => this.saveToLocalStorage());
    this.loadButton.addEventListener("click", () =>
      this.loadFromLocalStorage()
    );
    this.addPlayerButton.addEventListener("click", () => this.addPlayer());
  }

  drawPlayer() {
    const winner = this.game.drawPlayer(this.removePlayerSwitch.checked);
    console.info(winner);
    this.drawButton.innerText = "";
    this.drawButton.setAttribute("aria-busy", "true");
    this.renderTable();
    this.renderWinner(winner);

    this.infoField.innerText = "The Game is on!";
  }

  removePlayer(playerID) {
    this.infoField.innerText = `Bye bye ${
      this.game.players.at(playerID).first_name
    } 👋`;

    this.game.removePlayer(playerID);
    this.renderTable();
  }

  addPlayer() {
    const maxPlayerNameLength = 30;

    if (this.addPlayerInput.value.length > maxPlayerNameLength) {
      this.invalidForm.innerText =
        "Name length must be less than 30 characters!";
      this.addPlayerInput.setAttribute("aria-invalid", "true");
      this.invalidForm.classList.remove("hidden");
      this.addPlayerInput.setAttribute("style", "margin-bottom: 0px");
      return;
    }

    this.invalidForm.classList.add("hidden");
    this.addPlayerInput.removeAttribute("aria-invalid");
    this.addPlayerInput.removeAttribute("style");

    const newPlayer = new Person(...this.addPlayerInput.value.split(" "));
    console.info(newPlayer);

    if (newPlayer.first_name || newPlayer.last_name) {
      this.game.addPlayer(newPlayer);
      this.renderTable();
    }

    this.addPlayerInput.value = "";
  }

  resetGame() {
    this.game.resetGame();
    this.renderTable();
    this.winnerField.innerText = "_______ __________";
    this.resetOptions();

    this.addPlayerInput.value = "";
    this.infoField.innerText = "Ready to play? 😉";
  }

  renderWinner(person) {
    if (!person) {
      this.winnerField.innerText = "No players, please reset the game";
      return;
    }

    // Winner
    const winnerText =
      `${person.first_name} ${person.last_name}`.trim() + "! 👑";

    // If animation disabled
    if (this.animationOffSwitch.checked) {
      this.winnerField.innerText = winnerText;
      this.drawButton.removeAttribute("aria-busy");
      this.drawButton.innerText = "Draw";
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
        this.drawButton.removeAttribute("aria-busy");
        this.drawButton.innerText = "Draw";
      }
    }, interval);
  }

  renderTable() {
    this.table.innerHTML = "";

    this.game.players.forEach((person, index, _) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      const tdName = document.createElement("td");
      const tdRemove = document.createElement("td");
      const removeButton = document.createElement("div");

      th.setAttribute("scope", "row");
      th.innerText = index + 1;

      tdName.innerText = `${person.first_name} ${person.last_name}`;

      removeButton.classList.add("remove-btn");
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.addEventListener("click", () => this.removePlayer(index));

      tdRemove.appendChild(removeButton);

      tr.appendChild(th);
      tr.appendChild(tdName);
      tr.appendChild(tdRemove);

      this.table.appendChild(tr);
    });
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
    this.renderTable();

    // Load options
    this.removePlayerSwitch.checked =
      window.localStorage.getItem("remove-player-switch") === "true";

    this.animationOffSwitch.checked =
      window.localStorage.getItem("animation-off-switch") === "true";

    this.infoField.innerText = "Game loaded!";
  }
}

const ui = new UI();
