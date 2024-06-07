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

const blackjack = new Blackjack(onStateChanged);

function onStateChanged(state) {
  switch (state) {
    case Blackjack.GameState.Betting:
      onBetting();
      break;
    case Blackjack.GameState.Playing:
      onPlaying();
      break;
    case Blackjack.GameState.Result:
      onResult();
      break;
    default:
      break;
  }
}

const newGameButton = document.querySelector("button#new");
newGameButton.addEventListener("click", () => {
  title.classList.add("hidden");
  blackjack.newGame(true);
});

const resumeButton = document.querySelector("button#resume");
resumeButton.addEventListener("click", () => {
  title.classList.add("hidden");
  blackjack.resume();
});

const title = document.querySelector("#title");
// Check if there is a save
if (blackjack.hasSave) resumeButton.classList.remove("hidden");
else resumeButton.classList.add("hidden");

//====================================================================================================
// BETTING
//====================================================================================================

const nav = document.querySelector("nav");
const betting = document.querySelector("#betting");
const bankText = document.querySelector("#bank");
const betText = document.querySelector("#bet");

const confirmButton = document.querySelector("button#confirm");
confirmButton.addEventListener("click", () => {
  betting.classList.add("hidden");
  blackjack.play();
});

const cancelButton = document.querySelector("button#cancel");
cancelButton.addEventListener("click", () => {
  bet(-blackjack.bet);
});

document.querySelectorAll("button.chip").forEach((chip) => {
  chip.addEventListener("click", (event) => {
    let amount = Number(event.target.textContent);
    amount = Math.min(amount, blackjack.playerBank);

    bet(amount);
  });
});

document.querySelector("#allin").addEventListener("click", () => {
  bet(blackjack.playerBank);
});

function bet(amount) {
  blackjack.bet += amount;
  blackjack.playerBank -= amount;

  betText.textContent = `\$${blackjack.bet}`;
  bankText.textContent = `\$${blackjack.playerBank}`;

  if (blackjack.bet > 0) {
    confirmButton.classList.remove("hidden");
    cancelButton.classList.remove("hidden");
  } else {
    confirmButton.classList.add("hidden");
    cancelButton.classList.add("hidden");
  }
}

function onBetting() {
  nav.classList.remove("hidden");
  betting.classList.remove("hidden");

  // Set the bank

  bankText.textContent = `\$${blackjack.playerBank}`;

  // Set initial bet value as 0
  bet(0);
}

//====================================================================================================
// PLAYING
//====================================================================================================
const playing = document.querySelector("#playing");

const hitButton = document.querySelector("button#hit");
hitButton.addEventListener("click", () => blackjack.hit());

const standButton = document.querySelector("button#stand");
standButton.addEventListener("click", () => {
  blackjack.stand();
});

const playerTotalText = document.querySelector("#player h2");
function onPlaying() {
  blackjack.displayAllCards();
  nav.classList.remove("hidden");
  playing.classList.remove("hidden");
  hitButton.classList.remove("hidden");
  standButton.classList.remove("hidden");
  continueButton.classList.add("hidden");
}

//====================================================================================================
// RESULT
//====================================================================================================

const dealerTotalText = document.querySelector("#dealer h2");
const gameResult = document.querySelector("h1#result");

const continueButton = document.querySelector("#continue");
continueButton.addEventListener("click", () => {
  gameResult.textContent = "";
  if (blackjack.playerBank > 0) blackjack.newGame();
  else blackjack.newGame(true);
});

function onResult() {
  blackjack.displayAllCards();

  nav.classList.remove("hidden");
  playing.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");

  gameResult.classList.remove("hidden");
  gameResult.textContent = blackjack.result;
  bankText.textContent = `\$${blackjack.playerBank}`;
  betText.textContent = `\$${blackjack.bet}`;

  continueButton.classList.remove("hidden");
  if (blackjack.playerBank <= 0) {
    continueButton.textContent = "New Game";
  } else {
    continueButton.textContent = "Continue";
  }
}

//====================================================================================================
// HELPERS
//====================================================================================================
// Callback function to display dealer's cards
const dealerContainer = document.querySelector("#dealer .cards");
blackjack.displayDealer = onShowDealerCard;
function onShowDealerCard(imgUrl, id) {
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
  ) {
    dealerTotalText.textContent = blackjack.dealerTotal;
  } else {
    dealerTotalText.textContent = "Dealer";
  }
}

// Callback function to display player's cards
const playerContainer = document.querySelector("#player .cards");
blackjack.displayPlayer = onShowPlayerCard;
function onShowPlayerCard(imgUrl, id) {
  let img = document.getElementById(id);
  if (!img) {
    img = document.createElement("img");
    img.setAttribute("id", id);
  }
  img.src = imgUrl;

  playerContainer.appendChild(img);
  playerTotalText.textContent = blackjack.playerTotal;
}
