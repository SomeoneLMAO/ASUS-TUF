/* Global Configuration */
const ANNIVERSARY_DATE = "2024-02-14";
const TYPEWRITER_COPY = "Hi my love...";
const PASSWORD_ALIASES = new Set([
  ANNIVERSARY_DATE,
  "14/02/2024",
  "02/14/2024",
  "14022024",
  "02142024",
  "20240214",
].map(compactDate));

/* Library Fallbacks */
const motion = window.gsap || {
  to(target, vars = {}) {
    applyImmediate(target, vars);
    if (typeof vars.onComplete === "function") window.setTimeout(vars.onComplete, 0);
    return { kill() {} };
  },
  fromTo(target, fromVars = {}, toVars = {}) {
    applyImmediate(target, fromVars);
    applyImmediate(target, toVars);
    if (typeof toVars.onComplete === "function") window.setTimeout(toVars.onComplete, 0);
    return { kill() {} };
  },
  from(target, vars = {}) {
    applyImmediate(target, vars);
    if (typeof vars.onComplete === "function") window.setTimeout(vars.onComplete, 0);
    return { kill() {} };
  },
  set(target, vars = {}) {
    applyImmediate(target, vars);
  },
  delayedCall(delay, callback) {
    const id = window.setTimeout(callback, delay * 1000);
    return { kill: () => window.clearTimeout(id) };
  },
  killTweensOf() {},
};

function applyImmediate(target, vars) {
  const targets = normalizeTargets(target);
  targets.forEach((node) => {
    if (!node || !node.style) return;
    if (vars.opacity !== undefined) node.style.opacity = vars.opacity;
    if (vars.display !== undefined) node.style.display = vars.display;
    if (vars.width !== undefined) node.style.width = withUnit(vars.width);
    if (vars.pointerEvents !== undefined) node.style.pointerEvents = vars.pointerEvents;
    if (vars.boxShadow !== undefined) node.style.boxShadow = vars.boxShadow;
    const transforms = [];
    if (vars.x !== undefined) transforms.push(`translateX(${withUnit(vars.x)})`);
    if (vars.y !== undefined) transforms.push(`translateY(${withUnit(vars.y)})`);
    if (vars.scale !== undefined) transforms.push(`scale(${vars.scale})`);
    if (vars.rotate !== undefined) transforms.push(`rotate(${vars.rotate}deg)`);
    if (vars.rotationY !== undefined) transforms.push(`rotateY(${vars.rotationY}deg)`);
    if (transforms.length) node.style.transform = transforms.join(" ");
  });
}

function normalizeTargets(target) {
  if (!target) return [];
  if (typeof target === "string") return Array.from(document.querySelectorAll(target));
  if (target instanceof NodeList || Array.isArray(target)) return Array.from(target);
  return [target];
}

function withUnit(value) {
  return typeof value === "number" ? `${value}px` : value;
}

/* App State */
const scenes = Array.from(document.querySelectorAll(".scene"));
const ambientHearts = document.getElementById("ambientHearts");
const progressBar = document.getElementById("progressBar");
const loader = document.getElementById("loader");
let currentScene = document.querySelector(".scene.is-active");
let hasTypedIntro = false;
let secretPreviewPlayed = false;
let nightAnimationId = null;

/* Loading Screen */
function initLoader() {
  motion.to(".loader__heart", {
    scale: 1.16,
    duration: 0.55,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });

  motion.to(progressBar, {
    width: "100%",
    duration: 1.9,
    ease: "power2.out",
    onComplete: hideLoader,
  });
}

function hideLoader() {
  if (!loader || loader.dataset.done === "true") return;
  loader.dataset.done = "true";
  motion.to(loader, {
    opacity: 0,
    duration: 0.65,
    ease: "power2.inOut",
    onComplete: () => {
      loader.style.display = "none";
      animateSceneIn(currentScene);
    },
  });
}

