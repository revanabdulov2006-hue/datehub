/**
 * DATEHUB - Interactive Romantic Date Invitation Experience
 * Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - 4-stage psychological flirty persuasion flow on "Xeyr"
 * - 5th stage impossible-to-click dodging runaway physics
 * - Dynamic button scaling (Bəli grows, Xeyr shrinks)
 * - Confetti & floating romantic particle engine
 * - Built-in Web Audio API sound synthesizer
 * - Sweet interactive Date Planner
 * - Luxury VIP Boarding Pass Generator with WhatsApp integration
 */

(function () {
  'use strict';

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const state = {
    noClickCount: 0,
    maxNoClicks: 4, // 4 clicks allowed, on 5th it evades
    dodgeCount: 0,
    soundEnabled: true,
    audioCtx: null,
    selectedVibe: '☕ Rahat Qəhvə & Şirniyyat',
    selectedDay: 'Şənbə Axşamı',
    selectedTime: '19:30',
    specialNote: '',
    isDodgingActive: false,
    dodgeQuotes: [
      'Yaxala görüm! 🏃‍♂️',
      'Upps, qaçdım! 💨',
      'Toxuna bilməzsən 😜',
      'Bəli-yə bas artıq! 💖',
      'Yaxınlaşma! 😂'
    ]
  };

  // Persuasion stages config for "Xeyr" clicks (100% funny memes, confident flirting)
  const persuasionStages = [
    {
      badge: '🤨 BİR DƏQİQƏ...',
      title: 'Dəqiq əminsən? 😏',
      subtitle: "Yəni deyirsən belə bir fürsəti əldən verirsən? Bir də düşün, sonra peşman olmaq yoxdur ha!",
      meme: 'assets/sideeye.gif',
      yesScale: 1.08,
      noScale: 1.0
    },
    {
      badge: '⚠️ XƏBƏRDARLIQ',
      title: 'Geri dönüşü olmayacaq! ⏳',
      subtitle: "Bax sonradan 'kaş ki razılaşaydım' demək yoxdur! Gözəl kofe və unudulmaz söhbətdən imtina etmək nə dərəcədə məntiqlidir?",
      meme: 'assets/shocked.gif',
      yesScale: 1.16,
      noScale: 1.0
    },
    {
      badge: '😏 BAX BELƏ OLMAZ',
      title: 'Hələ də inadkarlıq edirik?',
      subtitle: "Məncə özün də bilirsən ki, əslində görüşmək istəyirsən, sadəcə naz edirsən. Yalan deyirəm? 😉",
      meme: 'assets/smug.gif',
      yesScale: 1.24,
      noScale: 1.0
    },
    {
      badge: '🛑 SON ŞANSIN',
      title: 'Son qərarındır? Dəqiq?',
      subtitle: "Yaxşı oynayırsan, amma artıq limitlər doldu! Bir addım at, gör necə əla vaxt keçirəcəyik!",
      meme: 'assets/crying.gif',
      yesScale: 1.32,
      noScale: 1.0
    }
  ];

  // =========================================================================
  // DOM ELEMENTS
  // =========================================================================
  const elements = {
    // Screens
    introScreen: document.getElementById('intro-screen'),
    inviteScreen: document.getElementById('invite-screen'),
    successScreen: document.getElementById('success-screen'),
    ticketScreen: document.getElementById('ticket-screen'),

    // Screen 0: Romantic Rose Intro
    btnOpenInvite: document.getElementById('btn-open-invite'),
    roseTrigger: document.getElementById('rose-trigger'),

    // Screen 1: Invite
    statusBadge: document.getElementById('status-badge'),
    badgeText: document.getElementById('badge-text'),
    memeImg: document.getElementById('meme-img'),
    mainTitle: document.getElementById('main-title'),
    mainSubtitle: document.getElementById('main-subtitle'),
    buttonsCluster: document.getElementById('buttons-cluster'),
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),
    noText: document.getElementById('no-text'),

    // Sound toggle
    soundToggle: document.getElementById('sound-toggle'),
    soundOnIcon: document.querySelector('.sound-on'),
    soundOffIcon: document.querySelector('.sound-off'),

    // Screen 2: Planner Form
    vibeCards: document.querySelectorAll('.vibe-card'),
    dayChips: document.querySelectorAll('#day-chips .chip'),
    timeChips: document.querySelectorAll('#time-chips .chip'),
    customDayBtn: document.getElementById('custom-day-btn'),
    customDateContainer: document.getElementById('custom-date-container'),
    customDateInput: document.getElementById('custom-date-input'),
    specialNoteInput: document.getElementById('special-note'),
    btnGenerateTicket: document.getElementById('btn-generate-ticket'),

    // Screen 3: Boarding Pass
    ticketVibe: document.getElementById('ticket-vibe'),
    ticketDay: document.getElementById('ticket-day'),
    ticketTime: document.getElementById('ticket-time'),
    ticketNote: document.getElementById('ticket-note'),
    ticketNoteBox: document.getElementById('ticket-note-box'),
    btnInstagram: document.getElementById('btn-instagram'),
    btnCopyTicket: document.getElementById('btn-copy-ticket'),
    btnEditPlan: document.getElementById('btn-edit-plan'),

    // Overlays
    toast: document.getElementById('toast'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    particlesCanvas: document.getElementById('particles-canvas')
  };

  // =========================================================================
  // WEB AUDIO API SOUND SYNTHESIZER
  // =========================================================================
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playPopSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio pop error:', e);
    }
  }

  function playSqueakSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      console.warn('Audio squeak error:', e);
    }
  }

  function playWhooshSound() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
      console.warn('Audio whoosh error:', e);
    }
  }

  function playCelebrationFanfare() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [
        { f: 523.25, d: 0.15, delay: 0 },      // C5
        { f: 659.25, d: 0.15, delay: 0.14 },   // E5
        { f: 783.99, d: 0.15, delay: 0.28 },   // G5
        { f: 1046.50, d: 0.45, delay: 0.42 }   // C6
      ];

      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.delay);
        gain.gain.setValueAtTime(0, ctx.currentTime + n.delay);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + n.delay + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.delay + n.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + n.delay);
        osc.stop(ctx.currentTime + n.delay + n.d);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }

  // =========================================================================
  // ROMANTIC BACKGROUND MUSIC SYNTHESIZER (Lo-Fi Romantic Progression)
  // =========================================================================
  let musicInterval = null;
  let currentChordIndex = 0;

  const romanticChords = [
    [130.81, 196.00, 246.94, 329.63, 493.88], // Cmaj7
    [110.00, 164.81, 196.00, 261.63, 392.00], // Am7
    [87.31,  130.81, 174.61, 220.00, 329.63], // Fmaj7
    [98.00,  146.83, 196.00, 246.94, 293.66]  // Gsus4
  ];

  function playRomanticChord() {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const chord = romanticChords[currentChordIndex];
      currentChordIndex = (currentChordIndex + 1) % romanticChords.length;

      const chordTime = ctx.currentTime;
      const duration = 2.9;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, chordTime);

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, chordTime);

        const baseVolume = 0.04 / (chord.length * 0.4);
        gain.gain.setValueAtTime(0.001, chordTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(baseVolume, chordTime + idx * 0.08 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordTime + idx * 0.08);
        osc.stop(chordTime + duration);
      });
    } catch (e) {
      console.warn('Romantic chord synth error:', e);
    }
  }

  function startBackgroundMusic() {
    if (musicInterval) return;
    playRomanticChord();
    musicInterval = setInterval(playRomanticChord, 2800);
  }

  function stopBackgroundMusic() {
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  // Handle Opening Rose Intro Screen
  function handleOpenInvite() {
    playCelebrationFanfare();
    startBackgroundMusic();

    const intro = elements.introScreen;
    const invite = elements.inviteScreen;

    intro.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    intro.style.opacity = '0';
    intro.style.transform = 'scale(1.05)';

    setTimeout(() => {
      intro.classList.remove('active');
      intro.classList.add('hidden');

      invite.classList.remove('hidden');
      invite.classList.add('active');
      invite.style.opacity = '0';
      invite.style.transform = 'translateY(18px)';

      requestAnimationFrame(() => {
        invite.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        invite.style.opacity = '1';
        invite.style.transform = 'translateY(0)';
      });
    }, 450);
  }

  // =========================================================================
  // TOAST NOTIFICATION UTILITY
  // =========================================================================
  let toastTimeout = null;
  function showToast(msg) {
    if (!elements.toast) return;
    elements.toast.textContent = msg;
    elements.toast.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 3200);
  }

  // =========================================================================
  // SCREEN 1: "XEYR" CLICK & DODGE RUNAWAY BEHAVIOR
  // =========================================================================

  function handleNoClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }

    // CRITICAL: If dodging is active or 4 clicks reached, NEVER allow a 5th click!
    if (state.isDodgingActive || state.noClickCount >= state.maxNoClicks) {
      triggerDodge(e);
      return false;
    }

    state.noClickCount++;

    if (state.noClickCount <= state.maxNoClicks) {
      // Apply the corresponding persuasion stage (0-indexed)
      const stage = persuasionStages[state.noClickCount - 1];
      playSqueakSound();

      // Update badge
      elements.badgeText.textContent = stage.badge;
      
      // Update Meme image with smooth transition
      elements.memeImg.style.opacity = '0';
      elements.memeImg.style.transform = 'scale(0.85)';
      setTimeout(() => {
        elements.memeImg.src = stage.meme;
        elements.memeImg.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        elements.memeImg.style.opacity = '1';
        elements.memeImg.style.transform = 'scale(1)';
      }, 150);

      // Update texts
      elements.mainTitle.innerHTML = stage.title;
      elements.mainSubtitle.textContent = stage.subtitle;

      // Scale buttons: "Bəli" grows, "Xeyr" shrinks
      elements.btnYes.style.transform = `scale(${stage.yesScale})`;
      elements.btnYes.style.zIndex = '10';
      elements.btnNo.style.transform = `scale(${stage.noScale})`;

      // If this was the 4th click, activate dodging mode for the upcoming 5th attempt!
      if (state.noClickCount === state.maxNoClicks) {
        setupRunawayMode();
      }
    }
  }

  function setupRunawayMode() {
    state.isDodgingActive = true;
    state.dodgeCount = 0;

    const btn = elements.btnNo;
    const btnWidth = btn.offsetWidth || 120;
    const btnHeight = btn.offsetHeight || 44;

    const minX = 35;
    const maxX = Math.max(minX + 40, window.innerWidth - btnWidth - 35);
    const minY = 65;
    // CRITICAL: Strictly bounded at least 150px above screen bottom so it NEVER falls below!
    const maxY = Math.max(minY + 40, window.innerHeight - btnHeight - 150);

    const rect = btn.getBoundingClientRect();
    let initialTop = Math.min(rect.top, maxY);
    let initialLeft = Math.max(minX, Math.min(rect.left, maxX));

    btn.style.position = 'fixed';
    btn.style.left = `${initialLeft}px`;
    btn.style.top = `${initialTop}px`;
    btn.style.margin = '0';
    btn.style.transform = 'scale(1)';
    btn.style.zIndex = '10000';
    btn.classList.add('evading');

    // Bulletproof evasion interceptor: completely blocks mouse/touch/click on the button
    const evadeHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
      triggerDodge(e);
      return false;
    };

    ['mouseenter', 'mouseover', 'pointerenter', 'pointerover', 'pointerdown', 'mousedown', 'touchstart', 'click'].forEach(evt => {
      btn.addEventListener(evt, evadeHandler, { capture: true, passive: false });
    });
    
    document.addEventListener('mousemove', handlePointerProximity, { passive: true });
    document.addEventListener('pointermove', handlePointerProximity, { passive: true });

    // CRUCIAL: Since the user just made the 4th click, their cursor is currently resting right on the button!
    // Instantly leap away so the user CANNOT click a 5th time in place!
    setTimeout(() => {
      triggerDodge();
    }, 60);
  }

  function triggerDodge(pointerEvent) {
    if (!state.isDodgingActive) return;

    const now = Date.now();
    if (state.lastDodgeTime && now - state.lastDodgeTime < 75) return;
    state.lastDodgeTime = now;

    state.dodgeCount++;
    playWhooshSound();

    const btn = elements.btnNo;
    const btnWidth = btn.offsetWidth || 120;
    const btnHeight = btn.offsetHeight || 44;

    // Viewport boundaries: Keep well ABOVE bottom of screen so it NEVER falls below!
    const minX = 35;
    const maxX = Math.max(minX + 40, window.innerWidth - btnWidth - 35);
    const minY = 65;
    // CRITICAL: Strictly bounded at least 150px above screen bottom so it NEVER falls below!
    const maxY = Math.max(minY + 40, window.innerHeight - btnHeight - 150);

    const btnRect = btn.getBoundingClientRect();
    const currentX = btnRect.left;
    const currentY = btnRect.top;

    const yesRect = elements.btnYes.getBoundingClientRect();
    const cursorX = (pointerEvent && pointerEvent.clientX) ? pointerEvent.clientX : (currentX + btnWidth / 2);
    const cursorY = (pointerEvent && pointerEvent.clientY) ? pointerEvent.clientY : (currentY + btnHeight / 2);

    // Distance required scales with each dodge: starts at 220px and grows up to 450px!
    const minRequiredDistance = Math.min(450, 220 + state.dodgeCount * 40);

    let targetX = minX;
    let targetY = minY;
    let maxDistFromCursor = -1;

    for (let i = 0; i < 45; i++) {
      const candX = Math.floor(Math.random() * (maxX - minX)) + minX;
      const candY = Math.floor(Math.random() * (maxY - minY)) + minY;

      const distFromCurrent = Math.hypot(candX - currentX, candY - currentY);
      const distFromCursor = Math.hypot(candX - cursorX, candY - cursorY);
      
      const overlapsYes = (
        candX < yesRect.right + 30 &&
        candX + btnWidth > yesRect.left - 30 &&
        candY < yesRect.bottom + 30 &&
        candY + btnHeight > yesRect.top - 30
      );

      if (!overlapsYes && distFromCursor > 140 && distFromCurrent >= minRequiredDistance) {
        targetX = candX;
        targetY = candY;
        break;
      }

      if (!overlapsYes && distFromCursor > maxDistFromCursor) {
        maxDistFromCursor = distFromCursor;
        targetX = candX;
        targetY = candY;
      }
    }

    btn.style.position = 'fixed';
    btn.style.left = `${targetX}px`;
    btn.style.top = `${targetY}px`;
    btn.style.opacity = '1';
    btn.style.visibility = 'visible';
    btn.style.display = 'inline-flex';
    btn.style.transform = 'scale(1)';

    const randomQuote = state.dodgeQuotes[Math.floor(Math.random() * state.dodgeQuotes.length)];
    elements.noText.textContent = randomQuote;
  }

  function handlePointerProximity(e) {
    if (!state.isDodgingActive) return;
    const btn = elements.btnNo;
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const distX = e.clientX - btnCenterX;
    const distY = e.clientY - btnCenterY;
    const distance = Math.hypot(distX, distY);

    // If cursor approaches within 120px (well before touching the button), immediately dodge away!
    if (distance < 120) {
      triggerDodge(e);
    }
  }

  // =========================================================================
  // SCREEN 1 -> SCREEN 2: "BƏLİ, ƏLBƏTTƏ" ACCEPTANCE
  // =========================================================================

  function handleYesClick() {
    playCelebrationFanfare();
    launchConfetti();

    // Disable proximity listener and dodging state
    state.isDodgingActive = false;
    document.removeEventListener('mousemove', handlePointerProximity);
    document.removeEventListener('pointermove', handlePointerProximity);

    if (elements.btnNo) {
      elements.btnNo.classList.remove('evading');
      elements.btnNo.style.position = '';
      elements.btnNo.style.left = '';
      elements.btnNo.style.top = '';
    }

    // Switch screens
    elements.inviteScreen.classList.remove('active');
    elements.inviteScreen.classList.add('hidden');

    elements.successScreen.classList.remove('hidden');
    elements.successScreen.classList.add('active');

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Set today as minimum for date picker
    const today = new Date().toISOString().split('T')[0];
    elements.customDateInput.min = today;
  }

  // =========================================================================
  // SCREEN 2: DATE PLANNER INTERACTION
  // =========================================================================

  // Vibe Selection
  elements.vibeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.vibeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        state.selectedVibe = radio.value;
      }
      playPopSound();
    });
  });

  // Day Selection Chips
  elements.dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.dayChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      playPopSound();

      const dayValue = chip.dataset.day;
      if (dayValue === 'custom') {
        elements.customDateContainer.classList.remove('hidden');
        elements.customDateInput.focus();
        state.selectedDay = elements.customDateInput.value || 'Xüsusi Tarix';
      } else {
        elements.customDateContainer.classList.add('hidden');
        state.selectedDay = dayValue;
      }
    });
  });

  elements.customDateInput.addEventListener('change', (e) => {
    if (e.target.value) {
      const parts = e.target.value.split('-');
      if (parts.length === 3) {
        state.selectedDay = `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
    }
  });

  // Time Selection Chips
  elements.timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.timeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      playPopSound();
      state.selectedTime = chip.dataset.time;
    });
  });

  // =========================================================================
  // SCREEN 2 -> SCREEN 3: GENERATE VIP BOARDING PASS
  // =========================================================================

  function handleGenerateTicket() {
    playCelebrationFanfare();
    launchConfetti();

    // Collect special note
    state.specialNote = elements.specialNoteInput.value.trim();

    // Populate Boarding Pass details
    elements.ticketVibe.textContent = state.selectedVibe;
    elements.ticketDay.textContent = state.selectedDay;
    elements.ticketTime.textContent = state.selectedTime;

    if (state.specialNote) {
      elements.ticketNote.textContent = `"${state.specialNote}"`;
      elements.ticketNoteBox.style.display = 'block';
    } else {
      elements.ticketNoteBox.style.display = 'none';
    }

    // Switch screen to Ticket
    elements.successScreen.classList.remove('active');
    elements.successScreen.classList.add('hidden');

    elements.ticketScreen.classList.remove('hidden');
    elements.ticketScreen.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🎟️ VIP Biletin hazırlandı!');
  }

  // Instagram Direct Share Handler
  function handleInstagramShare() {
    playPopSound();
    const message = 
`Salam! 😊 Təklifini qəbul etdim 🥂

✨ Bizim Date Planımız:
📍 Plan: ${state.selectedVibe}
📅 Gün: ${state.selectedDay}
⏰ Saat: ${state.selectedTime}${state.specialNote ? `\n💌 Qeyd: "${state.specialNote}"` : ''}

Artıq VIP bilet rəsmi təsdiqləndi, gecikmək qətiyyən olmaz! 😉`;

    navigator.clipboard.writeText(message).then(() => {
      showToast('💌 Bilet kopyalandı! Instagram Direct açılır...');
    }).catch(() => {
      showToast('Instagram Direct açılır...');
    });

    setTimeout(() => {
      window.open('https://www.instagram.com/direct/inbox/', '_blank');
    }, 450);
  }

  // Copy Ticket Summary
  function handleCopyTicket() {
    playPopSound();
    const textToCopy = 
`🎟️ BİZİM VIP DATE BİLETİMİZ 🥂
📍 Plan: ${state.selectedVibe}
📅 Gün: ${state.selectedDay}
⏰ Saat: ${state.selectedTime}
${state.specialNote ? `💌 Qeyd: ${state.specialNote}\n` : ''}✓ Status: Rəsmi Təsdiqləndi!`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('📋 Bilet məlumatları kopyalandı!');
    }).catch(() => {
      showToast('Xəta baş verdi, mətni kopyalaya bilmədik');
    });
  }

  // Edit Plan Button
  function handleEditPlan() {
    playPopSound();
    elements.ticketScreen.classList.remove('active');
    elements.ticketScreen.classList.add('hidden');

    elements.successScreen.classList.remove('hidden');
    elements.successScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // SOUND TOGGLE HANDLER
  // =========================================================================
  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    if (state.soundEnabled) {
      elements.soundOnIcon.classList.remove('hidden');
      elements.soundOffIcon.classList.add('hidden');
      playPopSound();
      startBackgroundMusic();
      showToast('🔊 Səs aktiv edildi');
    } else {
      elements.soundOnIcon.classList.add('hidden');
      elements.soundOffIcon.classList.remove('hidden');
      stopBackgroundMusic();
      showToast('🔇 Səs bağlandı');
    }
  }

  // =========================================================================
  // BACKGROUND PARTICLES CANVAS (Gentle Floating Hearts & Stars)
  // =========================================================================
  function initParticles() {
    const canvas = elements.particlesCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = Math.min(28, Math.floor(window.innerWidth / 35));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 4,
        speedY: Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.15,
        type: Math.random() > 0.4 ? 'heart' : 'sparkle'
      });
    }

    function drawHeart(x, y, size, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ff2a7a';
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      // bottom left curve
      ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
      // bottom right curve
      ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      // top right curve
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawSparkle(x, y, size, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffd1dc';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        if (p.type === 'heart') {
          drawHeart(p.x, p.y, p.size, p.opacity);
        } else {
          drawSparkle(p.x, p.y, p.size, p.opacity);
        }
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // CELEBRATION CONFETTI ENGINE (Pure Vanilla HTML5 Canvas)
  // =========================================================================
  function launchConfetti() {
    const canvas = elements.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiList = [];
    const colors = ['#ff2a7a', '#f43f5e', '#fbbf24', '#f472b6', '#c084fc', '#38bdf8', '#ffffff'];
    const totalPieces = 120;

    for (let i = 0; i < totalPieces; i++) {
      confettiList.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 120,
        y: canvas.height / 2 + (Math.random() - 0.5) * 80,
        w: Math.random() * 9 + 5,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 18,
        velY: -(Math.random() * 16 + 8),
        gravity: 0.38,
        drag: 0.96,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let startTime = performance.now();

    function renderConfetti(currentTime) {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      confettiList.forEach(c => {
        c.velX *= c.drag;
        c.velY = c.velY * c.drag + c.gravity;
        c.x += c.velX;
        c.y += c.velY;
        c.rotation += c.rotSpeed;

        if (elapsed > 1800) {
          c.opacity = Math.max(0, c.opacity - 0.02);
        }

        if (c.opacity > 0 && c.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.globalAlpha = c.opacity;
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
          ctx.restore();
        }
      });

      if (alive && elapsed < 4500) {
        requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(renderConfetti);
  }

  // =========================================================================
  // INITIALIZATION & EVENT BINDINGS
  // =========================================================================
  function init() {
    // Opening screen triggers
    if (elements.btnOpenInvite) {
      elements.btnOpenInvite.addEventListener('click', handleOpenInvite);
    }
    if (elements.roseTrigger) {
      elements.roseTrigger.addEventListener('click', handleOpenInvite);
    }

    // Buttons
    elements.btnNo.addEventListener('click', handleNoClick);
    elements.btnYes.addEventListener('click', handleYesClick);
    elements.soundToggle.addEventListener('click', toggleSound);

    // Planner actions
    elements.btnGenerateTicket.addEventListener('click', handleGenerateTicket);
    elements.btnInstagram.addEventListener('click', handleInstagramShare);
    elements.btnCopyTicket.addEventListener('click', handleCopyTicket);
    elements.btnEditPlan.addEventListener('click', handleEditPlan);

    // Background Canvas
    initParticles();
  }

  // DOM Content Loaded Safe Runner
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
