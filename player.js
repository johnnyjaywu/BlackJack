export function Player(name, container) {
  let hand = [];
  let total = 0;
  this.name = name;
  this.container = container;

  this.reset = function () {
    for (let i = 0; i < hand.length; ++i) {
      document.getElementById(`${this.name}${i}`)?.remove();
    }
    hand = [];
    total = 0;
  };

  this.deal = function (card, show = true) {
    hand.push(card);

    // Show the card
    if (show) this.show();
    else this.hide();
    // Calculate total
    total = hand.reduce((acc, card) => (acc += card.number), 0);

    if (total > 21) {
      hand
        .filter((card) => card.value === "ACE")
        .forEach((ace) => (total -= 10));
    }
  };

  this.show = function (index = -1) {
    index = index < 0 ? hand.length + index : index;
    if (hand && index < hand.length) {
      let id = `${this.name}${index}`;
      let img = document.getElementById(`${id}`);
      if (!img) {
        img = document.createElement("img");
        img.setAttribute("id", `${id}`);
        if (this.container) this.container.appendChild(img);
      }
      img.src = hand[index].image;
    }
  };

  this.hide = function (index = -1) {
    index = index < 0 ? hand.length + index : index;
    if (hand && index < hand.length) {
      let id = `${this.name}${index}`;
      let img = document.getElementById(`${id}`);
      if (!img) {
        img = document.createElement("img");
        img.setAttribute("id", `${id}`);
        if (this.container) this.container.appendChild(img);
      }
      img.src = hand[index].backImage;
    }
  };

  this.save = function () {
    localStorage.setItem(this.name, this);
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
