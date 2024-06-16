
# My Awesome Project
A 100Devs project using Deck of Cards API https://www.deckofcardsapi.com/ to create a [Simple Blackjack](https://johnnyjaywu.github.io/blackjack/) app.
Currently features:
- simple betting
- basic mechanics of "hit" or "stand"
- persistent data using local storage

Missing features:
- advanced mechanics of "split" or "insurance"
- display of alternate hand value when one or more Ace is present
- card stacking to prevent overflowing viewport
- cool animations


## How It's Made:

**Tech stack:** HTML, CSS, JavaScript

This is an educational project to help practice API usage, OOP, and other best-practice design principles (DRY, KISS, YAGNI)

## Optimizations
Aside from missing features and general optimizations ("cleaning up" the code), a lag is noticeable whenever cards are being drawn to the screen. I speculate this is probably due to dynamically downloading the images of each card whenever a request is made. A caching system is a possiblity to prevent this.

## Lessons Learned:
JavaScript OOP, async/await, and module usages with import/export.



