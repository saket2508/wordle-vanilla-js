import { wordList } from "./words.js";
const board = document.getElementById("gameBoard");
const keyboard = document.getElementById("gameKeyboard");
let gameComplete = false;
let wordsGuessed = [];
let keyboardState = {};
let boardStatus = [];
let answer = '';
let answerFreq = {};
let currIdx = 0;
let currRow = 0;
let control = -1;
let currWord = "";

function initGame() {
  let today = JSON.parse(window.localStorage.getItem("today"));
  let allGuesses = JSON.parse(window.localStorage.getItem("guesses"));
  let keyboard = JSON.parse(window.localStorage.getItem("keyboardState"));
  let board = JSON.parse(window.localStorage.getItem("boardStatus"));
  let gameStatus = JSON.parse(window.localStorage.getItem("gameStatus"));
  if (today !== null) {
    if (today.date === new Date().toLocaleDateString()) {
      answer = today.word;
      answerFreq = getCharFreq(answer);
      wordsGuessed = allGuesses === null ? [] : allGuesses;
      keyboardState = keyboard === null ? {} : keyboard;
      boardStatus = board === null ? [] : board;
      gameComplete = gameStatus === null ? gameComplete : gameStatus;
    } else {
      today.date = new Date().toLocaleDateString();
      today.word = fetchRandomWord();
      window.localStorage.setItem("today", JSON.stringify(today));
      answer = today.word;
      answerFreq = getCharFreq(answer);
      window.localStorage.setItem(
        "keyboardState",
        JSON.stringify(keyboardState)
      );
      window.localStorage.setItem("boardStatus", JSON.stringify(boardStatus));
      window.localStorage.setItem("guesses", JSON.stringify(wordsGuessed));
      window.localStorage.setItem("gameStatus", JSON.stringify(gameComplete));
    }
  } else {
    const today = {};
    today.date = new Date().toLocaleDateString();
    today.word = fetchRandomWord();
    window.localStorage.setItem("today", JSON.stringify(today));
    answer = today.word;
    answerFreq = getCharFreq(answer);
    window.localStorage.setItem("keyboardState", JSON.stringify(keyboardState));
    window.localStorage.setItem("boardStatus", JSON.stringify(boardStatus));
    window.localStorage.setItem("guesses", JSON.stringify(wordsGuessed));
    window.localStorage.setItem("gameStatus", JSON.stringify(gameComplete));
  }
}

function initBoard() {
  if (wordsGuessed.length === 0) {
    for (let i = 0; i < 30; i++) {
      let cell = document.createElement("span");
      cell.classList.add("letterCell");
      cell.setAttribute("id", `cell${i}`);
      cell.setAttribute("data-cell-index", i);
      board.appendChild(cell);
    }
  } else {
    currRow = wordsGuessed.length;
    currIdx = 5 * currRow;
    control = currIdx - 1;
    let allChars = [];
    let allStatuses = [];
    for (let word of wordsGuessed) {
      allChars = allChars.concat(...word);
    }
    for (let statusList of boardStatus) {
      allStatuses = allStatuses.concat(...statusList);
    }
    for (let i = 0; i < 30; i++) {
      let cell = document.createElement("span");
      cell.classList.add("letterCell");
      cell.setAttribute("id", `cell${i}`);
      cell.setAttribute("data-cell-index", i);
      let status = allStatuses[i];
      let char = allChars[i];
      if (status !== undefined && char !== undefined) {
        cell.innerText = char;
        // keyboard state wont be empty
        if (status === "absent") {
          cell.classList.add("gray");
        } else if (status === "present") {
          cell.classList.add("yellow");
        } else {
          cell.classList.add("green");
        }
      }
      board.appendChild(cell);
    }
  }
}

function initKeyboard() {
  const order = ["QWERTYUIOP", "ASDFGHJKL", ">ZXCVBNM<"];
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
        if (keyboardState[key] !== undefined) {
          let state = keyboardState[key];
          if (state === "present") {
            keyBtn.classList.add("yellow");
          } else if (state === "absent") {
            keyBtn.classList.add("gray");
          } else {
            keyBtn.classList.add("green");
          }
        }
      }
      keyBtn.setAttribute("id", key);
      keyBtn.setAttribute("role", "button");
      newRow.appendChild(keyBtn);
    }
    keyboard.appendChild(newRow);
  }
}

function fetchRandomWord() {
  let randomVal = Math.random() * (wordList.length - 1);
  const randomWord = wordList[Math.floor(randomVal)];
  return randomWord.toUpperCase();
}

