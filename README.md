# Who is the winner?

## Summary
No one want's to take a lead during presentation? 

You need to send someone for a beer?

Can't decide who's you favorite friend?

**Just draw it!**

`who-is-the-winner` is a simple program that allows you to draw random person from a list of people.

## How to run

1. Clone repository
```bash
git clone https://github.com/ajwalkiewicz/who-is-the-winner.git
```
2. Go to created directory
```bash
cd who-is-the-winner
```
3. Run whatever simple server.
```bash
# For example in python
python -m http.server
```

## How to configure

You want to play with your friends?

Edit players in [players.js](players.js):
```javascript
const players = [
  new Person("Adam", "Walkiewicz"),
  new Person("Adelia", "Alexander"),
  new Person("Wilma", "Graham"),
  new Person("Gwendolyn", "Orr"),
  new Person("Pablo", "Gregory"),
  new Person("Dorothy", "Myers"),
  new Person("Charlie", "Jordan"),
  new Person("Marvin", "Rutledge"),
];
```

