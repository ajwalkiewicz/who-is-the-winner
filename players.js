class Person {
  constructor(first_name = "", last_name = "") {
    this.first_name = first_name;
    this.last_name = last_name;
  }
}

const defaultPlayers = [
  new Person("Adam", "Walkiewicz"),
  new Person("Adelia", "Alexander"),
  new Person("Wilma", "Graham"),
  new Person("Gwendolyn", "Orr"),
  new Person("Pablo", "Gregory"),
  new Person("Dorothy", "Myers"),
  new Person("Charlie", "Jordan"),
  new Person("Marvin", "Rutledge"),
];

export { defaultPlayers, Person };