function getCharFreq(word){
  let freq = {};
  for (let char of word){
    if(freq[char] === undefined){
      freq[char] = 1;
    } else {
      freq[char]++;
    }
  }
  return freq;
}

function showStatus(){
  if(!gameComplete){
    return;
  }
  if(boardStatus.length === 6){
    if(boardStatus[5].includes('absent') || boardStatus[5].includes('present')){
      showAlert(`The correct answer was ${answer.toUpperCase()}`);
    } else {
      showAlert('Yayy :) You solved the puzzle');
    }
  } else {
    showAlert('Yayy :) You solved the puzzle');
  }
}

(function init() {
  initGame();
  initBoard();
  initKeyboard();
  showStatus();
})();

function saveGuess() {
  if (!currWord || currWord.length < 5) {
    return;
  }
  if (!wordList.includes(currWord.toLowerCase())) {
    // show user an alert that the word they entered is not valid.
    console.log("word not found");
    showAlert('Not in word list');
    return;
  }
  wordsGuessed.push(currWord);
  let statuses = Array(5).fill('absent');
  let start = currRow * 5;
  let end = start + 4;
  const colorFreq = {
    green: {},
    yellow: {},
    gray: {}
  }
  let occ = {};
  for(let char in answerFreq){
    occ[char] = 0;
  }
  for (let i = start; i <= end; i++) {
    let charIdx = i % 5;
    let targetCell = document.getElementById(`cell${i}`);
    const x = currWord[charIdx];
    const y = answer[charIdx];
    let keyboardKey = document.getElementById(`${x}`);
    if (x === y) {
      occ[x]++
      if(x in colorFreq.green){
        colorFreq.green[x].push(i);
      } else {
        colorFreq.green[x] = [i];
      }
      if(x in colorFreq.yellow && answerFreq[x] < occ[x]){
        colorFreq.gray[x] = [];
        for(let y = 0; y < occ[x] - answerFreq[x]; y++){
          let posy = colorFreq.yellow[x].pop();
          colorFreq.gray[x].push(posy);
        }
        if(colorFreq.yellow[x].length === 0){
          delete colorFreq.yellow[x];
        }
      }
    } else if (answerFreq[x] - occ[x] >= 1) {
      occ[x]++;
      if(x in colorFreq.yellow){
        colorFreq.yellow[x].push(i);
      } else {
        colorFreq.yellow[x] = [i];
      }
    } else {
      targetCell.classList.add("gray");
      keyboardKey.classList.add("gray");
      keyboardState[x] = "absent";
    }
  }
  const colorStatuses = {
    green: 'correct',
    yellow: 'present',
    gray: 'absent'
  };
  for(let key in colorFreq){
    for(const letter in colorFreq[key]){
      const keyTarget = document.getElementById(`${letter}`);
      if(keyboardState[letter] !== 'correct'){
        if(keyTarget.classList.length > 1){
          keyTarget.setAttribute('class', 'letterKey');
        }
        keyboardState[letter] = colorStatuses[key];
        keyTarget.classList.add(key);
      }
    }
    let vals = Object.values(colorFreq[key]);
    let pos = [];
    for(let x of vals){
      pos = pos.concat(x);
    }
    for(let idx of pos){
      let targetCell = document.getElementById(`cell${idx}`);
      targetCell.classList.add(key);
      let keyIdx = idx % 5;
      statuses[keyIdx] = colorStatuses[key];
    }
  }
  if (!statuses.includes("absent") && !statuses.includes("present")) {
    gameComplete = true;
    showAlert('Yayy :) You solved the puzzle');
  }
  else if (wordsGuessed.length === 6) {
    gameComplete = true;
    showAlert(`The correct answer was ${answer.toUpperCase()}`);
  }
  boardStatus.push(statuses);
  window.localStorage.setItem("boardStatus", JSON.stringify(boardStatus));
  window.localStorage.setItem("keyboardState", JSON.stringify(keyboardState));
  window.localStorage.setItem("guesses", JSON.stringify(wordsGuessed));
  window.localStorage.setItem("gameStatus", JSON.stringify(gameComplete));
  currWord = "";
  currIdx++;
  currRow++;
}

function deleteLetter() {
  if (currIdx % 5 === 0) {
    return;
  }
  let delIdx = control;
  if (currIdx !== control) {
    control--;
    currIdx--;
  } else {
    control--;
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

function showAlert(msg){
  const snackbar = document.getElementById('snackbar');
  snackbar.classList.add('show');
  snackbar.innerText = msg;
  setTimeout(() => snackbar.classList.remove('show'), 3000);
}

document.getElementById("gameKeyboard").onclick = function (event) {
  if (gameComplete) {
    return;
  }
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