/* Background Effects */
function initParticles() {
  if (!window.particlesJS) return;
  window.particlesJS("particles-js", {
    particles: {
      number: { value: 42, density: { enable: true, value_area: 900 } },
      color: { value: ["#f6a8c8", "#f4c76b", "#d9ceff"] },
      shape: { type: "circle" },
      opacity: { value: 0.32, random: true },
      size: { value: 3.2, random: true },
      line_linked: { enable: true, distance: 145, color: "#f6a8c8", opacity: 0.16, width: 1 },
      move: { enable: true, speed: 0.75, direction: "none", random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: false }, onclick: { enable: false }, resize: true },
    },
    retina_detect: true,
  });
}

function spawnAmbientHeart(boost = false) {
  if (!ambientHearts) return;
  const heart = document.createElement("span");
  heart.className = "float-heart";
  heart.textContent = Math.random() > 0.18 ? "♥" : "♡";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.setProperty("--size", `${boost ? 22 + Math.random() * 34 : 14 + Math.random() * 22}px`);
  ambientHearts.appendChild(heart);

  motion.fromTo(
    heart,
    { y: 20, opacity: 0, rotate: -10 + Math.random() * 20 },
    {
      y: -(window.innerHeight + 80),
      x: -60 + Math.random() * 120,
      opacity: boost ? 0.92 : 0.54,
      rotate: -25 + Math.random() * 50,
      duration: boost ? 3.8 + Math.random() * 1.4 : 5 + Math.random() * 3,
      ease: "sine.out",
      onComplete: () => heart.remove(),
    }
  );
}

function initAmbientHearts() {
  for (let i = 0; i < 8; i += 1) {
    window.setTimeout(() => spawnAmbientHeart(), i * 220);
  }
  window.setInterval(() => spawnAmbientHeart(), 900);
}

/* Scene Navigation */
function showScene(id) {
  const nextScene = document.getElementById(id);
  if (!nextScene || nextScene === currentScene) return;

  stopSceneWork(currentScene?.id);
  const outgoing = currentScene;

  motion.to(outgoing, {
    opacity: 0,
    y: -24,
    duration: 0.42,
    ease: "power2.inOut",
    onComplete: () => {
      outgoing.classList.remove("is-active");
      outgoing.removeAttribute("style");
      nextScene.classList.add("is-active");
      currentScene = nextScene;
      window.scrollTo(0, 0);
      animateSceneIn(nextScene);
      runSceneHook(id);
      if (window.AOS) window.AOS.refreshHard();
    },
  });
}

function animateSceneIn(scene) {
  if (!scene) return;
  motion.fromTo(
    scene,
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.72, ease: "power3.out" }
  );
}

function runSceneHook(id) {
  if (id === "chapter1" && !hasTypedIntro) typeIntro();
  if (id === "chapter5" && !secretPreviewPlayed) playStarPreview();
  if (id === "chapter10") startStarryNight();
}

function stopSceneWork(id) {
  if (id === "chapter10") stopStarryNight();
  if (id === "chapter6") stopHeartGameSilently();
  if (id === "chapter7") pauseMusic(document.getElementById("loveSong"));
}

function bindNavigation() {
  document.querySelectorAll(".next-scene").forEach((button) => {
    button.addEventListener("click", () => showScene(button.dataset.next));
  });

  document.getElementById("beginStory")?.addEventListener("click", () => showScene("password"));
}

/* Password Screen */
function compactDate(value) {
  return String(value || "").replace(/\D/g, "");
}

function bindPasswordGate() {
  const form = document.getElementById("passwordForm");
  const input = document.getElementById("anniversaryInput");
  const message = document.getElementById("passwordMessage");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isCorrect = PASSWORD_ALIASES.has(compactDate(input.value));
    if (isCorrect) {
      message.textContent = "Unlocked.";
      heartBurst(form);
      showScene("chapter1");
      return;
    }

    message.textContent = "Almost. Try the date your heart knows.";
    input.classList.remove("shake");
    void input.offsetWidth;
    input.classList.add("shake");
    motion.to(input, { boxShadow: "0 0 0 4px rgba(233, 77, 138, 0.2)", duration: 0.16, yoyo: true, repeat: 1 });
  });
}

