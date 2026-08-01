/* Configuration */
const CONFIG = {
  password: "27/01/2024",

    letter: `
    Long-distance love sometimes reminds me of the sky and the sea.

Every day, the sky and the sea see each other. They exist in the same world, sharing every sunrise, every sunset, and every star-filled night. They always seem so close, yet they can never truly touch. That's what long-distance feels like to me. We wake up under the same sky, knowing we're thinking of each other, yet miles keep us apart. Even so, distance has never been able to lessen what I feel for you. Love is still there, just as endless as the horizon where the sky meets the sea.

Sometimes, I think of us as a fish and a cat.

We belong to two different worlds, each living in a place the other can't fully reach. But if I were that fish, I'd hold my breath for as long as I could, just to spend one more moment with you. I'd swim as close as I possibly could, because every second with you is worth it. The only thing standing between us isn't our love—it's the distance. And one day, even that distance won't be enough to keep us apart.

Long-distance is never what I wanted for us, but if loving you means waiting, then waiting is something I'll gladly do. Because no matter how many miles separate us today, every day that passes brings us one step closer to the moment I can finally hold your hand instead of just imagining it.  
  `,
};

/* Elements */
const passwordScreen = document.getElementById("passwordScreen");
const letterScreen = document.getElementById("letterScreen");
const progressBar = document.getElementById("progressBar");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordMessage = document.getElementById("passwordMessage");
const ambientHearts = document.getElementById("ambientHearts");
const letterText = document.getElementById("letterText");
const letterSignoff = document.getElementById("letterSignoff");

/* Loading Screen */
function startLoading() {
  window.requestAnimationFrame(() => {
    progressBar.style.width = "100%";
  });

  window.setTimeout(() => {
    showScreen(passwordScreen);
    passwordInput.focus();
  }, 2450);
}

/* Password Screen */
function handlePasswordSubmit(event) {
  event.preventDefault();

  const isCorrect = normalizeDate(passwordInput.value) === normalizeDate(CONFIG.password);

  if (!isCorrect) {
    passwordMessage.textContent = "That's not our special day ❤️";
    passwordForm.classList.remove("is-shaking");
    void passwordForm.offsetWidth;
    passwordForm.classList.add("is-shaking");
    return;
  }

  passwordMessage.textContent = "";
  passwordForm.classList.add("is-unlocked");
  createHeartBurst(passwordForm);

  window.setTimeout(() => {
    showScreen(letterScreen);
    startTypewriter();
  }, 720);
}

function normalizeDate(value) {
  return String(value || "").replace(/\D/g, "");
}

/* Letter Screen */
function startTypewriter() {
  const copy = CONFIG.letter.trim();
  letterText.textContent = "";
  letterText.classList.remove("is-finished");
  letterSignoff.classList.remove("is-visible");

  if (!copy) {
    finishLetter();
    return;
  }

  let index = 0;

  function typeNextCharacter() {
    letterText.textContent = copy.slice(0, index);
    index += 1;

    if (index <= copy.length) {
      window.setTimeout(typeNextCharacter, 42);
      return;
    }

    finishLetter();
  }

  typeNextCharacter();
}

function finishLetter() {
  letterText.classList.add("is-finished");
  window.setTimeout(() => {
    letterSignoff.classList.add("is-visible");
    letterSignoff.setAttribute("aria-hidden", "false");
  }, 240);
}

/* Screen Transitions */
function showScreen(nextScreen) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen === nextScreen);
  });
}

/* Floating Hearts */
function createFloatingHeart() {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = Math.random() > 0.35 ? "♥" : "♡";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty("--size", `${14 + Math.random() * 18}px`);
  heart.style.setProperty("--duration", `${8 + Math.random() * 5}s`);
  heart.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
  heart.style.setProperty("--rotation", `${-28 + Math.random() * 56}deg`);
  ambientHearts.appendChild(heart);

  heart.addEventListener("animationend", () => heart.remove());
}

function createHeartBurst(origin) {
  const bounds = origin.getBoundingClientRect();

  for (let i = 0; i < 14; i += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "♥";
    heart.style.left = `${bounds.left + bounds.width / 2}px`;
    heart.style.bottom = `${window.innerHeight - bounds.top - bounds.height / 2}px`;
    heart.style.setProperty("--size", `${20 + Math.random() * 18}px`);
    heart.style.setProperty("--duration", `${2.2 + Math.random() * 0.8}s`);
    heart.style.setProperty("--drift", `${-150 + Math.random() * 300}px`);
    heart.style.setProperty("--rotation", `${-42 + Math.random() * 84}deg`);
    ambientHearts.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

function startAmbientHearts() {
  for (let i = 0; i < 8; i += 1) {
    window.setTimeout(createFloatingHeart, i * 350);
  }

  window.setInterval(createFloatingHeart, 1500);
}

/* Initialization */
document.addEventListener("DOMContentLoaded", () => {
  startAmbientHearts();
  startLoading();
  passwordForm.addEventListener("submit", handlePasswordSubmit);
});
