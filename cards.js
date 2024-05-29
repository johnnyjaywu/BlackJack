export async function newDeck(deckCount, shuffled = true) {
  let response = await fetch(
    `https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`
  );
  let data = await response.json();
  // {
  //     "success": true,
  //     "deck_id": "3p40paa87x90",
  //     "shuffled": true,
  //     "remaining": 52
  // }
  return data;
}

export async function drawCards(deckId, cardCount) {
  let response = await fetch(
    `https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=${cardCount}`
  );
  let data = await response.json();
  // {
  //     "success": true,
  //     "deck_id": "kxozasf3edqu",
  //     "cards": [
  //         {
  //             "code": "6H",
  //             "image": "https://deckofcardsapi.com/static/img/6H.png",
  //             "images": {
  //                           "svg": "https://deckofcardsapi.com/static/img/6H.svg",
  //                           "png": "https://deckofcardsapi.com/static/img/6H.png"
  //                       },
  //             "value": "6",
  //             "suit": "HEARTS"
  //         },
  //         {
  //             "code": "5S",
  //             "image": "https://deckofcardsapi.com/static/img/5S.png",
  //             "images": {
  //                           "svg": "https://deckofcardsapi.com/static/img/5S.svg",
  //                           "png": "https://deckofcardsapi.com/static/img/5S.png"
  //                       },
  //             "value": "5",
  //             "suit": "SPADES"
  //         }
  //     ],
  //     "remaining": 50
  // }
  return data.cards.map((card) => new Card(card));
}

export const backImgUrl = "https://www.deckofcardsapi.com/static/img/back.png";

export function Card(data, show = true) {
  this.isShowing = show;

  Object.defineProperty(this, "value", {
    get() {
      return data.value;
    },
  });

  Object.defineProperty(this, "number", {
    get() {
      switch (data.value) {
        case "ACE":
          return 11;
        case "JACK":
        case "QUEEN":
        case "KING":
          return 10;
        default:
          return Number(data.value);
      }
    },
  });

  Object.defineProperty(this, "image", {
    get() {
      return data.image;
    },
  });

  Object.defineProperty(this, "backImage", {
    get() {
      return backImgUrl;
    },
  });

  Object.defineProperty(this, "data", {
    get() {
      return data;
    },
    enumerable: true,
  });
}