/* Chapter 1 Typewriter */
function typeIntro() {
  const target = document.getElementById("chapter1Title");
  if (!target) return;
  hasTypedIntro = true;
  target.textContent = "";
  let index = 0;
  const cursor = document.createElement("span");
  cursor.textContent = "|";
  cursor.setAttribute("aria-hidden", "true");

  function tick() {
    target.textContent = TYPEWRITER_COPY.slice(0, index);
    target.appendChild(cursor);
    index += 1;
    if (index <= TYPEWRITER_COPY.length) {
      window.setTimeout(tick, 95);
    } else {
      motion.to(cursor, { opacity: 0, duration: 0.55, yoyo: true, repeat: 3 });
    }
  }

  tick();
}

/* Chapter 3 Gallery Modal */
const galleryItems = [
  { src: "images/photo1.jpg", caption: "forever starts small" },
  { src: "images/photo2.jpg", caption: "soft little sparks" },
  { src: "images/photo3.jpg", caption: "my favorite view" },
  { src: "images/photo4.jpg", caption: "golden quiet" },
  { src: "images/photo5.jpg", caption: "tiny miracles" },
  { src: "images/photo6.jpg", caption: "still my choice" },
];
let activeGalleryIndex = 0;

function bindGallery() {
  const modal = document.getElementById("galleryModal");
  const modalImage = document.getElementById("modalImage");
  const modalCaption = document.getElementById("modalCaption");

  function renderModal(index) {
    activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeGalleryIndex];
    modalImage.src = item.src;
    modalImage.alt = `Selected memory ${activeGalleryIndex + 1}`;
    modalCaption.textContent = item.caption;
    motion.fromTo(modalImage, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: "power2.out" });
  }

  function openModal(index) {
    renderModal(index);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    motion.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
  }

  function closeModal() {
    motion.to(modal, {
      opacity: 0,
      duration: 0.24,
      ease: "power2.in",
      onComplete: () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        modal.removeAttribute("style");
      },
    });
  }

  document.querySelectorAll(".polaroid").forEach((button) => {
    button.addEventListener("click", () => openModal(Number(button.dataset.index)));
  });

  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("prevPhoto").addEventListener("click", () => renderModal(activeGalleryIndex - 1));
  document.getElementById("nextPhoto").addEventListener("click", () => renderModal(activeGalleryIndex + 1));

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("is-open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowLeft") renderModal(activeGalleryIndex - 1);
    if (event.key === "ArrowRight") renderModal(activeGalleryIndex + 1);
  });
}

/* Chapter 4 Quiz */
const quizQuestions = [
  {
    question: "What makes any place feel like home?",
    options: ["A perfect map", "Being with you", "A very strict schedule"],
    answer: 1,
    wrong: "Cute guess, but the map is not the main character here.",
  },
  {
    question: "What should we collect more of?",
    options: ["Unread notifications", "Cold fries", "Tiny happy memories"],
    answer: 2,
    wrong: "Bold choice. The memories are warmer.",
  },
  {
    question: "What is my favorite notification?",
    options: ["Storage almost full", "Your name", "Terms updated"],
    answer: 1,
    wrong: "That one made me smile, but no.",
  },
  {
    question: "What is the best team?",
    options: ["Me versus you", "The alarm clock", "Us"],
    answer: 2,
    wrong: "Tempting, but the alarm clock loses.",
  },
  {
    question: "What do I choose at the end of this story?",
    options: ["A loading screen", "You", "A random side quest"],
    answer: 1,
    wrong: "The side quest can wait.",
  },
];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function bindQuiz() {
  document.getElementById("quizNext").addEventListener("click", nextQuizQuestion);
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const question = quizQuestions[quizIndex];
  const options = document.getElementById("quizOptions");
  const nextButton = document.getElementById("quizNext");

  quizAnswered = false;
  document.getElementById("quizStep").textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  document.getElementById("quizScore").textContent = `Score ${quizScore}`;
  document.getElementById("quizQuestion").textContent = question.question;
  document.getElementById("quizFeedback").textContent = "";
  nextButton.disabled = true;
  nextButton.textContent = quizIndex === quizQuestions.length - 1 ? "See Score" : "Next";
  options.innerHTML = "";

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuiz(optionIndex, button));
    options.appendChild(button);
  });

  motion.fromTo(".quiz-option", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.36, stagger: 0.05 });
}

