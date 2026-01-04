// word-loader.js
// Load at runtime into arrays, and expose a single Promise: window.wordListsReady.

(function () {
  async function loadWordList(url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load word list from ${url}: ${res.status}`);
    }

    const text = await res.text();
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  window.wordListsReady = (async () => {
    const [bip39, johnMilton] = await Promise.all([
      loadWordList("english.txt"),    // 2048 BIP-39 words
      loadWordList("johnMilton.txt"), // your phrases
    ]);

    if (bip39.length !== 2048) {
      console.warn("BIP-39 list is not 2048 words; got", bip39.length);
    }

    return { bip39, johnMilton };
  })();
})();
