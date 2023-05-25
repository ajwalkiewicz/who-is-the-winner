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

  constructor() {
    this.game = new Game();
    this.table = document.getElementById("participants-table");
    this.addButton = document.getElementById("add-btn");
    this.addField = document.getElementById("add-player");
    this.removeButtons = [];
    this.ignoreButtons = [];
    this.loadButton = document.getElementById("load-btn");
    this.saveButton = document.getElementById("save-btn");
    this.resetButton = document.getElementById("reset-btn");
    this.drawButton = document.getElementById("draw-btn");
    this.winnerField = document.getElementById("winner");
    this.removePlayerSwitch = document.getElementById("remove-player-swt");
    this.infoField = document.getElementById("info");

    this.renderTable();

    this.drawButton.addEventListener("click", () => this.drawPlayer());
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.saveButton.addEventListener("click", () => this.saveToLocalStorage());
    this.loadButton.addEventListener("click", () =>
      this.loadFromLocalStorage()
    );
    this.addButton.addEventListener("click", () => this.addPlayer());
  }

  drawPlayer() {
    const winner = this.game.drawPlayer(this.removePlayerSwitch.checked);
    console.log(winner);
    this.renderWinner(winner);
    this.renderTable();

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
    const newPlayer = new Person(...this.addField.value.split(" "));
    console.log(newPlayer);
    if (newPlayer.first_name || newPlayer.last_name) {
      this.game.addPlayer(newPlayer);
      this.renderTable();
    }
  }

  resetGame() {
    this.game.resetGame();
    this.renderTable();
    this.winnerField.innerText = "_______ __________";
    this.resetOptions();

    this.addField.value = "";
    this.infoField.innerText = "Ready to play? 😉";
  }

  renderWinner(person) {
    if (!person) {
      this.winnerField.innerText = "No players, please reset the game";
    } else {
      this.winnerField.innerText =
        `${person.first_name} ${person.last_name}`.trim() + "! 👑";
    }
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
      // removeButton.innerText = "❌";
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
  }

  saveToLocalStorage() {
    this.game.saveGame();

    // Save options
    window.localStorage.setItem(
      "remove-player-switch",
      this.removePlayerSwitch.checked
    );

    this.infoField.innerText = "Game saved!";
  }

  loadFromLocalStorage() {
    this.game.loadGame();
    this.renderTable();

    // Load options
    this.removePlayerSwitch.checked =
      window.localStorage.getItem("remove-player-switch") === "true";

    this.infoField.innerText = "Game loaded!";
  }
}

const ui = new UI();