function answerQuiz(optionIndex, selectedButton) {
  if (quizAnswered) return;
  quizAnswered = true;
  const question = quizQuestions[quizIndex];
  const buttons = Array.from(document.querySelectorAll(".quiz-option"));
  buttons.forEach((button) => {
    button.disabled = true;
  });

  if (optionIndex === question.answer) {
    quizScore += 1;
    selectedButton.classList.add("is-correct");
    document.getElementById("quizFeedback").textContent = "Correct. My heart agrees.";
    heartBurst(document.querySelector(".quiz-shell"));
  } else {
    selectedButton.classList.add("is-wrong");
    buttons[question.answer].classList.add("is-correct");
    document.getElementById("quizFeedback").textContent = question.wrong;
    motion.fromTo(selectedButton, { x: -8 }, { x: 0, duration: 0.36, ease: "elastic.out(1, 0.4)" });
  }

  document.getElementById("quizScore").textContent = `Score ${quizScore}`;
  document.getElementById("quizNext").disabled = false;
}

function nextQuizQuestion() {
  if (!quizAnswered) return;
  if (quizIndex < quizQuestions.length - 1) {
    quizIndex += 1;
    renderQuizQuestion();
    return;
  }

  const feedback = document.getElementById("quizFeedback");
  feedback.textContent = `Final score: ${quizScore}/${quizQuestions.length}. You unlocked the next chapter.`;
  document.getElementById("quizNext").classList.add("is-hidden");
  document.getElementById("quizContinue").classList.remove("is-hidden");
  celebrate(0.45);
}

/* Chapter 5 Hidden Secret */
let expectedStar = 1;

function playStarPreview() {
  secretPreviewPlayed = true;
  const stars = Array.from(document.querySelectorAll(".star")).sort(
    (a, b) => Number(a.dataset.order) - Number(b.dataset.order)
  );

  stars.forEach((star, index) => {
    motion.delayedCall(index * 0.44, () => {
      star.classList.add("is-lit");
      motion.to(star, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1 });
      window.setTimeout(() => star.classList.remove("is-lit"), 330);
    });
  });
}

function bindSecretStars() {
  const feedback = document.getElementById("secretFeedback");
  const letter = document.getElementById("loveLetter");
  const continueButton = document.getElementById("secretContinue");

  document.querySelectorAll(".star").forEach((star) => {
    star.addEventListener("click", () => {
      const order = Number(star.dataset.order);
      if (order !== expectedStar) {
        expectedStar = 1;
        feedback.textContent = "The stars got shy. Watch the glow and try again.";
        document.querySelectorAll(".star").forEach((item) => item.classList.remove("is-lit"));
        motion.fromTo("#starCode", { x: -10 }, { x: 0, duration: 0.42, ease: "elastic.out(1, 0.45)" });
        playStarPreview();
        return;
      }

      star.classList.add("is-lit");
      motion.to(star, { scale: 1.2, duration: 0.18, yoyo: true, repeat: 1 });
      expectedStar += 1;

      if (expectedStar > 5) {
        feedback.textContent = "Secret unlocked.";
        letter.setAttribute("aria-hidden", "false");
        continueButton.classList.remove("is-hidden");
        heartBurst(letter);
        motion.fromTo(letter, { opacity: 0, y: 28, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.62 });
      }
    });
  });
}

/* Chapter 6 Catch the Hearts Game */
let gameActive = false;
let gameScore = 0;
let gameTime = 30;
let heartSpawner = null;
let gameTicker = null;

function bindHeartGame() {
  document.getElementById("startGame").addEventListener("click", startHeartGame);
}

function startHeartGame() {
  if (gameActive) return;
  const area = document.getElementById("heartGame");
  const startButton = document.getElementById("startGame");
  const continueButton = document.getElementById("gameContinue");

  gameActive = true;
  gameScore = 0;
  gameTime = 30;
  area.innerHTML = "";
  continueButton.classList.add("is-hidden");
  startButton.disabled = true;
  startButton.textContent = "Playing...";
  updateGameStats();

  heartSpawner = window.setInterval(spawnGameHeart, 520);
  gameTicker = window.setInterval(() => {
    gameTime -= 1;
    updateGameStats();
    if (gameTime <= 0) endHeartGame();
  }, 1000);
}

