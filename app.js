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

import * as Cards from "./cards.js";
import { Player } from "./player.js";

//====================================================================================================
// HTML
//====================================================================================================
const dealerTotalText = document.querySelector(".dealer h2");
const playerTotalText = document.querySelector(".player h2");
const gameResult = document.querySelector("h1");

const newButton = document.querySelector("button#new");
newButton.addEventListener("click", newGame);
const contButton = document.querySelector("button#continue");
contButton.addEventListener("click", continueGame);
// const resumeButton = document.querySelector("button#resume");
// resumeButton.addEventListener("click", resumeGame);
const hitButton = document.querySelector("button#hit");
hitButton.addEventListener("click", hit);
const standButton = document.querySelector("button#stand");
standButton.addEventListener("click", stand);

//====================================================================================================
// GAME LOGIC
//====================================================================================================
const deckKey = "deck";
const dealerKey = "dealer";
const playerKey = "player";

let deckId;
let dealer = new Player("dealer", document.querySelector(".dealer .cards"));
let player = new Player("player", document.querySelector(".player .cards"));

async function newGame() {
  let newDeck = await Cards.newDeck(6);
  deckId = newDeck.deck_id;
  localStorage.setItem(deckKey, deckId);

  continueGame();
}

async function resumeGame() {
  deckId = localStorage.getItem(deckKey);
  dealer = localStorage.getItem(dealerKey);
  player = localStorage.getItem(playerKey);
  continueGame();
}

async function continueGame() {
  resetGame();

  // Deal first set of cards and show in order...dealer (facedown) -> player -> dealer -> player
  const cards = await Cards.drawCards(deckId, 4);
  dealer.deal(cards[0], false);
  player.deal(cards[1]);
  dealer.deal(cards[2]);
  player.deal(cards[3]);

  // Save
  player.save();
  dealer.save();

  // Show player's current score
  playerTotalText.textContent = player.total;

  if (!checkBlackjack(showResult)) {
    // Show buttons to play
    hitButton.classList.remove("hidden");
    standButton.classList.remove("hidden");
  }
}

async function hit() {
  const cards = await Cards.drawCards(deckId, 1);
  player.deal(cards[0]);
  playerTotalText.textContent = player.total;
  if (player.isBust) {
    showResult("Player Bust!");
  }
}

async function stand() {
  // Hide buttons so user won't accidentally press twice
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");

  // Flip dealer's facedown card
  dealer.show(0);

  // show total
  dealerTotalText.textContent = dealer.total;

  // Draw until total is > 16
  while (dealer.total < 17) {
    const cards = await Cards.drawCards(deckId, 1);
    dealer.deal(cards[0]);
    dealerTotalText.textContent = dealer.total;
  }

  // Check total for result
  checkResult();
}

function checkBlackjack() {
  let result;
  if (dealer.hasBlackjack) {
    // Show dealer face down card and total
    dealer.show(0);
    dealerTotalText.textContent = dealer.total;

    if (player.hasBlackjack) {
      result = "Push!";
    } else {
      result = "Dealer Blackjack!";
    }

    showResult(result);
    return true;
  } else if (player.hasBlackjack) {
    // Show dealer face down card and total
    dealer.show(0);
    dealerTotalText.textContent = dealer.total;

    result = "Player Blackjack!";
    showResult(result, true);
    return true;
  }
  return false;
}

function checkResult() {
  let result, win;
  if (dealer.isBust) {
    result = "Dealer Bust!";
    win = true;
  } else if (dealer.total > player.total) {
    result = "Dealer Won!";
    win = false;
  } else if (dealer.total == player.total) {
    result = "Push!";
    win = false;
  } else {
    result = "Player Won!";
    win = true;
  }

  showResult(result, win);
}

function showResult(result, win) {
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
  gameResult.classList.remove("hidden");
  newButton.classList.remove("hidden");
  contButton.classList.remove("hidden");
  gameResult.textContent = result;
}

function resetGame() {
  // Essentially, Nothing should be showing here
  dealer.reset();
  player.reset();

  // Remove scores
  dealerTotalText.textContent = "";
  playerTotalText.textContent = "";

  // Hide result text
  gameResult.textContent = "";
  gameResult.classList.add("hidden");

  // Hide buttons
  newButton.classList.add("hidden");
  contButton.classList.add("hidden");
}
