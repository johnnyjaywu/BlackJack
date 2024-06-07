import * as Cards from "./cards.js";
import { Player } from "./player.js";

export class Blackjack {
  constructor(stateChanged) {
    this.#stateChanged = stateChanged;
    this.#load();
  }

  //==================================================
  // PRIVATE FIELDS
  //==================================================
  #deckKey = "deck";
  #gameStateKey = "gameState";
  #resultKey = "result";
  #deckId;
  #dealer = new Player("dealer");
  #player = new Player("player", 1000);
  #stateChanged;

  //==================================================
  // Statics
  //==================================================
  static GameState = Object.freeze({
    Betting: "betting",
    Playing: "playing",
    Result: "result",
  });

  //==================================================
  // PROPERTIES
  //==================================================

  get hasSave() {
    return this.#deckId;
  }

  #currentState;
  get currentState() {
    return this.#currentState;
  }

  #displayDealer;
  set displayDealer(callback) {
    this.#displayDealer = callback;
  }

  #displayPlayer;
  set displayPlayer(callback) {
    this.#displayPlayer = callback;
  }

  get playerBank() {
    return this.#player.bank;
  }
  set playerBank(value) {
    this.#player.bank = value;
  }

  #bet = 0;
  get bet() {
    return this.#bet;
  }
  set bet(value) {
    this.#bet = value;
  }

  get dealerTotal() {
    return this.#dealer.total;
  }

  get playerTotal() {
    return this.#player.total;
  }

  #result;
  get result() {
    return this.#result;
  }

  //==================================================
  // METHODS
  //==================================================
  async newGame(resetSave = false) {
    this.#reset();
    if (resetSave) {
      this.#player.bank = 1000;
      let newDeck = await Cards.newDeck(6);
      this.#deckId = newDeck.deck_id;
    }

    this.#currentState = Blackjack.GameState.Betting;
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
    this.#save();
  }

  resume() {
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
  }

  async play() {
    // Reset the table
    this.#reset();

    // Deal first set of cards and show in order...dealer (facedown) -> player -> dealer -> player
    const cards = await Cards.drawCards(this.#deckId, 4);

    this.#dealer.deal(cards[0], false);
    this.#player.deal(cards[1]);
    this.#dealer.deal(cards[2]);
    this.#player.deal(cards[3]);

    // Hide the first card for dealer
    this.#tryDisplayDealer(0);
    this.#tryDisplayDealer(1);

    this.#tryDisplayPlayer(0);
    this.#tryDisplayPlayer(1);

    if (!this.#checkBlackjack(this.#showResult)) {
      this.#currentState = Blackjack.GameState.Playing;
      if (this.#stateChanged) this.#stateChanged(this.#currentState);
    }
    this.#save();
  }

  async hit() {
    const cards = await Cards.drawCards(this.#deckId, 1);
    this.#player.deal(cards[0]);
    this.#tryDisplayPlayer(-1);

    if (this.#player.isBust) {
      this.#result = "Player Bust!";
      this.#showResult();
    }
    this.#save();
  }

  async stand() {
    // Flip dealer's facedown card
    this.#dealer.hand[0].isShowing = true;
    this.#tryDisplayDealer(0);

    // Draw until total is > 16
    while (this.#dealer.total < 17) {
      const cards = await Cards.drawCards(this.#deckId, 1);
      this.#dealer.deal(cards[0]);
      this.#tryDisplayDealer(-1);
    }

    // Check total for result
    this.#checkResult();
  }

  displayAllCards() {
    for (let i = 0; i < this.#dealer.hand.length; ++i) {
      this.#tryDisplayDealer(i);
    }

    for (let i = 0; i < this.#player.hand.length; ++i) {
      this.#tryDisplayPlayer(i);
    }
  }

  //==================================================
  // HELPERS
  //==================================================
  #reset() {
    this.#dealer.reset();
    this.#player.reset();
  }

  #save() {
    localStorage.setItem(this.#deckKey, this.#deckId);
    localStorage.setItem(this.#gameStateKey, this.#currentState);
    localStorage.setItem(this.#resultKey, this.#result);
    this.#dealer.save();
    this.#player.save();
  }

  #load() {
    this.#deckId = localStorage.getItem(this.#deckKey);
    this.#dealer.load();
    this.#player.load();
    this.#result = localStorage.getItem(this.#resultKey);
    this.#currentState = localStorage.getItem(this.#gameStateKey);
  }

  #checkBlackjack() {
    if (this.#dealer.hasBlackjack) {
      if (this.#player.hasBlackjack) {
        this.#result = "Push!";
      } else {
        this.#result = "Dealer Blackjack!";
      }

      this.#showResult();
      return true;
    } else if (this.#player.hasBlackjack) {
      this.#result = "Player Blackjack!";
      this.#showResult(true);
      return true;
    }
    return false;
  }

  #checkResult() {
    let win;
    if (this.#dealer.isBust) {
      this.#result = "Dealer Bust!";
      win = true;
    } else if (this.#dealer.total > this.#player.total) {
      this.#result = "Dealer Won!";
      win = false;
    } else if (this.#dealer.total == this.#player.total) {
      this.#result = "Push!";
      win = false;
    } else {
      this.#result = "Player Won!";
      win = true;
    }

    this.#showResult(win);
  }

  #showResult(win) {
    // Show dealer face down card and total
    this.#dealer.hand[0].isShowing = true;
    this.#tryDisplayDealer(0);

    // Calculate bet
    if (win) {
      this.#player.bank += this.#bet * 2;
    } else if (this.#result.toLowerCase().includes("push")) {
      this.#player.bank = this.#bet;
    }
    this.#bet = 0;

    // Set result
    this.#currentState = Blackjack.GameState.Result;
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
    this.#save();
  }

  #tryDisplayDealer(index) {
    index = index < 0 ? this.#dealer.hand.length + index : index;
    if (this.#displayDealer) {
      let card = this.#dealer.hand[index];
      let id = this.#dealer.getCardId(index);
      if (card) {
        this.#displayDealer(card.isShowing ? card.image : Cards.backImgUrl, id);
      }
    }
  }

  #tryDisplayPlayer(index) {
    index = index < 0 ? this.#player.hand.length + index : index;
    if (this.#displayPlayer) {
      let card = this.#player.hand[index];
      let id = this.#player.getCardId(index);
      if (card) {
        this.#displayPlayer(card.isShowing ? card.image : Cards.backImgUrl, id);
      }
    }
  }
}