function spawnGameHeart() {
  if (!gameActive) return;
  const area = document.getElementById("heartGame");
  const bounds = area.getBoundingClientRect();
  const heart = document.createElement("button");
  heart.type = "button";
  heart.className = "falling-heart";
  heart.textContent = Math.random() > 0.5 ? "♥" : "❤";
  heart.style.left = `${Math.max(8, Math.random() * (bounds.width - 46))}px`;
  heart.style.setProperty("--heart-size", `${24 + Math.random() * 22}px`);
  area.appendChild(heart);

  const tween = motion.to(heart, {
    y: bounds.height + 90,
    x: -34 + Math.random() * 68,
    rotate: -60 + Math.random() * 120,
    duration: 2.8 + Math.random() * 1.9,
    ease: "none",
    onComplete: () => heart.remove(),
  });

  heart.addEventListener("click", () => {
    if (!gameActive) return;
    gameScore += 1;
    updateGameStats();
    if (tween && typeof tween.kill === "function") tween.kill();
    motion.to(heart, {
      scale: 1.8,
      opacity: 0,
      duration: 0.22,
      ease: "power2.out",
      onComplete: () => heart.remove(),
    });
  });
}

function updateGameStats() {
  document.getElementById("gameTimer").textContent = String(gameTime);
  document.getElementById("gameScore").textContent = String(gameScore);
}

function endHeartGame() {
  gameActive = false;
  window.clearInterval(heartSpawner);
  window.clearInterval(gameTicker);
  document.querySelectorAll(".falling-heart").forEach((heart) => {
    motion.to(heart, { opacity: 0, scale: 0.6, duration: 0.2, onComplete: () => heart.remove() });
  });

  const startButton = document.getElementById("startGame");
  const continueButton = document.getElementById("gameContinue");
  startButton.disabled = false;
  startButton.textContent = "Play Again";
  continueButton.classList.remove("is-hidden");

  if (gameScore > 20) {
    celebrate(1);
  }
}

function stopHeartGameSilently() {
  if (!gameActive) return;
  gameActive = false;
  window.clearInterval(heartSpawner);
  window.clearInterval(gameTicker);
  document.querySelectorAll(".falling-heart").forEach((heart) => heart.remove());
  const startButton = document.getElementById("startGame");
  if (startButton) {
    startButton.disabled = false;
    startButton.textContent = "Start Game";
  }
}

/* Chapter 7 Music Room */
let isMusicPlaying = false;
let fallbackAudio = null;

function bindMusicRoom() {
  const audio = document.getElementById("loveSong");
  const toggle = document.getElementById("musicToggle");
  const note = document.getElementById("musicNote");

  audio.addEventListener("error", () => {
    note.textContent = "Replace audio/song.mp3 with your song when ready.";
  });

  toggle.addEventListener("click", async () => {
    if (isMusicPlaying) {
      pauseMusic(audio);
      return;
    }

    try {
      await audio.play();
      note.textContent = "Playing your song.";
      setMusicState(true);
    } catch (error) {
      startFallbackAudio();
      note.textContent = "Playing a soft browser tone until song.mp3 is replaced.";
      setMusicState(true);
    }
  });

  audio.addEventListener("pause", () => {
    if (!fallbackAudio) setMusicState(false);
  });
}

function setMusicState(playing) {
  isMusicPlaying = playing;
  document.getElementById("vinyl").classList.toggle("is-playing", playing);
  document.getElementById("musicToggle").textContent = playing ? "Pause" : "Play";
}

function pauseMusic(audio) {
  audio.pause();
  stopFallbackAudio();
  setMusicState(false);
}

function startFallbackAudio() {
  stopFallbackAudio();
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0.025;
  gain.connect(context.destination);

  const notes = [261.63, 329.63, 392.0];
  const oscillators = notes.map((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const noteGain = context.createGain();
    noteGain.gain.value = index === 0 ? 0.7 : 0.36;
    oscillator.connect(noteGain).connect(gain);
    oscillator.start();
    return oscillator;
  });

  fallbackAudio = { context, oscillators };
}

