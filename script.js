import { wordList } from "./words.js";
const board = document.getElementById("gameBoard");
const keyboard = document.getElementById("gameKeyboard");
let answer;

function initBoard() {
  for (let i = 0; i < 30; i++) {
    let cell = document.createElement("span");
    cell.classList.add("letterCell");
    cell.setAttribute("id", `cell${i}`);
    cell.setAttribute("data-cell-index", i);
    board.appendChild(cell);
  }
};

function initKeyboard() {
  const order = ["QWERTYUINOP", "ASDFGHJKL", ">ZXCVBNM<"];
  let rowIdx = 0;
  for (let row of order) {
    let keys = row.split("");
    let newRow = document.createElement("div");
    newRow.classList.add("keyboardRow");
    newRow.setAttribute("id", rowIdx);
    rowIdx++;
    for (let key of keys) {
      let keyBtn = document.createElement("span");
      keyBtn.classList.add("letterKey");
      if (key === ">") {
        keyBtn.innerHTML = "ENTER";
      } else if (key === "<") {
        keyBtn.innerHTML = "DEL";
      } else {
        keyBtn.innerHTML = key;
      }
      keyBtn.setAttribute("id", key);
      keyBtn.setAttribute('role', 'button');
      newRow.appendChild(keyBtn);
    }
    keyboard.appendChild(newRow);
  }
};

function fetchRandomWord(){
  let randomVal = Math.random() * (wordList.length - 1);
  const randomWord = wordList[Math.floor(randomVal)];
  return randomWord.toUpperCase();
}

function initGame(){
  let strVal = window.localStorage.getItem('today');
  let today = JSON.parse(strVal);
  if(today !== null){
    if(today.date === new Date().toLocaleDateString()){
      answer = today.word;
    } else {
      today.date = new Date().toLocaleDateString();
      today.word = fetchRandomWord();
      window.localStorage.setItem('today', JSON.stringify(today));
      answer = today.word;
    }
  } else {
    const today = {};
    today.date = new Date().toLocaleDateString();
    today.word = fetchRandomWord();
    window.localStorage.setItem('today', JSON.stringify(today));
    answer = today.word;
  }
}

(function init(){
  initBoard();
  initKeyboard();
  initGame();
})()

let currIdx = 0;
let currRow = 0;
let control = -1;
let currWord = "";
let wordsGuessed = [];

function saveGuess() {
  if (!currWord || currWord.length < 5) {
    return;
  }
  // check if word is in dictionary

  wordsGuessed.push(currWord);
  // validate word guessed
  let start = currRow * 5;
  let end = start + 4;
  for (let i = start; i <= end; i++) {
    let charIdx = i % 5;
    let targetCell = document.getElementById(`cell${i}`);
    let keyboardKey = document.getElementById(`${currWord[charIdx]}`);
    if (currWord[charIdx] === answer[charIdx]) {
      targetCell.classList.add("green");
      keyboardKey.classList.add('green');
    } else if (answer.includes(currWord[charIdx])) {
      targetCell.classList.add("yellow");
      keyboardKey.classList.add('yellow')
    } else {
      targetCell.classList.add("gray");
      keyboardKey.classList.add('gray');
    }
  }
  currWord = "";
  currIdx++;
  currRow++;
}

function deleteLetter() {
  if (currIdx % 5 === 0) {
    return;
  }
  let delIdx;
  if (currIdx === control) {
    delIdx = control;
    control--;
  } else {
    delIdx = control;
    control--;
    currIdx--;
  }
  let activeCell = document.getElementById(`cell${delIdx}`);
  activeCell.innerText = "";
  currWord = currWord.slice(0, currWord.length - 1);
}

function logLetter(letterEntered) {
  if (currIdx === control) {
    return;
  }
  let activeCell = document.getElementById(`cell${currIdx}`);
  activeCell.innerText = letterEntered;
  currWord += letterEntered;
  control = currIdx;
  if ((currIdx - 4) % 5 !== 0) {
    currIdx++;
  }
}

document.getElementById("gameKeyboard").onclick = function (event) {
  let item = event.target;
  if (item.getAttribute("role") !== "button") {
    return;
  }
  let letterPressed = item.innerText;
  if (letterPressed === "ENTER") {
    saveGuess();
  } else if (letterPressed === "DEL") {
    deleteLetter();
  } else {
    logLetter(letterPressed);
  }
};