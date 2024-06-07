import { Card } from "./cards.js";

export function Player(name, bank) {
  let hand = [];
  let total = 0;
  this.name = name;
  this.bank = bank;

  this.reset = function () {
    for (let i = 0; i < hand.length; ++i) {
      document.getElementById(this.getCardId(i))?.remove();
    }
    hand = [];
    total = 0;
  };

  this.deal = function (card, show = true) {
    card.isShowing = show;
    hand.push(card);

    // Calculate total
    total = hand.reduce((acc, card) => (acc += card.number), 0);

    if (total > 21) {
      hand
        .filter((card) => card.value === "ACE")
        .forEach((ace) => (total -= 10));
    }
  };

  this.save = function () {
    localStorage.setItem(this.name, JSON.stringify(this));
  };

  this.load = function () {
    let loaded = JSON.parse(localStorage.getItem(this.name));
    if (loaded) {

      this.name = loaded.name;
      this.bank = loaded.bank;

      // Create new Card from raw data
      loaded.hand.forEach((card) => hand.push(new Card(card.data, card.isShowing)));
      
      // Calculate total
      total = hand.reduce((acc, card) => (acc += card.number), 0);

      if (total > 21) {
        hand
          .filter((card) => card.value === "ACE")
          .forEach((ace) => (total -= 10));
      }
    }
  };

  this.getCardId = function (index) {
    return `${this.name}${index}`;
  };

  Object.defineProperty(this, "hand", {
    get() {
      return hand;
    },
    enumerable: true,
  });

  Object.defineProperty(this, "total", {
    get() {
      return total;
    },
    enumerable: true,
  });

  Object.defineProperty(this, "hasBlackjack", {
    get() {
      return (
        hand.length === 2 &&
        ((hand[0].value === "ACE" && hand[1].number === 10) ||
          (hand[1].value === "ACE" && hand[0].number === 10))
      );
    },
  });

  Object.defineProperty(this, "isBust", {
    get() {
      return total > 21;
    },
  });
}
