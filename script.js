class AntSmasherGame {
  constructor() {
    this.score = 0;
    this.highScore = localStorage.getItem("antSmasherHighScore") || 0;
    this.gameTime = 0;
    this.missedAnts = 0;
    this.isGameRunning = false;
    this.isPaused = false;
    this.antSpawnInterval = null;
    this.gameTimer = null;
    this.ants = [];
    this.antEmojis = ["🐜"];
    this.specialInsects = [
      { emoji: "🦗", points: 3, name: "Cricket" },
      { emoji: "🐛", points: 5, name: "Caterpillar" },
      { emoji: "🕷️", points: 7, name: "Spider" },
      { emoji: "🪲", points: 10, name: "Beetle" },
    ];

    this.initializeElements();
    this.initializeSounds();
    this.setupEventListeners();
    this.updateHighScoreDisplay();
  }

  initializeElements() {
    this.gameArea = document.getElementById("game-area");
    this.gameOverlay = document.getElementById("game-overlay");
    this.startBtn = document.getElementById("start-btn");
    this.restartBtn = document.getElementById("restart-btn");
    this.pauseBtn = document.getElementById("pause-btn");
    this.currentScoreEl = document.getElementById("current-score");
    this.highScoreEl = document.getElementById("high-score");
    this.gameTimeEl = document.getElementById("game-time");
    this.missedAntsEl = document.getElementById("missed-ants");
    this.soundContainer = document.getElementById("sound-container");
  }

  initializeSounds() {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    this.sounds = {
      smash: this.createSmashSound.bind(this),
      spawn: this.createSpawnSound.bind(this),
      gameStart: this.createGameStartSound.bind(this),
      gameOver: this.createGameOverSound.bind(this),
      bonus: this.createBonusSound.bind(this),
    };
  }

  createSmashSound() {
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator1.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(
      100,
      this.audioContext.currentTime + 0.15
    );

    oscillator2.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(
      150,
      this.audioContext.currentTime + 0.15
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      400,
      this.audioContext.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.15
    );

    oscillator1.type = "square";
    oscillator2.type = "sawtooth";

    oscillator1.start(this.audioContext.currentTime);
    oscillator2.start(this.audioContext.currentTime);
    oscillator1.stop(this.audioContext.currentTime + 0.15);
    oscillator2.stop(this.audioContext.currentTime + 0.15);
  }

  createSpawnSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      600,
      this.audioContext.currentTime + 0.08
    );

    filter.type = "highpass";
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      100,
      this.audioContext.currentTime + 0.08
    );

    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.08
    );

    oscillator.type = "square";
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.08);
  }

  createGameStartSound() {
    const frequencies = [220, 330, 440, 660, 880];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(
          freq,
          this.audioContext.currentTime
        );

        oscillator.frequency.linearRampToValueAtTime(
          freq * 1.1,
          this.audioContext.currentTime + 0.1
        );

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(
          freq * 2,
          this.audioContext.currentTime
        );
        filter.Q.setValueAtTime(5, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.25
        );

        oscillator.type = "sawtooth";
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.25);
      }, index * 80);
    });
  }

  createGameOverSound() {
    const frequencies = [880, 660, 440, 220, 110];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator1.connect(filter);
        oscillator2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator1.frequency.setValueAtTime(
          freq,
          this.audioContext.currentTime
        );
        oscillator1.frequency.exponentialRampToValueAtTime(
          freq * 0.5,
          this.audioContext.currentTime + 0.4
        );

        oscillator2.frequency.setValueAtTime(
          freq * 1.5,
          this.audioContext.currentTime
        );
        oscillator2.frequency.exponentialRampToValueAtTime(
          freq * 0.75,
          this.audioContext.currentTime + 0.4
        );

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(
          freq * 3,
          this.audioContext.currentTime
        );
        filter.frequency.exponentialRampToValueAtTime(
          freq * 0.5,
          this.audioContext.currentTime + 0.4
        );

        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.4
        );

        oscillator1.type = "square";
        oscillator2.type = "triangle";

        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.4);
        oscillator2.stop(this.audioContext.currentTime + 0.4);
      }, index * 120);
    });
  }

  createBonusSound() {
    const frequencies = [880, 1320, 1760, 2200];

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(
          freq,
          this.audioContext.currentTime
        );

        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        lfo.frequency.setValueAtTime(8, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(20, this.audioContext.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(
          freq * 2,
          this.audioContext.currentTime
        );
        filter.Q.setValueAtTime(3, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext.currentTime + 0.3
        );

        oscillator.type = "sine";
        lfo.type = "sine";

        oscillator.start(this.audioContext.currentTime);
        lfo.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
        lfo.stop(this.audioContext.currentTime + 0.3);
      }, index * 50);
    });
  }

  setupEventListeners() {
    const startButtons = document.querySelectorAll(
      "#start-btn, .launch-trigger"
    );
    startButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.startGame());
    });

    this.restartBtn.addEventListener("click", () => this.restartGame());
    this.pauseBtn.addEventListener("click", () => this.togglePause());

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (!this.isGameRunning) {
            this.startGame();
          } else {
            this.togglePause();
          }
          break;
        case "KeyR":
          e.preventDefault();
          this.restartGame();
          break;
      }
    });
  }

  startGame() {
    this.isGameRunning = true;
    this.isPaused = false;
    this.gameTime = 0;
    this.missedAnts = 0;
    this.score = 0;
    this.updateScore();
    this.updateGameTime();
    this.updateMissedAnts();

    clearTimeout(this.antSpawnInterval);
    this.gameOverlay.classList.add("invisible");
    this.gameOverlay.style.display = "none";

    this.sounds.gameStart();

    const spawnAntsRecursively = () => {
      if (!this.isPaused && this.isGameRunning) {
        this.spawnAnt();
        this.antSpawnInterval = setTimeout(
          spawnAntsRecursively,
          this.getSpawnInterval()
        );
      }
    };

    spawnAntsRecursively();
    this.startGameTimer();

    const btnText = this.pauseBtn.querySelector(".btn-text");
    if (btnText) {
      btnText.textContent = "PAUSE";
    }
  }

  restartGame() {
    this.stopGame();
    this.score = 0;
    this.gameTime = 0;
    this.missedAnts = 0;
    this.updateScore();
    this.updateGameTime();
    this.updateMissedAnts();
    this.clearAllAnts();

    this.gameOverlay.classList.remove("invisible");
    this.gameOverlay.style.display = "flex";

    this.isGameRunning = false;
    this.isPaused = false;

    const btnText = this.pauseBtn.querySelector(".btn-text");
    if (btnText) {
      btnText.textContent = "PAUSE";
    }

    document.body.classList.remove("frozen-state");
  }

  togglePause() {
    if (!this.isGameRunning) return;

    this.isPaused = !this.isPaused;
    const btnText = this.pauseBtn.querySelector(".btn-text");

    if (this.isPaused) {
      if (btnText) {
        btnText.textContent = "RESUME";
      }
      document.body.classList.add("frozen-state");
    } else {
      if (btnText) {
        btnText.textContent = "PAUSE";
      }
      document.body.classList.remove("frozen-state");
    }
  }

  stopGame() {
    this.isGameRunning = false;
    this.isPaused = false;

    if (this.antSpawnInterval) {
      clearInterval(this.antSpawnInterval);
      this.antSpawnInterval = null;
    }

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  startGameTimer() {
    this.gameTimer = setInterval(() => {
      if (!this.isPaused) {
        this.gameTime++;
        this.updateGameTime();
      }
    }, 1000);
  }

  getSpawnInterval() {
    const baseInterval = 2000;
    const difficultyReduction = Math.floor(this.gameTime / 10) * 100;
    return Math.max(baseInterval - difficultyReduction, 500);
  }

  spawnAnt() {
    const shouldSpawnSpecial = this.gameTime > 10 && Math.random() < 0.15;

    const ant = document.createElement("div");
    ant.className = "target-creature";

    let insectData = { points: 1, name: "Ant" };

    if (shouldSpawnSpecial) {
      insectData =
        this.specialInsects[
          Math.floor(Math.random() * this.specialInsects.length)
        ];
      ant.textContent = insectData.emoji;
      ant.classList.add("bonus-target");
      ant.setAttribute("data-points", insectData.points);
      ant.setAttribute("data-name", insectData.name);
    } else {
      ant.textContent =
        this.antEmojis[Math.floor(Math.random() * this.antEmojis.length)];
      ant.setAttribute("data-points", "1");
      ant.setAttribute("data-name", "Ant");
    }

    const gameAreaRect = this.gameArea.getBoundingClientRect();
    const maxX = gameAreaRect.width - 60;
    const maxY = gameAreaRect.height - 60;

    if (shouldSpawnSpecial) {
      const centerX = gameAreaRect.width / 2;
      const centerY = gameAreaRect.height / 2;
      const centerRange = 200;

      ant.style.left =
        Math.max(
          0,
          Math.min(
            maxX,
            centerX - centerRange / 2 + Math.random() * centerRange
          )
        ) + "px";
      ant.style.top =
        Math.max(
          0,
          Math.min(
            maxY,
            centerY - centerRange / 2 + Math.random() * centerRange
          )
        ) + "px";
    } else {
      ant.style.left = Math.random() * maxX + "px";
      ant.style.top = Math.random() * maxY + "px";
    }

    ant.addEventListener("click", (e) => this.smashAnt(e, ant));

    this.gameArea.appendChild(ant);
    this.ants.push(ant);

    if (shouldSpawnSpecial || Math.random() < 0.3) {
      this.sounds.spawn();
    }

    const lifeTime = shouldSpawnSpecial
      ? 6000 + Math.random() * 3000
      : 4000 + Math.random() * 2000;

    setTimeout(() => {
      if (ant.parentNode && !ant.classList.contains("eliminated")) {
        this.antEscapes(ant);
      }
    }, lifeTime);
  }

  smashAnt(event, ant) {
    if (ant.classList.contains("eliminated") || this.isPaused) return;

    event.preventDefault();
    event.stopPropagation();

    ant.classList.add("eliminated");

    const points = parseInt(ant.getAttribute("data-points")) || 1;
    const name = ant.getAttribute("data-name") || "Ant";

    this.score += points;
    this.updateScore();

    if (points > 1) {
      this.sounds.bonus();
    } else {
      this.sounds.smash();
    }

    this.createParticleExplosion(ant.offsetLeft + 25, ant.offsetTop + 25);

    this.showScorePopup(event.clientX, event.clientY, points, name);

    setTimeout(() => {
      if (ant.parentNode) {
        ant.parentNode.removeChild(ant);
        this.ants = this.ants.filter((a) => a !== ant);
      }
    }, 500);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.updateHighScore();
    }
  }

  createParticleExplosion(x, y) {
    const particleCount = 12;
    const colors = ["#ff6b6b", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc"];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "explosion-fragment";
      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.background = `radial-gradient(circle, ${
        colors[i % colors.length]
      }, ${colors[(i + 1) % colors.length]})`;

      const angle = (i / particleCount) * 2 * Math.PI;
      const distance = 50 + Math.random() * 50;
      const deltaX = Math.cos(angle) * distance;
      const deltaY = Math.sin(angle) * distance;

      particle.style.setProperty("--deltaX", deltaX + "px");
      particle.style.setProperty("--deltaY", deltaY + "px");

      this.gameArea.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }
  }

  antEscapes(ant) {
    if (ant.parentNode) {
      this.missedAnts++;
      this.updateMissedAnts();

      ant.style.transition = "all 0.5s ease-out";
      ant.style.transform = "scale(0.5)";
      ant.style.opacity = "0";

      setTimeout(() => {
        if (ant.parentNode) {
          ant.parentNode.removeChild(ant);
          this.ants = this.ants.filter((a) => a !== ant);
        }
      }, 500);
    }
  }

  showScorePopup(x, y, points = 1, name = "Ant") {
    const popup = document.createElement("div");
    popup.className = "points-notification";

    if (points > 1) {
      popup.textContent = `+${points} ${name}!`;
      popup.classList.add("bonus-alert");
    } else {
      popup.textContent = "+1";
    }

    popup.style.left = x + "px";
    popup.style.top = y + "px";

    document.body.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 1000);

    if (this.score % 10 === 0 && this.score > 0) {
      this.showMilestoneMessage(this.score);
    }
  }

  showMilestoneMessage(score) {
    const milestone = document.createElement("div");
    milestone.className = "achievement-banner";
    milestone.textContent = `Great job! ${score} ants smashed! 🎉`;
    milestone.style.position = "fixed";
    milestone.style.top = "50%";
    milestone.style.left = "50%";
    milestone.style.transform = "translate(-50%, -50%)";
    milestone.style.background = "rgba(76, 175, 80, 0.9)";
    milestone.style.color = "white";
    milestone.style.padding = "15px 30px";
    milestone.style.borderRadius = "25px";
    milestone.style.fontSize = "1.2rem";
    milestone.style.fontWeight = "bold";
    milestone.style.zIndex = "300";
    milestone.style.animation = "milestonePopup 2s ease-out forwards";

    document.body.appendChild(milestone);

    setTimeout(() => {
      if (milestone.parentNode) {
        milestone.parentNode.removeChild(milestone);
      }
    }, 2000);
  }

  showMissMessage(x, y) {
    const messages = [
      "Try again!",
      "So close!",
      "Keep trying!",
      "Don't give up!",
    ];
    const popup = document.createElement("div");
    popup.className = "miss-feedback";
    popup.textContent = messages[Math.floor(Math.random() * messages.length)];
    popup.style.position = "fixed";
    popup.style.left = x + "px";
    popup.style.top = y + "px";
    popup.style.color = "#ffeb3b";
    popup.style.fontSize = "16px";
    popup.style.fontWeight = "bold";
    popup.style.pointerEvents = "none";
    popup.style.zIndex = "200";
    popup.style.animation = "missPopup 1s ease-out forwards";
    popup.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.5)";

    document.body.appendChild(popup);

    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 1000);
  }

  clearAllAnts() {
    this.ants.forEach((ant) => {
      if (ant.parentNode) {
        ant.parentNode.removeChild(ant);
      }
    });
    this.ants = [];
  }

  updateScore() {
    this.currentScoreEl.textContent = this.score;

    this.currentScoreEl.style.transform = "scale(1.2)";
    this.currentScoreEl.style.color = "#ff6b6b";

    setTimeout(() => {
      this.currentScoreEl.style.transform = "scale(1)";
      this.currentScoreEl.style.color = "white";
    }, 200);
  }

  updateHighScore() {
    this.highScoreEl.textContent = this.highScore;
    localStorage.setItem("antSmasherHighScore", this.highScore);

    this.highScoreEl.style.transform = "scale(1.2)";
    this.highScoreEl.style.color = "#ffd700";

    setTimeout(() => {
      this.highScoreEl.style.transform = "scale(1)";
      this.highScoreEl.style.color = "white";
    }, 500);
  }

  updateHighScoreDisplay() {
    this.highScoreEl.textContent = this.highScore;
  }

  updateGameTime() {
    this.gameTimeEl.textContent = this.gameTime;
  }

  updateMissedAnts() {
    this.missedAntsEl.textContent = this.missedAnts;

    this.missedAntsEl.style.color = "#ff6b6b";
    this.missedAntsEl.style.textShadow = "0 0 10px rgba(255, 107, 107, 0.5)";

    setTimeout(() => {
      this.missedAntsEl.style.color = "#39ff14";
      this.missedAntsEl.style.textShadow = "0 0 10px rgba(57, 255, 20, 0.5)";
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn(
      "Web Audio API not supported. Game will run without sound effects."
    );
  }

  window.game = new AntSmasherGame();
  const game = window.game;

  const gameArea = document.getElementById("game-area");

  gameArea.addEventListener("click", (e) => {
    if (e.target === gameArea && game.isGameRunning && !game.isPaused) {
      const missEffect = document.createElement("div");
      missEffect.style.position = "absolute";
      missEffect.style.left = e.offsetX + "px";
      missEffect.style.top = e.offsetY + "px";
      missEffect.style.width = "20px";
      missEffect.style.height = "20px";
      missEffect.style.background = "rgba(255, 255, 255, 0.5)";
      missEffect.style.borderRadius = "50%";
      missEffect.style.pointerEvents = "none";
      missEffect.style.animation = "missEffect 0.3s ease-out forwards";

      gameArea.appendChild(missEffect);

      setTimeout(() => {
        if (missEffect.parentNode) {
          missEffect.parentNode.removeChild(missEffect);
        }
      }, 300);

      if (Math.random() < 0.3) {
        game.showMissMessage(e.clientX, e.clientY);
      }
    }
  });

  const style = document.createElement("style");
  style.textContent = `
        @keyframes missEffect {
            0% {
                transform: scale(0);
                opacity: 1;
            }
            100% {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
  document.head.appendChild(style);

  setTimeout(() => {
    const logoElement = document.querySelector(".game-logo h1");
    if (logoElement) {
      logoElement.style.animation = "none";
    }
  }, 3000);

  console.log("🐜 Ant Smasher Game loaded successfully!");
  console.log("🎮 Controls: Space = Start/Pause, R = Restart");
});
