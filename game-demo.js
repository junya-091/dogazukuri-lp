(function() {
  'use strict';

  // ===== LEVELS Data (固定仕様)
  const LEVELS = [
    {
      id: 1,
      theme: "料理動画",
      timeLimit: 30,
      clips: [
        { id: "prep",  order: 1, icon: "🔪", label: "仕込み" },
        { id: "cook",  order: 2, icon: "🍳", label: "調理" },
        { id: "plate", order: 3, icon: "🍽️", label: "盛り付け" },
        { id: "eat",   order: 4, icon: "😋", label: "実食" }
      ]
    },
    {
      id: 2,
      theme: "Vlog",
      timeLimit: 45,
      clips: [
        { id: "open",   order: 1, icon: "🎬", label: "オープニング" },
        { id: "move",   order: 2, icon: "🚗", label: "移動" },
        { id: "main",   order: 3, icon: "📍", label: "現地体験" },
        { id: "voice",  order: 4, icon: "🎤", label: "感想" },
        { id: "recap",  order: 5, icon: "📝", label: "まとめ" },
        { id: "end",    order: 6, icon: "👋", label: "エンディング" }
      ]
    },
    {
      id: 3,
      theme: "TikTok構成",
      timeLimit: 60,
      clips: [
        { id: "hook",    order: 1, icon: "⚡", label: "フック（最初の1.5秒）" },
        { id: "problem", order: 2, icon: "❓", label: "問題提起" },
        { id: "empathy", order: 3, icon: "💭", label: "共感ポイント" },
        { id: "answer",  order: 4, icon: "💡", label: "解決策" },
        { id: "demo",    order: 5, icon: "🎥", label: "デモ" },
        { id: "before",  order: 6, icon: "🔄", label: "ビフォーアフター" },
        { id: "cta",     order: 7, icon: "👉", label: "CTA（行動喚起）" },
        { id: "outro",   order: 8, icon: "🏁", label: "エンドカード" }
      ]
    }
  ];

  // ===== State Management
  let currentLevel = null;
  let currentMisses = 0;
  let currentScore = 0;
  let totalScore = 0;
  let remainingTime = 0;
  let timerInterval = null;
  let nextCorrectOrder = 1;
  let shuffledClips = [];

  // ===== DOM Elements Cache
  const elements = {
    // Screens
    screenStart: document.getElementById('screenStart'),
    screenPlay: document.getElementById('screenPlay'),
    screenResult: document.getElementById('screenResult'),
    screenGameOver: document.getElementById('screenGameOver'),
    screenEnding: document.getElementById('screenEnding'),

    // HUD
    hudLevel: document.getElementById('hudLevel'),
    hudTimer: document.getElementById('hudTimer'),
    hudScore: document.getElementById('hudScore'),

    // Play screen
    cardGrid: document.getElementById('cardGrid'),
    selectedStack: document.getElementById('selectedStack'),

    // Result screen
    resultScore: document.getElementById('resultScore'),

    // Ending screen
    endingScore: document.getElementById('endingScore'),

    // Buttons
    btnStart: document.getElementById('btnStart'),
    btnNextLevel: document.getElementById('btnNextLevel'),
    btnRetry: document.getElementById('btnRetry'),
    btnBackToStart: document.getElementById('btnBackToStart')
  };

  // ===== Utility Functions

  /**
   * Fisher-Yates Shuffle
   */
  function shuffleArray(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Show screen by data-screen attribute
   */
  function showScreen(screenName) {
    // Hide all screens
    elements.screenStart.hidden = true;
    elements.screenPlay.hidden = true;
    elements.screenResult.hidden = true;
    elements.screenGameOver.hidden = true;
    elements.screenEnding.hidden = true;

    // Show target screen
    switch (screenName) {
      case 'start':
        elements.screenStart.hidden = false;
        break;
      case 'play':
        elements.screenPlay.hidden = false;
        break;
      case 'result':
        elements.screenResult.hidden = false;
        break;
      case 'gameover':
        elements.screenGameOver.hidden = false;
        break;
      case 'ending':
        elements.screenEnding.hidden = false;
        break;
    }
  }

  /**
   * Update HUD display
   */
  function updateHUD() {
    // Update level
    const levelBold = elements.hudLevel.querySelector('b');
    if (levelBold) {
      levelBold.textContent = String(currentLevel.id);
    }

    // Update timer
    const timerBold = elements.hudTimer.querySelector('b');
    if (timerBold) {
      timerBold.textContent = String(remainingTime);
    }

    // Update score
    const scoreBold = elements.hudScore.querySelector('b');
    if (scoreBold) {
      scoreBold.textContent = String(currentScore);
    }

    // Add warning class to timer if remaining <= 5
    if (remainingTime <= 5) {
      elements.hudTimer.classList.add('hud-timer--warning');
    } else {
      elements.hudTimer.classList.remove('hud-timer--warning');
    }
  }

  /**
   * Initialize play screen
   */
  function initializeLevel(level) {
    currentLevel = level;
    currentMisses = 0;
    currentScore = 100 * level.clips.length;
    remainingTime = level.timeLimit;
    nextCorrectOrder = 1;

    // Shuffle clips
    shuffledClips = shuffleArray(level.clips);

    // Clear grid and stack
    elements.cardGrid.innerHTML = '';
    elements.selectedStack.innerHTML = '';

    // Create card buttons
    shuffledClips.forEach(clip => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'clip-card';
      button.dataset.clipId = clip.id;
      button.dataset.clipOrder = clip.order;

      const icon = document.createElement('span');
      icon.className = 'clip-card-icon';
      icon.textContent = clip.icon;

      const label = document.createElement('span');
      label.className = 'clip-card-label';
      label.textContent = clip.label;

      button.appendChild(icon);
      button.appendChild(label);

      button.addEventListener('click', () => onCardClick(clip));

      elements.cardGrid.appendChild(button);
    });

    // Update HUD
    updateHUD();

    // Show play screen
    showScreen('play');

    // Start timer
    startTimer();
  }

  /**
   * Handle card click
   */
  function onCardClick(clip) {
    const isCorrect = clip.order === nextCorrectOrder;

    const button = elements.cardGrid.querySelector(`[data-clip-id="${clip.id}"]`);
    if (!button) return;

    if (isCorrect) {
      // Correct answer
      button.disabled = true;
      button.classList.add('clip-card--correct');

      // Add to stack
      const stackItem = document.createElement('div');
      stackItem.className = 'stack-item';

      const stackIcon = document.createElement('span');
      stackIcon.className = 'stack-item-icon';
      stackIcon.textContent = clip.icon;

      stackItem.appendChild(stackIcon);
      stackItem.appendChild(document.createTextNode(clip.label));

      elements.selectedStack.appendChild(stackItem);

      // Remove card from grid after animation
      setTimeout(() => {
        button.remove();
      }, 250);

      // Advance to next order
      nextCorrectOrder++;

      // Check if all clips are correct
      if (nextCorrectOrder > currentLevel.clips.length) {
        clearInterval(timerInterval);
        finishLevel(true);
      }
    } else {
      // Wrong answer
      button.classList.add('clip-card--wrong');
      currentMisses++;
      currentScore = Math.max(0, currentScore - 5);
      updateHUD();

      // Remove wrong class after animation
      setTimeout(() => {
        button.classList.remove('clip-card--wrong');
      }, 400);
    }
  }

  /**
   * Start the countdown timer
   */
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingTime--;
      updateHUD();

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        finishLevel(false);
      }
    }, 1000);
  }

  /**
   * Finish level (true = success, false = timeout)
   */
  function finishLevel(success) {
    clearInterval(timerInterval);

    if (success) {
      // Calculate final score
      const numClips = currentLevel.clips.length;
      currentScore = Math.max(
        0,
        100 * numClips - 5 * currentMisses + remainingTime * 2
      );

      // Add to total score
      totalScore += currentScore;

      // Show result
      elements.resultScore.textContent = String(currentScore);
      showScreen('result');
    } else {
      // Time's up
      showScreen('gameover');
    }
  }

  /**
   * Proceed to next level or ending
   */
  function proceedToNextLevel() {
    if (currentLevel.id < LEVELS.length) {
      const nextLevel = LEVELS[currentLevel.id];
      initializeLevel(nextLevel);
    } else {
      // All levels completed
      elements.endingScore.textContent = String(totalScore);
      showScreen('ending');
    }
  }

  /**
   * Retry current level
   */
  function retryLevel() {
    if (currentLevel) {
      initializeLevel(currentLevel);
    }
  }

  /**
   * Return to start screen
   */
  function backToStart() {
    clearInterval(timerInterval);
    currentLevel = null;
    currentMisses = 0;
    currentScore = 0;
    totalScore = 0;
    remainingTime = 0;
    nextCorrectOrder = 1;
    shuffledClips = [];

    // Reset HUD display
    const levelBold = elements.hudLevel.querySelector('b');
    if (levelBold) levelBold.textContent = '-';

    const timerBold = elements.hudTimer.querySelector('b');
    if (timerBold) timerBold.textContent = '-';

    const scoreBold = elements.hudScore.querySelector('b');
    if (scoreBold) scoreBold.textContent = '-';

    elements.hudTimer.classList.remove('hud-timer--warning');

    showScreen('start');
  }

  // ===== Event Listeners

  elements.btnStart.addEventListener('click', () => {
    const level1 = LEVELS[0];
    initializeLevel(level1);
  });

  elements.btnNextLevel.addEventListener('click', () => {
    proceedToNextLevel();
  });

  elements.btnRetry.addEventListener('click', () => {
    retryLevel();
  });

  elements.btnBackToStart.addEventListener('click', () => {
    backToStart();
  });

  // ===== Initialization
  showScreen('start');
})();
