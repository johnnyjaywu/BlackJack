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

// TODO: Separate Player and Dealer logic to its own object/module
// TODO: Implement local storage save/load logic

import * as Cards from "./cards.js";

//====================================================================================================
// HTML
//====================================================================================================
const dealerCardsContainer = document.querySelector(".dealer .cards");
const playerCardsContainer = document.querySelector(".player .cards");
const dealerScoreText = document.querySelector(".dealer h2");
const playerScoreText = document.querySelector(".player h2");
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
let dealer = [];
let player = [];
let dealerScore = 0;
let playerScore = 0;

async function newGame() {
  // Get new deck
  let newDeck = await Cards.newDeck(6);
  deckId = newDeck.deck_id;
  localStorage.setItem(deckKey, deckId);

  continueGame();
}

async function resumeGame() {
  deckId = localStorage.getItem(deckKey);
  dealer = localStorage.getItem(dealerKey);
  player = localStorage.getItem(playerKey);
}

async function continueGame() {
  resetGame();

  // Deal first set of cards
  const drawRes = await Cards.drawCards(deckId, 4);
  dealer.push(drawRes.cards[0]);
  player.push(drawRes.cards[1]);
  dealer.push(drawRes.cards[2]);
  player.push(drawRes.cards[3]);

  // Save
  localStorage.setItem(dealerKey, dealer);
  localStorage.setItem(playerKey, player);

  // Show the cards in order...dealer (facedown) -> player -> dealer -> player
  showDealerCard(0, true);
  showPlayerCard(0);
  showDealerCard(1);
  showPlayerCard(1);

  // Check for blackjack
  if (isBlackjack(dealer[0].value, dealer[1].value)) {
    if (isBlackjack(player[0].value, player[1].value)) {
      endGame("Push!");
    } else {
      endGame("Dealer Won!");
    }
  } else if (isBlackjack(player[0].value, player[1].value)) {
    endGame("Blackjack!", true);
  } else {
    // Show player's current score
    showPlayerScore();

    // Show buttons
    hitButton.classList.remove("hidden");
    standButton.classList.remove("hidden");
  }
}

async function hit() {
  const drawRes = await Cards.drawCards(deckId, 1);
  player.push(drawRes.cards[0]);
  showPlayerCard(player.length - 1);
  showPlayerScore();
}

async function stand() {
  showDealerScore();
  while (dealerScore < 17) {
    const drawRes = await Cards.drawCards(deckId, 1);
    dealer.push(drawRes.cards[0]);
    showDealerCard(dealer.length - 1);
    showDealerScore();
  }
  if (dealerScore > 21) endGame("Dealer Bust!", true);
  else if (dealerScore > playerScore) endGame("Dealer Won!");
  else if (dealerScore === playerScore) endGame("Push!");
  else endGame("Player Won!", true);
}

function cardToValue(cardValue) {
  switch (cardValue) {
    case "ACE":
      return 11;
    case "JACK":
    case "QUEEN":
    case "KING":
      return 10;
    default:
      return Number(cardValue);
  }
}

function isBlackjack(card1, card2) {
  return (
    (card1 === "ACE" && cardToValue(card2) === 10) ||
    (card2 === "ACE" && cardToValue(card1) === 10)
  );
}

function endGame(result, win = false) {
  showDealerScore();
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
  gameResult.classList.remove("hidden");
  newButton.classList.remove("hidden");
  contButton.classList.remove("hidden");
  gameResult.textContent = result;
}

function resetGame() {
  // Essentially, Nothing should be showing here

  // Remove all cards
  for (let i = 0; i < player.length; ++i) {
    document.getElementById(`player${i}`)?.remove();
  }
  for (let i = 0; i < dealer.length; ++i) {
    document.getElementById(`dealer${i}`)?.remove();
  }
  dealer = [];
  player = [];

  // Remove scores
  dealerScoreText.textContent = "";
  playerScoreText.textContent = "";

  // Hide result text
  gameResult.textContent = "";
  gameResult.classList.add("hidden");

  // Hide buttons
  newButton.classList.add("hidden");
  contButton.classList.add("hidden");
}

function showDealerCard(cardIndex, hide = false) {
  // check if card already exist
  const img = document.getElementById(`dealer${cardIndex}`);
  if (img) {
    img.src = hide ? Cards.backImgUrl : dealer[cardIndex].image;
  } else {
    const newImg = document.createElement("img");
    newImg.setAttribute("id", `dealer${cardIndex}`);
    dealerCardsContainer.appendChild(newImg);
    newImg.src = hide ? Cards.backImgUrl : dealer[cardIndex].image;
  }
}

function showPlayerCard(cardIndex) {
  // check if card already exist
  const img = document.getElementById(`player${cardIndex}`);
  if (img) {
    img.src = player[cardIndex].image;
  } else {
    const newImg = document.createElement("img");
    newImg.setAttribute("id", `player${cardIndex}`);
    playerCardsContainer.appendChild(newImg);
    newImg.src = player[cardIndex].image;
  }
}

function showPlayerScore() {
  let total = player.reduce((acc, card) => (acc += cardToValue(card.value)), 0);

  if (total > 21) {
    player
      .filter((card) => card.value === "ACE")
      .forEach((ace) => (total -= 10));
  }
  playerScoreText.textContent = total;

  if (total > 21) endGame("Player Bust!");
  playerScore = total;
}

function showDealerScore() {
  showDealerCard(0);
  let total = dealer.reduce((acc, card) => (acc += cardToValue(card.value)), 0);
  if (total > 21) {
    dealer
      .filter((card) => card.value === "ACE")
      .forEach((ace) => (total -= 10));
  }
  dealerScoreText.textContent = total;
  dealerScore = total;
}
