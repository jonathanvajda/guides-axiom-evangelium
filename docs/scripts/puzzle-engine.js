// puzzle-engine.js
// Uses window.wordListsReady + PUZZLE_ANSWER_INDEX + PUZZLE_NEXT_BIP39_INDEX
// to drive the form logic on each puzzle page.

(async function () {
  if (!window.wordListsReady) {
    console.warn("wordListsReady not found. Did you include word-loader.js?");
    return;
  }

  const { bip39, johnMilton } = await window.wordListsReady;

  const body = document.body;
  const puzzleIdAttr = body.getAttribute("data-puzzle-id");
  if (!puzzleIdAttr) {
    console.warn("No data-puzzle-id on <body>; puzzle engine idle.");
    return;
  }

  const puzzleId = Number(puzzleIdAttr);

  const answerIndex =
    window.PUZZLE_ANSWER_INDEX && window.PUZZLE_ANSWER_INDEX[puzzleId];

  if (
    typeof answerIndex !== "number" ||
    !johnMilton ||
    !johnMilton[answerIndex]
  ) {
    console.warn("No configured johnMilton answer for puzzle", puzzleId);
    return;
  }

  const nextIndex =
    window.PUZZLE_NEXT_BIP39_INDEX &&
    window.PUZZLE_NEXT_BIP39_INDEX[puzzleId];

  const correctPhrase = johnMilton[answerIndex];
  const nextPage =
    typeof nextIndex === "number" && bip39 && bip39[nextIndex]
      ? `${bip39[nextIndex]}.html`
      : null; // null = last puzzle or intentionally no next

  function normalize(str) {
    return String(str).toUpperCase();
  }

  const normalizedCorrect = normalize(correctPhrase);

  const form = document.getElementById("puzzle-form");
  const input = document.getElementById("code-input");
  const feedback = document.getElementById("feedback");
  const nextButton = document.getElementById("next-button");
  const slotsEl = document.querySelector(".spy-code-slots");

  if (!form || !input || !feedback || !nextButton) {
    console.warn("Puzzle DOM elements missing; check IDs.");
    return;
  }

  // Adjust input length and underscore display to the true answer length
  input.maxLength = normalizedCorrect.length;
  if (slotsEl) {
    slotsEl.textContent = "_ ".repeat(normalizedCorrect.length).trimEnd();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const guessRaw = input.value || "";
    const guessNormalized = normalize(guessRaw);

    if (!guessNormalized) {
      setFeedback("Enter a code, Agent.", "error");
      shakeInput();
      return;
    }

    if (guessNormalized === normalizedCorrect) {
      setFeedback("Correct. Access granted.", "success");
      if (nextPage) {
        nextButton.hidden = false;
      } else {
        // last puzzle – you can replace this with a "mission complete" link if you like
        nextButton.hidden = true;
      }
    } else {
      setFeedback("Code rejected. Check the briefing again.", "error");
      nextButton.hidden = true;
      shakeInput();
    }
  });

  nextButton.addEventListener("click", function () {
    if (nextPage) {
      window.location.href = nextPage;
    }
  });

  function setFeedback(text, kind) {
    feedback.textContent = text;
    if (kind === "success") {
      feedback.className = "spy-feedback spy-feedback--success";
    } else if (kind === "error") {
      feedback.className = "spy-feedback spy-feedback--error";
    } else {
      feedback.className = "spy-feedback";
    }
  }

  function shakeInput() {
    input.classList.remove("shake");
    void input.offsetWidth; // restart CSS animation
    input.classList.add("shake");
  }
})();
