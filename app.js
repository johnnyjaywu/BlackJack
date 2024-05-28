// APP FLOW
// 1. Wait for user press on "New Game" / "Resume Game" buttons
// 2.
//  2a. [New Game]: Get a new deck
//  2b. [Resume Game]: Retrieve save data
// 3. Start Blackjack game

// BLACKJACK GAME FLOW
// 1. Check current deck remaining, and get a new deck if necessary
// 2. Draw 4 cards from deck
// 3. Show 1st card to player
// 4. Hide 2nd card for dealer
// 5. Show 3rd card to player
// 6. Show 4th card to dealer
// 7.
//  7a. Check if dealer or player has blackjack and end the game
//  7b. Continue and wait for player input
// 8.
//  8a. [Hit]: Player press "Hit", deal 1 card to player and check for bust (if busted, end the game)
//  8b. [Stand]: Player press "Stand", continue
// 9. Dealer hit until dealer score is > 16
// 10. Check game result, tally player record and end the game
// 11.
//  11a. [New Game]: Player record is reset, and a new deck will be drawn
//  11b. [Continue]: Game continues with the current deck

// *ignore split and insurance for now
// **ignore bets for now
// ***ignore "burn" card

// TODO: Separate Player/Dealer and Card logic to its own object/module
// TODO: Implement local storage save/load logic

import { Blackjack } from "./blackjack.js";

const gameResult = document.querySelector("h1");
const dealerTotalText = document.querySelector(".dealer h2");
const playerTotalText = document.querySelector(".player h2");

const newGameButton = document.querySelector("button#new");
newGameButton.addEventListener("click", onNewGameButton);

const resumeButton = document.querySelector("button#resume");
resumeButton.addEventListener("click", onResumeButton);

const continueButton = document.querySelector("button#continue");
continueButton.addEventListener("click", onContinueButton);

const hitButton = document.querySelector("button#hit");
hitButton.addEventListener("click", onHitButton);

const standButton = document.querySelector("button#stand");
standButton.addEventListener("click", onStandButton);

let blackjack;
function onNewGameButton() {
  if (!blackjack) blackjack = new Blackjack();

  blackjack.stateChanged = onStateChanged;
  blackjack.displayDealer = onDealerCard;
  blackjack.displayPlayer = onPlayerCard;
  blackjack.newGame();
}

function onResumeButton() {
  if (!blackjack) blackjack = new Blackjack();
  blackjack.load();
}

function onContinueButton() {
  blackjack.play();
}

function onHitButton() {
  blackjack.hit();
}

function onStandButton() {
  blackjack.stand();
}

function onStateChanged(state) {
  switch (state) {
    case Blackjack.GameState.Initial:
      onInitialState();
      break;
    case Blackjack.GameState.Betting:
      onBettingState();
      break;
    case Blackjack.GameState.Player:
      onPlayerState();
      break;
    case Blackjack.GameState.Dealer:
      onDealerState();
      break;
    case Blackjack.GameState.Result:
      onResultState();
      break;
  }
}

function onInitialState() {
  newGameButton.classList.remove("hidden");
  resumeButton.classList.remove("hidden");
  gameResult.classList.remove("hidden");
  gameResult.textContent = document.title;

  continueButton.classList.add("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
  playerTotalText.classList.add("hidden");
  dealerTotalText.classList.add("hidden");
}

function onBettingState() {
  continueButton.classList.remove("hidden");

  newGameButton.classList.add("hidden");
  resumeButton.classList.add("hidden");
  gameResult.classList.add("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
  playerTotalText.classList.add("hidden");
  dealerTotalText.classList.add("hidden");
  playerTotalText.textContent = "";
  dealerTotalText.textContent = "";
}

function onPlayerState() {
  hitButton.classList.remove("hidden");
  standButton.classList.remove("hidden");
  playerTotalText.classList.remove("hidden");
  dealerTotalText.classList.remove("hidden");

  continueButton.classList.add("hidden");
  newGameButton.classList.add("hidden");
  gameResult.classList.add("hidden");
}

function onDealerState() {
  continueButton.classList.add("hidden");
  newGameButton.classList.add("hidden");
  gameResult.classList.add("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function onResultState() {
  continueButton.classList.remove("hidden");
  newGameButton.classList.remove("hidden");
  gameResult.classList.remove("hidden");
  gameResult.textContent = blackjack.result;

  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

const dealerContainer = document.querySelector(".dealer .cards");
function onDealerCard(imgUrl, id) {
  let img = document.getElementById(id);
  if (!img) {
    img = document.createElement("img");
    img.setAttribute("id", id);
  }
  img.src = imgUrl;

  dealerContainer.appendChild(img);

  if (
    blackjack.currentState === Blackjack.GameState.Dealer ||
    blackjack.currentState === Blackjack.GameState.Result
  )
    dealerTotalText.textContent = blackjack.dealerTotal;
}

const playerContainer = document.querySelector(".player .cards");
function onPlayerCard(imgUrl, id) {
  let img = document.getElementById(id);
  if (!img) {
    img = document.createElement("img");
    img.setAttribute("id", id);
  }
  img.src = imgUrl;

  playerContainer.appendChild(img);
  playerTotalText.textContent = blackjack.playerTotal;
}
