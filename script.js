(() => {
  const steps = Array.from(document.querySelectorAll('[data-step]'));
  const progress = document.querySelector('.progress');
  const backButton = document.getElementById('back-button');
  const backLabel = document.getElementById('back-label');
  const photoFrame = document.querySelector('.photo-frame');
  const confettiLayer = document.querySelector('.confetti-layer');
  const gameCount = document.getElementById('game-count');
  const hearts = Array.from(document.querySelectorAll('.hearts span'));
  const openingScene = document.getElementById('opening-scene');
  const pageShell = document.querySelector('.page-shell');
  const reasons = [
    'Your laugh makes an ordinary day feel special.',
    'You make every place feel a little more like home.',
    'You remember the little things that matter to me.',
    'You are my favourite person to do nothing with.',
    'You make me want to be a kinder, braver person.'
  ];
  const photos = [
    { src: 'assets/memory-1.png', label: 'Together at a celebration' },
    { src: 'assets/memory-2.png', label: 'A cozy selfie together' },
    { src: 'assets/memory-3.png', label: 'A riverside selfie' },
    { src: 'assets/memory-4.png', label: 'Sharing a laugh over a little cake' },
    { src: 'assets/memory-5.png', label: 'A sweet moment in matching pink' },
    { src: 'assets/memory-6.png', label: 'A playful kiss and a smile' },
    { src: 'assets/memory-7.png', label: 'A night out together' },
    { src: 'assets/memory-8.png', label: 'A playful day with a bunny balloon' },
    { src: 'assets/memory-9.png', label: 'A sweet moment together in pink' }
  ];
  const differenceTiles = new Set([1, 3, 5]);
  let currentStep = 0;
  let foundTiles = new Set();
  let checkedReasons = new Set();
  let enterTimer;
  let autoAdvanceTimer;
  let openingTimer;
  let audioContext;
  let musicMaster;
  let musicTimer;
  let musicPlaying = false;

  const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 392.0,
    440.0, 523.25, 659.25, 523.25, 493.88, 587.33, 523.25, 392.0];
  const beatLength = 0.46;

  const playNote = (frequency, startAt, duration, volume, waveform = 'sine') => {
    if (!audioContext || !musicMaster) return;
    const oscillator = audioContext.createOscillator();
    const envelope = audioContext.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.045);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(envelope);
    envelope.connect(musicMaster);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.025);
  };

  const playMusicPhrase = () => {
    if (!musicPlaying || !audioContext) return;
    const startAt = audioContext.currentTime + 0.04;
    melody.forEach((frequency, index) => {
      const noteAt = startAt + index * beatLength;
      playNote(frequency, noteAt, 0.72, 0.032);
      if (index % 4 === 0) playNote(frequency / 2, noteAt, 1.25, 0.009, 'triangle');
    });
    musicTimer = window.setTimeout(playMusicPhrase, melody.length * beatLength * 1000);
  };

  const setMusic = async (shouldPlay) => {
    const musicButton = document.getElementById('music-toggle');
    const musicLabel = document.getElementById('music-label');
    if (shouldPlay) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('Web Audio is not available in this browser.');
        if (!audioContext) {
          audioContext = new AudioContextClass();
          musicMaster = audioContext.createGain();
          musicMaster.gain.value = 0.72;
          musicMaster.connect(audioContext.destination);
        }
        await audioContext.resume();
        const now = audioContext.currentTime;
        musicMaster.gain.cancelScheduledValues(now);
        musicMaster.gain.setTargetAtTime(0.72, now, 0.08);
        musicPlaying = true;
        musicButton.setAttribute('aria-pressed', 'true');
        musicButton.classList.add('playing');
        musicLabel.textContent = 'Music on';
        playMusicPhrase();
      } catch {
        musicPlaying = false;
        musicButton.setAttribute('aria-pressed', 'false');
        musicButton.classList.remove('playing');
        musicLabel.textContent = 'Audio unavailable';
      }
      return;
    }
    musicPlaying = false;
    window.clearTimeout(musicTimer);
    if (audioContext && musicMaster) {
      const now = audioContext.currentTime;
      musicMaster.gain.cancelScheduledValues(now);
      musicMaster.gain.setTargetAtTime(0.0001, now, 0.045);
    }
    musicButton.setAttribute('aria-pressed', 'false');
    musicButton.classList.remove('playing');
    musicLabel.textContent = 'Music off';
  };

  const finishOpening = () => {
    if (!openingScene || openingScene.classList.contains('is-leaving')) return;
    window.clearTimeout(openingTimer);
    openingScene.classList.add('is-leaving');
    pageShell.classList.add('site-revealing');
    window.setTimeout(() => openingScene.remove(), 850);
  };

  const celebrate = () => {
    confettiLayer.replaceChildren();
    const colors = ['#d65d83', '#e6ad51', '#f18fa8', '#a95c67', '#fffdf6'];
    for (let index = 0; index < 26; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--left', `${Math.random() * 100}%`);
      piece.style.setProperty('--delay', `${Math.random() * 850}ms`);
      piece.style.setProperty('--duration', `${1900 + Math.random() * 1500}ms`);
      piece.style.setProperty('--drift', `${Math.random() * 150 - 75}px`);
      piece.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty('--confetti-color', colors[index % colors.length]);
      if (index % 4 === 0) piece.classList.add('heart-confetti');
      confettiLayer.append(piece);
    }
    window.setTimeout(() => confettiLayer.replaceChildren(), 4200);
  };

  const showStep = (next) => {
    currentStep = Math.max(0, Math.min(steps.length - 1, next));
    steps.forEach((section, index) => {
      section.hidden = index !== currentStep;
      section.setAttribute('aria-hidden', String(index !== currentStep));
    });
    const activeStep = steps[currentStep];
    window.clearTimeout(enterTimer);
    window.clearTimeout(autoAdvanceTimer);
    activeStep.classList.remove('is-entering');
    void activeStep.offsetWidth;
    activeStep.classList.add('is-entering');
    const isBloom = currentStep === 2;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    enterTimer = window.setTimeout(() => activeStep.classList.remove('is-entering'), isBloom && !reducedMotion ? 7000 : 1350);
    if (isBloom) {
      const bloomStep = currentStep;
      autoAdvanceTimer = window.setTimeout(() => {
        if (currentStep === bloomStep) showStep(bloomStep + 1);
      }, reducedMotion ? 1350 : 6250);
    }
    if (currentStep === 4) celebrate();
    backButton.disabled = currentStep === 0;
    backLabel.textContent = currentStep === 0 ? 'A little surprise' : 'Back';
    progress.querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('active', index === currentStep);
      button.classList.toggle('complete', index < currentStep);
      if (index === currentStep) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  };

  const renderPuzzle = () => {
    photoFrame.replaceChildren();
    photos.forEach((photo, index) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `photo-tile tile-${index}${foundTiles.has(index) ? ' found' : ''}`;
      tile.setAttribute('aria-label', `${photo.label}${foundTiles.has(index) ? ', selected as a favorite' : ''}`);
      tile.setAttribute('aria-pressed', String(foundTiles.has(index)));
      const image = document.createElement('img');
      image.className = 'tile-image';
      image.src = photo.src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      tile.append(image);
      if (differenceTiles.has(index)) {
        const target = document.createElement('span');
        target.className = 'spot-target';
        target.setAttribute('aria-hidden', 'true');
        tile.append(target);
      }
      if (foundTiles.has(index)) {
        const marker = document.createElement('span');
        marker.className = 'found-mark';
        marker.textContent = '♥';
        marker.setAttribute('aria-hidden', 'true');
        tile.append(marker);
      }
      tile.addEventListener('click', () => {
        if (!differenceTiles.has(index) || foundTiles.has(index)) return;
        foundTiles.add(index);
        renderPuzzle();
      });
      photoFrame.append(tile);
    });
    gameCount.textContent = `${foundTiles.size} of 3 found`;
    hearts.forEach((heart, index) => {
      heart.textContent = foundTiles.size > index ? '♥' : '♡';
      heart.setAttribute('aria-label', foundTiles.size > index ? 'Found' : 'Not found');
    });
  };

  const renderReasons = () => {
    const list = document.getElementById('reason-list');
    list.replaceChildren();
    reasons.forEach((reason, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `reason${checkedReasons.has(index) ? ' selected' : ''}`;
      button.setAttribute('aria-pressed', String(checkedReasons.has(index)));
      const box = document.createElement('span');
      box.className = 'checkbox';
      box.setAttribute('aria-hidden', 'true');
      if (checkedReasons.has(index)) box.textContent = '✓';
      const text = document.createElement('span');
      text.textContent = reason;
      button.append(box, text);
      button.addEventListener('click', () => {
        if (checkedReasons.has(index)) checkedReasons.delete(index);
        else checkedReasons.add(index);
        renderReasons();
      });
      list.append(button);
    });
    const note = document.getElementById('selection-note');
    if (checkedReasons.size === 0) note.textContent = 'Pick any that feel like us.';
    else note.textContent = `${checkedReasons.size} little ${checkedReasons.size === 1 ? 'thing' : 'things'} checked — I love them all.`;
  };

  steps.forEach((_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'progress-dot';
    button.textContent = String(index + 1);
    button.setAttribute('aria-label', `Go to step ${index + 1}`);
    button.addEventListener('click', () => showStep(index));
    progress.append(button);
  });

  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => showStep(currentStep + 1)));
  backButton.addEventListener('click', () => showStep(currentStep - 1));
  document.getElementById('brand-home').addEventListener('click', event => { event.preventDefault(); showStep(0); });
  document.getElementById('try-again').addEventListener('click', () => { foundTiles.clear(); renderPuzzle(); });
  document.getElementById('show-me').addEventListener('click', () => { differenceTiles.forEach(tile => foundTiles.add(tile)); renderPuzzle(); });
  document.getElementById('music-toggle').addEventListener('click', () => {
    setMusic(!musicPlaying);
  });

  if (openingScene) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    openingTimer = window.setTimeout(finishOpening, reducedMotion ? 900 : 5600);
    document.getElementById('skip-opening').addEventListener('click', finishOpening);
  }

  renderPuzzle();
  renderReasons();
  showStep(0);
})();