function stopFallbackAudio() {
  if (!fallbackAudio) return;
  fallbackAudio.oscillators.forEach((oscillator) => oscillator.stop());
  fallbackAudio.context.close();
  fallbackAudio = null;
}

/* Chapter 8 Reasons */
const reasons = Array.from(
  { length: 100 },
  (_, index) => `Placeholder reason ${index + 1}: write one specific little thing you love here.`
);
let reasonIndex = 0;
let reasonFlipped = false;

function bindReasons() {
  const card = document.getElementById("reasonCard");
  document.getElementById("flipReason").addEventListener("click", flipReasonCard);
  document.getElementById("nextReason").addEventListener("click", () => changeReason(1));
  document.getElementById("prevReason").addEventListener("click", () => changeReason(-1));
  card.addEventListener("click", flipReasonCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipReasonCard();
    }
  });
  updateReasonCard();
}

function updateReasonCard() {
  reasonFlipped = false;
  document.getElementById("reasonNumber").textContent = `Reason ${reasonIndex + 1} / ${reasons.length}`;
  document.getElementById("reasonText").textContent = reasons[reasonIndex];
  motion.set(".reason-card__inner", { rotationY: 0 });
}

function flipReasonCard() {
  reasonFlipped = !reasonFlipped;
  motion.to(".reason-card__inner", {
    rotationY: reasonFlipped ? 180 : 0,
    duration: 0.55,
    ease: "power2.inOut",
  });
}

function changeReason(direction) {
  reasonIndex = (reasonIndex + direction + reasons.length) % reasons.length;
  motion.to(".reason-card", {
    opacity: 0,
    y: 16,
    duration: 0.18,
    onComplete: () => {
      updateReasonCard();
      motion.to(".reason-card", { opacity: 1, y: 0, duration: 0.26 });
    },
  });
}

/* Chapter 9 Memory Book */
const bookPages = [
  {
    image: "images/photo1.jpg",
    title: "Page One",
    note: "Replace this with the first note you want her to read.",
  },
  {
    image: "images/photo2.jpg",
    title: "Page Two",
    note: "A tiny caption, a date, and the feeling you remember most.",
  },
  {
    image: "images/photo3.jpg",
    title: "Page Three",
    note: "This page can hold a favorite trip, meal, or quiet evening.",
  },
  {
    image: "images/photo4.jpg",
    title: "Page Four",
    note: "Write the kind of line that sounds like only you.",
  },
  {
    image: "images/photo5.jpg",
    title: "Page Five",
    note: "Add the memory that still makes both of you smile.",
  },
  {
    image: "images/photo6.jpg",
    title: "Page Six",
    note: "A note for a day you never want to forget.",
  },
  {
    image: "images/photo7.jpg",
    title: "Page Seven",
    note: "A future promise can live here.",
  },
  {
    image: "images/photo8.jpg",
    title: "Page Eight",
    note: "End the scrapbook with your favorite sentence.",
  },
];
let spreadIndex = 0;

function bindMemoryBook() {
  document.getElementById("nextPage").addEventListener("click", () => turnBookPage(1));
  document.getElementById("prevPage").addEventListener("click", () => turnBookPage(-1));
  renderBookPages();
}

function renderBookPages() {
  const left = bookPages[spreadIndex * 2];
  const right = bookPages[spreadIndex * 2 + 1];
  document.getElementById("bookLeft").innerHTML = bookPageTemplate(left);
  document.getElementById("bookRight").innerHTML = bookPageTemplate(right);
  document.getElementById("pageIndicator").textContent = `${spreadIndex + 1} / ${Math.ceil(bookPages.length / 2)}`;
}

function bookPageTemplate(page) {
  return `
    <img src="${page.image}" alt="${page.title}" loading="lazy" />
    <h3>${page.title}</h3>
    <p>${page.note}</p>
  `;
}

