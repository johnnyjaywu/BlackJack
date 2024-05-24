// 1. Use Deck of Cards API to implement black jack game
// 2. Button to start a new or resume previous game
// 3. Once game is started, it does not stop until "new game" is pressed

// Blackjack Game
// 1. Get a shuffled 6-decks cards and store deck ID
// 2. Deal 1 card to player, then 1 card face-down to dealer
// 3. Deal 1 more to player, and 1 face-up to dealer
//  3b. If dealer has black-jack, check for win/lose/push immediately
// 4. Show "stand" and "hit" button
// 5. If "hit" is pressed, deal 1 card to player
// 6. If "stand" is pressed, deal card to dealer until over 16 or bust
// 7. Check for winner, and keep track of "win", "losses", "push"
// 8. If there are still cards, go to step 2, otherwise step 1

// *ignore split and insurance for now
// **ignore bets for now
// ***ignore "burn" cards

import * as Cards from "./cards.js";

//====================================================================================================
// HTML
//====================================================================================================

const dealerContainer = document.querySelector(".container.dealer");
const playerContainer = document.querySelector(".container.player");
const dealerScoreText = document.querySelector(".container.dealer h3");
const playerScoreText = document.querySelector(".container.player h3");
const gameResult = document.querySelector("h4");

const newButton = document.querySelector("button#new");
newButton.addEventListener("click", newGame);
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
  clearGame();

  // Get new deck
  let newDeck = await Cards.newDeck(6);
  deckId = newDeck.deck_id;
  localStorage.setItem(deckKey, deckId);

  // Deal first set of cards
  const drawRes = await Cards.drawCards(deckId, 4);

  // Reset player and dealer
  dealer = [];
  player = [];
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
      push();
    } else {
      lose();
    }
  } else if (isBlackjack(player[0].value, player[1].value)) {
    playerBlackjack();
  }

  showPlayerScore();

  // Show buttons
  hitButton.classList.remove("hidden");
  standButton.classList.remove("hidden");
}

async function resumeGame() {
  deckId = localStorage.getItem(deckKey);
  dealer = localStorage.getItem(dealerKey);
  player = localStorage.getItem(playerKey);
}

async function hit() {
  const drawRes = await Cards.drawCards(deckId, 1);
  player.push(drawRes.cards[0]);
  showPlayerCard(player.length - 1);

  // Display score
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
  if (dealerScore > 21) win();
  else if (dealerScore > playerScore) lose();
  else if (dealerScore === playerScore) push();
  else win();
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

function bust() {
  gameResult.textContent = "Bust!";
  newButton.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function push() {
  gameResult.textContent = "Push!";
  newButton.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function lose() {
  gameResult.textContent = "Dealer Wins!";
  newButton.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function win() {
  gameResult.textContent = "Win!";
  newButton.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function playerBlackjack() {
  gameResult.textContent = "Blackjack!";
  newButton.classList.remove("hidden");
  hitButton.classList.add("hidden");
  standButton.classList.add("hidden");
}

function clearGame() {
  for (let i = 0; i < player.length; ++i) {
    document.getElementById(`player${i}`)?.remove();
  }
  for (let i = 0; i < dealer.length; ++i) {
    document.getElementById(`dealer${i}`)?.remove();
  }
  dealerScoreText.textContent = "";
  playerScoreText.textContent = "";
  gameResult.textContent = "";
  newButton.classList.add("hidden");
}

function showDealerCard(cardIndex, hide = false) {
  // check if card already exist
  const img = document.getElementById(`dealer${cardIndex}`);
  if (img) {
    img.src = hide ? Cards.backImgUrl : dealer[cardIndex].image;
  } else {
    const newImg = document.createElement("img");
    newImg.setAttribute("id", `dealer${cardIndex}`);
    dealerContainer.appendChild(newImg);
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
    playerContainer.appendChild(newImg);
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

  if (total > 21) bust();
  playerScore = total;
}

function showDealerScore() {
  showDealerCard(0);
  let total = dealer.reduce((acc, card) => (acc += cardToValue(card.value)), 0);
  if (total > 21) {
    player
      .filter((card) => card.value === "ACE")
      .forEach((ace) => (total -= 10));
  }
  dealerScoreText.textContent = total;
  dealerScore = total;
}
