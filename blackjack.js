import * as Cards from "./cards.js";
import { Player } from "./player.js";

export class Blackjack {
  //==================================================
  // PRIVATE FIELDS
  //==================================================
  #deckKey = "deck";
  #gameStateKey = "gameState";
  #deckId;
  #dealer = new Player("dealer");
  #player = new Player("player");

  //==================================================
  // Statics
  //==================================================
  static GameState = Object.freeze({
    Initial: Symbol("initial"),
    Betting: Symbol("betting"),
    Player: Symbol("player"),
    Dealer: Symbol("dealer"),
    Result: Symbol("result"),
  });

  //==================================================
  // PROPERTIES
  //==================================================

  #currentState;
  get currentState() {
    return this.#currentState;
  }

  #stateChanged;
  set stateChanged(callback) {
    this.#stateChanged = callback;
  }

  #displayDealer;
  set displayDealer(callback) {
    this.#displayDealer = callback;
  }

  #displayPlayer;
  set displayPlayer(callback) {
    this.#displayPlayer = callback;
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
  async newGame() {
    this.#reset();
    let newDeck = await Cards.newDeck(6);
    this.#deckId = newDeck.deck_id;
    
    this.#currentState = Blackjack.GameState.Betting;
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
    this.#save();
  }

  load() {
    this.#deckId = localStorage.getItem(this.#deckKey);
    if (!this.#deckId) return;

    this.#dealer.load();
    this.#player.load();
    this.#currentState = localStorage.getItem(this.#gameStateKey);
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
  }

  async play() {
    // Reset the table
    this.#reset();

    // Deal first set of cards and show in order...dealer (facedown) -> player -> dealer -> player
    const cards = await Cards.drawCards(this.#deckId, 4);

    this.#dealer.deal(cards[0]);
    this.#player.deal(cards[1]);
    this.#dealer.deal(cards[2]);
    this.#player.deal(cards[3]);

    // Hide the first card for dealer
    this.#tryDisplayDealer(0, false);
    this.#tryDisplayDealer(1);

    this.#tryDisplayPlayer(0);
    this.#tryDisplayPlayer(1);

    if (!this.#checkBlackjack(this.#showResult)) {
      this.#currentState = Blackjack.GameState.Player;
      if (this.#stateChanged) this.#stateChanged(this.#currentState);
    }
    this.#save();
  }

  async hit() {
    const cards = await Cards.drawCards(this.#deckId, 1);
    this.#player.deal(cards[0]);
    this.#tryDisplayPlayer(-1);
    this.#player.save();

    if (this.#player.isBust) {
      this.#result = "Player Bust!";
      this.#showResult();
    }
    this.#save();
  }

  async stand() {
    this.#currentState = Blackjack.GameState.Dealer;
    if (this.#stateChanged) this.#stateChanged(this.#currentState);

    // Flip dealer's facedown card
    this.#tryDisplayDealer(0);

    // Draw until total is > 16
    while (this.#dealer.total < 17) {
      const cards = await Cards.drawCards(this.#deckId, 1);
      this.#dealer.deal(cards[0]);
      this.#tryDisplayDealer(-1);
    }

    // Check total for result
    this.#checkResult();

    this.#save();
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
    this.#dealer.save();
    this.#player.save();
  }

  #checkBlackjack() {
    if (this.#dealer.hasBlackjack) {
      // Show dealer face down card and total
      this.#tryDisplayDealer(0);

      if (this.#player.hasBlackjack) {
        this.#result = "Push!";
      } else {
        this.#result = "Dealer Blackjack!";
      }

      this.#showResult();
      return true;
    } else if (this.#player.hasBlackjack) {
      this.#tryDisplayDealer(0);

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
    this.#currentState = Blackjack.GameState.Result;
    if (this.#stateChanged) this.#stateChanged(this.#currentState);
    this.#save();
  }

  #tryDisplayDealer(index, show = true) {
    index = index < 0 ? this.#dealer.hand.length + index : index;
    if (this.#displayDealer) {
      this.#displayDealer(
        show ? this.#dealer.hand[index].image : Cards.backImgUrl,
        this.#dealer.getCardId(index)
      );
    }
  }

  #tryDisplayPlayer(index, show = true) {
    index = index < 0 ? this.#player.hand.length + index : index;
    if (this.#displayPlayer) {
      this.#displayPlayer(
        show ? this.#player.hand[index].image : Cards.backImgUrl,
        this.#player.getCardId(index)
      );
    }
  }
}