function turnBookPage(direction) {
  const maxSpread = Math.ceil(bookPages.length / 2) - 1;
  const nextSpread = Math.min(maxSpread, Math.max(0, spreadIndex + direction));
  if (nextSpread === spreadIndex) return;

  const turningPage = direction > 0 ? "#bookRight" : "#bookLeft";
  motion.to(turningPage, {
    rotationY: direction > 0 ? -84 : 84,
    opacity: 0.62,
    duration: 0.34,
    ease: "power2.in",
    onComplete: () => {
      spreadIndex = nextSpread;
      renderBookPages();
      motion.fromTo(
        ".book-page",
        { rotationY: direction > 0 ? 12 : -12, opacity: 0.64 },
        { rotationY: 0, opacity: 1, duration: 0.42, ease: "power2.out" }
      );
    },
  });
}

/* Chapter 10 Starry Night */
const starCanvas = document.getElementById("starCanvas");
const starCtx = starCanvas.getContext("2d");
const sky = {
  width: 0,
  height: 0,
  stars: [],
  shootingStars: [],
  frame: 0,
};

const constellations = [
  {
    name: "Promise",
    points: [
      [0.58, 0.28],
      [0.64, 0.22],
      [0.7, 0.3],
      [0.76, 0.25],
    ],
    message: "Promise: every future feels warmer when I imagine it with you.",
  },
  {
    name: "Home",
    points: [
      [0.23, 0.35],
      [0.3, 0.28],
      [0.37, 0.35],
      [0.33, 0.45],
      [0.27, 0.45],
    ],
    message: "Home: you are the place my heart recognizes first.",
  },
  {
    name: "Always",
    points: [
      [0.48, 0.62],
      [0.55, 0.56],
      [0.62, 0.64],
      [0.69, 0.58],
    ],
    message: "Always: even on quiet days, my answer is still you.",
  },
];

function startStarryNight() {
  resizeStarCanvas();
  if (nightAnimationId) return;
  drawStarryNight();
}

function stopStarryNight() {
  if (!nightAnimationId) return;
  window.cancelAnimationFrame(nightAnimationId);
  nightAnimationId = null;
}

