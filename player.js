export function Player(name) {
  let hand = [];
  let total = 0;
  this.name = name;

  this.reset = function () {
    for (let i = 0; i < hand.length; ++i) {
      document.getElementById(this.getCardId(i))?.remove();
    }
    hand = [];
    total = 0;
  };

  this.deal = function (card) {
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

  this.load = function() {
    let loaded = localStorage.getItem(this.name);
    if (loaded) {
      this.hand = loaded.hand;
      this.total = loaded.total;
      this.name = loaded.name;
    }
  }

  this.getCardId = function (index) {
    return `${this.name}${index}`;
  };

  Object.defineProperty(this, "hand", {
    get() {
      return hand;
    },
  });

  Object.defineProperty(this, "total", {
    get() {
      return total;
    },
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