function resizeStarCanvas() {
  const rect = starCanvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  sky.width = rect.width;
  sky.height = rect.height;
  starCanvas.width = Math.floor(rect.width * dpr);
  starCanvas.height = Math.floor(rect.height * dpr);
  starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sky.stars = Array.from({ length: Math.min(170, Math.floor((sky.width * sky.height) / 6200)) }, () => ({
    x: Math.random() * sky.width,
    y: Math.random() * sky.height,
    r: 0.7 + Math.random() * 1.8,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

function drawStarryNight() {
  sky.frame += 1;
  starCtx.clearRect(0, 0, sky.width, sky.height);
  const gradient = starCtx.createLinearGradient(0, 0, sky.width, sky.height);
  gradient.addColorStop(0, "#130f24");
  gradient.addColorStop(0.55, "#21143a");
  gradient.addColorStop(1, "#3b1741");
  starCtx.fillStyle = gradient;
  starCtx.fillRect(0, 0, sky.width, sky.height);

  drawStars();
  drawConstellations();
  updateShootingStars();

  if (sky.frame % 115 === 0 && Math.random() > 0.18) {
    sky.shootingStars.push({
      x: Math.random() * sky.width * 0.8,
      y: Math.random() * sky.height * 0.35,
      vx: 7 + Math.random() * 4,
      vy: 3 + Math.random() * 2,
      life: 44,
    });
  }

  nightAnimationId = window.requestAnimationFrame(drawStarryNight);
}

function drawStars() {
  sky.stars.forEach((star) => {
    const alpha = 0.38 + Math.sin(star.twinkle + sky.frame * 0.025) * 0.28;
    starCtx.beginPath();
    starCtx.fillStyle = `rgba(255, 248, 235, ${alpha})`;
    starCtx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    starCtx.fill();
  });
}

function drawConstellations() {
  constellations.forEach((shape) => {
    const points = shape.points.map(([x, y]) => [x * sky.width, y * sky.height]);
    starCtx.strokeStyle = "rgba(246, 168, 200, 0.46)";
    starCtx.lineWidth = 1.4;
    starCtx.beginPath();
    points.forEach(([x, y], index) => {
      if (index === 0) starCtx.moveTo(x, y);
      else starCtx.lineTo(x, y);
    });
    starCtx.stroke();

    points.forEach(([x, y]) => {
      starCtx.beginPath();
      starCtx.fillStyle = "rgba(255, 255, 255, 0.96)";
      starCtx.shadowColor = "rgba(246, 168, 200, 0.7)";
      starCtx.shadowBlur = 14;
      starCtx.arc(x, y, 4.5, 0, Math.PI * 2);
      starCtx.fill();
      starCtx.shadowBlur = 0;
    });
  });
}

function updateShootingStars() {
  sky.shootingStars = sky.shootingStars.filter((star) => star.life > 0);
  sky.shootingStars.forEach((star) => {
    star.life -= 1;
    star.x += star.vx;
    star.y += star.vy;
    starCtx.strokeStyle = `rgba(255, 248, 235, ${star.life / 44})`;
    starCtx.lineWidth = 2;
    starCtx.beginPath();
    starCtx.moveTo(star.x, star.y);
    starCtx.lineTo(star.x - 70, star.y - 32);
    starCtx.stroke();
  });
}

function bindStarCanvas() {
  window.addEventListener("resize", resizeStarCanvas);
  starCanvas.addEventListener("click", (event) => {
    const rect = starCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const match = constellations.find((shape) =>
      shape.points.some(([px, py]) => Math.hypot(x - px * sky.width, y - py * sky.height) < 34)
    );

    if (!match) return;
    const message = document.getElementById("constellationMessage");
    message.textContent = match.message;
    celebrate(0.28);
    motion.fromTo(message, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.36 });
  });
}

/* Ending */
function bindEnding() {
  document.getElementById("loveButton").addEventListener("click", () => {
    celebrate(1.4);
    for (let i = 0; i < 38; i += 1) {
      window.setTimeout(() => spawnAmbientHeart(true), i * 45);
    }
    motion.to("#loveButton", { opacity: 0, scale: 0.88, duration: 0.32, pointerEvents: "none" });
    motion.fromTo("#theEnd", { opacity: 0, y: 30, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, delay: 0.35 });
  });
}

/* Shared Effects */
function heartBurst(container) {
  const bounds = container.getBoundingClientRect();
  for (let i = 0; i < 11; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.textContent = "♥";
    heart.style.position = "fixed";
    heart.style.left = `${bounds.left + bounds.width / 2}px`;
    heart.style.bottom = "auto";
    heart.style.top = `${bounds.top + bounds.height / 2}px`;
    heart.style.setProperty("--size", `${18 + Math.random() * 18}px`);
    document.body.appendChild(heart);

    motion.to(heart, {
      x: -130 + Math.random() * 260,
      y: -130 - Math.random() * 80,
      rotate: -40 + Math.random() * 80,
      opacity: 0,
      duration: 0.8 + Math.random() * 0.3,
      ease: "power2.out",
      onComplete: () => heart.remove(),
    });
  }
}

function celebrate(intensity = 1) {
  if (!window.confetti) return;
  const count = Math.floor(90 * intensity);
  window.confetti({
    particleCount: count,
    spread: 72,
    origin: { y: 0.72 },
    colors: ["#e94d8a", "#f6a8c8", "#f4c76b", "#d9ceff", "#ffffff"],
  });
  window.confetti({
    particleCount: Math.floor(count * 0.55),
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ["#e94d8a", "#f4c76b", "#ffffff"],
  });
  window.confetti({
    particleCount: Math.floor(count * 0.55),
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ["#f6a8c8", "#d9ceff", "#ffffff"],
  });
}

/* Initialization */
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    window.AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 90,
    });
  }

  initLoader();
  initParticles();
  initAmbientHearts();
  bindNavigation();
  bindPasswordGate();
  bindGallery();
  bindQuiz();
  bindSecretStars();
  bindHeartGame();
  bindMusicRoom();
  bindReasons();
  bindMemoryBook();
  bindStarCanvas();
  bindEnding();
});

window.addEventListener("load", () => {
  window.setTimeout(hideLoader, 300);
});
