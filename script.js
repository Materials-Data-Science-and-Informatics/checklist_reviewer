document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Particles.js (if used)
    if (window.particlesJS && document.getElementById("particles-js")) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3 },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 2, "direction": "none" }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.8 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .slide-up');
    animatedElements.forEach(el => observer.observe(el));

    // 3. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    document.querySelectorAll('[data-designer-key]').forEach((el) => {
        el.addEventListener('click', () => {
            const key = el.getAttribute('data-designer-key');
            openInfoModal(key);
            document.querySelectorAll('.designer-hit.is-selected').forEach((n) => n.classList.remove('is-selected'));
            el.classList.add('is-selected');
        });
    });

    initHeroDemo();
    initPosterLightbox();
    initPlaygroundGate();
});

const PLAYGROUND_URL = 'https://hemati.xyz/checklist_reviewer_playground';

let playgroundGateLastFocus = null;

function openPlaygroundGateModal() {
    const modal = document.getElementById('playgroundGateModal');
    const confirmBtn = document.getElementById('playgroundGateConfirm');
    if (!modal) return;
    playgroundGateLastFocus = document.activeElement;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    confirmBtn?.focus();
}

function closePlaygroundGateModal() {
    const modal = document.getElementById('playgroundGateModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    if (playgroundGateLastFocus && typeof playgroundGateLastFocus.focus === 'function') {
        playgroundGateLastFocus.focus();
    }
    playgroundGateLastFocus = null;
}

function confirmPlaygroundOpen() {
    window.open(PLAYGROUND_URL, '_blank', 'noopener,noreferrer');
    closePlaygroundGateModal();
}

function initPlaygroundGate() {
    const modal = document.getElementById('playgroundGateModal');
    const trigger = document.getElementById('playgroundGateTrigger');
    const confirmBtn = document.getElementById('playgroundGateConfirm');
    if (!modal || !trigger) return;

    trigger.addEventListener('click', openPlaygroundGateModal);
    confirmBtn?.addEventListener('click', confirmPlaygroundOpen);
    modal.querySelectorAll('[data-playground-gate-close]').forEach((el) => {
        el.addEventListener('click', closePlaygroundGateModal);
    });
}

/**
 * Hero mock card: ring cursor on setup only — upload → dropdowns → Run Review → checklist → analysis (no cursor) → loop.
 * CTA still skips setup and jumps to review.
 */
function initHeroDemo() {
    const root = document.querySelector('[data-hero-demo]');
    if (!root) return;

    const scenes = {
        setup: root.querySelector('[data-hero-scene="setup"]'),
        review: root.querySelector('[data-hero-scene="review"]'),
        analysis: root.querySelector('[data-hero-scene="analysis"]'),
    };
    const cta = root.querySelector('.hero-demo-cta');
    const dots = root.querySelectorAll('[data-step-dot]');
    const rows = [...root.querySelectorAll('.hero-check-row')];
    const meterFill = root.querySelector('.hero-demo-meter-fill');
    const passCountEl = root.querySelector('[data-analysis-pass]');
    const warnCountEl = root.querySelector('[data-analysis-warn]');
    const scoreLabel = root.querySelector('[data-analysis-score-label]');
    const dropzone = root.querySelector('[data-hero-dropzone]');
    const uploadStatus = root.querySelector('[data-hero-upload-status]');
    const uploadBarEl = root.querySelector('[data-hero-upload-bar]');
    const uploadBadge = root.querySelector('[data-hero-upload-badge]');
    const filenameEl = root.querySelector('[data-hero-filename]');
    const hintEl = root.querySelector('[data-hero-drop-hint]');
    const uploadMeta = root.querySelector('[data-hero-upload-meta]');
    const cursorEl = root.querySelector('[data-hero-cursor]');
    const ddChecklist = root.querySelector('[data-hero-dd="checklist"]');
    const ddProcess = root.querySelector('[data-hero-dd="process"]');
    const triggerChecklist = root.querySelector('[data-hero-dd-trigger="checklist"]');
    const triggerProcess = root.querySelector('[data-hero-dd-trigger="process"]');
    const checklistDisplay = root.querySelector('[data-dd-checklist-display]');
    const processDisplay = root.querySelector('[data-dd-process-display]');
    const optChecklistMyMl = root.querySelector('[data-hero-dd-opt="checklist-my-ml"]');
    const optProcessSimple = root.querySelector('[data-hero-dd-opt="process-simple"]');

    const outcomes = ['done', 'fail', 'done'];
    const prefersReduced =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pace = prefersReduced
        ? {
              setupIntro: 200,
              upload: 0,
              afterUploadBeat: 350,
              cursorMove: 0,
              cursorClick: 45,
              ddOpenPause: 90,
              afterDdPick: 160,
              betweenDdAndCta: 280,
              ctaPress: 70,
              reviewStartDelay: 0,
              reviewLoad: 0,
              reviewGap: 0,
              afterReviewBatch: 80,
              analysisHold: 4500,
              beforeNextLoop: 900,
          }
        : {
              setupIntro: 520,
              upload: 2550,
              afterUploadBeat: 600,
              cursorMove: 540,
              cursorClick: 125,
              ddOpenPause: 260,
              afterDdPick: 320,
              betweenDdAndCta: 480,
              ctaPress: 260,
              reviewStartDelay: 400,
              reviewLoad: 920,
              reviewGap: 380,
              afterReviewBatch: 500,
              analysisHold: 4600,
              beforeNextLoop: 1500,
          };

    let cycleToken = 0;
    let analysisTimer = null;
    const reviewTimers = [];
    const setupTimers = [];

    const clearReviewTimers = () => {
        while (reviewTimers.length) {
            const id = reviewTimers.pop();
            clearTimeout(id);
        }
    };

    const clearSetupTimers = () => {
        while (setupTimers.length) {
            const id = setupTimers.pop();
            clearTimeout(id);
        }
    };

    const clearAnalysisTimer = () => {
        if (analysisTimer) {
            clearTimeout(analysisTimer);
            analysisTimer = null;
        }
    };

    const q = (token, fn, ms) => {
        const id = window.setTimeout(() => {
            if (token !== cycleToken) return;
            fn();
        }, ms);
        setupTimers.push(id);
    };

    const setStepDot = (step) => {
        dots.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === step);
        });
    };

    const setScene = (name) => {
        const order = ['setup', 'review', 'analysis'];
        const idx = order.indexOf(name);
        Object.entries(scenes).forEach(([key, el]) => {
            if (!el) return;
            const active = key === name;
            el.classList.toggle('is-active', active);
            el.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
        if (idx >= 0) setStepDot(idx);
    };

    const flashTarget = (el) => {
        if (!el) return;
        el.classList.remove('hero-demo-cursor-flash');
        void el.offsetWidth;
        el.classList.add('hero-demo-cursor-flash');
    };

    const moveCursorToEl = (el, token, done) => {
        if (!cursorEl || !el) {
            done?.();
            return;
        }
        cursorEl.classList.add('is-visible');
        const rr = root.getBoundingClientRect();
        const tr = el.getBoundingClientRect();
        const cx = tr.left - rr.left + tr.width * 0.5;
        const cy = tr.top - rr.top + tr.height * 0.5;
        cursorEl.style.setProperty('--cx', `${cx}px`);
        cursorEl.style.setProperty('--cy', `${cy}px`);
        q(token, () => done?.(), prefersReduced ? 0 : pace.cursorMove);
    };

    const doCursorClick = (token, flashEl, done) => {
        if (!cursorEl) {
            done?.();
            return;
        }
        if (flashEl) flashTarget(flashEl);
        cursorEl.classList.add('is-clicking');
        q(token, () => {
            cursorEl.classList.remove('is-clicking');
            done?.();
        }, prefersReduced ? 40 : pace.cursorClick);
    };

    const iconPending = (box) => {
        box.innerHTML = '<i class="fa-regular fa-circle check-icon-pending" aria-hidden="true"></i>';
    };
    const iconLoading = (box) => {
        box.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>';
    };
    const iconDone = (box) => {
        box.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
    };
    const iconFail = (box) => {
        box.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    };

    const resetReviewRows = () => {
        rows.forEach((row) => {
            row.classList.remove('done', 'fail', 'active');
            row.classList.add('check-row--pending');
            const box = row.querySelector('.check-box');
            if (box) iconPending(box);
        });
    };

    const applyOutcome = (row, outcome) => {
        row.classList.remove('check-row--pending', 'active');
        const box = row.querySelector('.check-box');
        if (!box) return;
        if (outcome === 'done') {
            row.classList.add('done');
            iconDone(box);
        } else {
            row.classList.add('fail');
            iconFail(box);
        }
    };

    const updateAnalysisPanel = () => {
        const pass = outcomes.filter((o) => o === 'done').length;
        const warn = outcomes.filter((o) => o === 'fail').length;
        const score = outcomes.length ? pass / outcomes.length : 0;
        if (passCountEl) passCountEl.textContent = String(pass);
        if (warnCountEl) warnCountEl.textContent = String(warn);
        if (meterFill) meterFill.style.setProperty('--score', score.toFixed(4));
        if (scoreLabel) {
            scoreLabel.textContent = `${Math.round(score * 100)}%`;
        }
    };

    const resetAwaitingUpload = () => {
        if (dropzone) {
            dropzone.classList.add('hero-demo-dropzone--empty');
            dropzone.classList.remove('hero-demo-dropzone--uploading');
        }
        filenameEl?.classList.add('hero-demo-filename--hidden');
        if (hintEl) hintEl.style.removeProperty('display');
        uploadMeta?.classList.add('hero-demo-upload-meta--hidden');
        uploadBarEl?.classList.remove('hero-demo-upload-bar--busy');
        if (uploadBadge) {
            uploadBadge.className = 'hero-demo-badge hero-demo-badge--hidden';
            uploadBadge.innerHTML = '<i class="fa-solid fa-arrow-up-from-bracket"></i>';
        }
        if (uploadStatus) uploadStatus.textContent = 'Uploading…';
        if (cta) cta.classList.remove('is-simulated-press');
    };

    const beginUploadAfterClick = () => {
        dropzone?.classList.remove('hero-demo-dropzone--empty');
        dropzone?.classList.add('hero-demo-dropzone--uploading');
        filenameEl?.classList.remove('hero-demo-filename--hidden');
        if (hintEl) hintEl.style.display = 'none';
        uploadMeta?.classList.remove('hero-demo-upload-meta--hidden');
        uploadBarEl?.classList.add('hero-demo-upload-bar--busy');
        if (uploadBadge) {
            uploadBadge.classList.remove('hero-demo-badge--hidden');
            uploadBadge.className = 'hero-demo-badge hero-demo-badge--upload';
            uploadBadge.innerHTML = '<i class="fa-solid fa-arrow-up-from-bracket"></i>';
        }
        if (uploadStatus) uploadStatus.textContent = 'Uploading…';
    };

    const finishUploadVisuals = () => {
        dropzone?.classList.remove('hero-demo-dropzone--uploading');
        uploadBarEl?.classList.remove('hero-demo-upload-bar--busy');
        if (uploadStatus) uploadStatus.textContent = 'Ready to analyze';
        if (uploadBadge) {
            uploadBadge.className = 'hero-demo-badge hero-demo-badge--ok';
            uploadBadge.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
    };

    const resetDropdowns = () => {
        ddChecklist?.classList.remove('is-open');
        ddProcess?.classList.remove('is-open');
        if (checklistDisplay) checklistDisplay.textContent = 'Select checklist…';
        if (processDisplay) processDisplay.textContent = 'Select process…';
        root.querySelectorAll('.hero-demo-dd-option').forEach((o) => o.classList.remove('is-picked'));
    };

    const pickChecklistMyMl = () => {
        ddChecklist?.classList.remove('is-open');
        if (checklistDisplay) checklistDisplay.textContent = 'My ML Reproducibility Checklist';
        optChecklistMyMl?.classList.add('is-picked');
    };

    const pickProcessSimple = () => {
        ddProcess?.classList.remove('is-open');
        if (processDisplay) processDisplay.textContent = 'Simple Review';
        optProcessSimple?.classList.add('is-picked');
    };

    const snapSetupToCompleteState = () => {
        dropzone?.classList.remove('hero-demo-dropzone--empty', 'hero-demo-dropzone--uploading');
        filenameEl?.classList.remove('hero-demo-filename--hidden');
        if (hintEl) hintEl.style.display = 'none';
        uploadMeta?.classList.remove('hero-demo-upload-meta--hidden');
        uploadBarEl?.classList.remove('hero-demo-upload-bar--busy');
        finishUploadVisuals();
        ddChecklist?.classList.remove('is-open');
        ddProcess?.classList.remove('is-open');
        if (checklistDisplay) checklistDisplay.textContent = 'My ML Reproducibility Checklist';
        if (processDisplay) processDisplay.textContent = 'Simple Review';
        root.querySelectorAll('.hero-demo-dd-option').forEach((o) => o.classList.remove('is-picked'));
        optChecklistMyMl?.classList.add('is-picked');
        optProcessSimple?.classList.add('is-picked');
        if (uploadBadge) {
            uploadBadge.classList.remove('hero-demo-badge--hidden');
            uploadBadge.className = 'hero-demo-badge hero-demo-badge--ok';
            uploadBadge.innerHTML = '<i class="fa-solid fa-check"></i>';
        }
    };

    const scheduleBackToSetup = (token) => {
        clearAnalysisTimer();
        analysisTimer = window.setTimeout(() => {
            if (token !== cycleToken) return;
            clearReviewTimers();
            resetReviewRows();
            if (cta) cta.classList.remove('is-busy');
            if (cursorEl) cursorEl.classList.remove('is-visible');
            cycleToken += 1;
            const next = cycleToken;
            setScene('setup');
            resetDropdowns();
            resetAwaitingUpload();
            const tLoop = window.setTimeout(() => {
                if (next !== cycleToken) return;
                runSetupPhase(next);
            }, pace.beforeNextLoop);
            setupTimers.push(tLoop);
        }, pace.analysisHold);
    };

    const runReviewStep = (i, token) => {
        if (token !== cycleToken) return;
        if (i >= rows.length) {
            updateAnalysisPanel();
            const t = window.setTimeout(() => {
                if (token !== cycleToken) return;
                setScene('analysis');
                scheduleBackToSetup(token);
            }, pace.afterReviewBatch);
            reviewTimers.push(t);
            return;
        }

        const row = rows[i];
        row.classList.remove('check-row--pending');
        row.classList.add('active');
        const box = row.querySelector('.check-box');
        if (box) iconLoading(box);

        const tLoad = window.setTimeout(() => {
            if (token !== cycleToken) return;
            applyOutcome(row, outcomes[i]);
            const tNext = window.setTimeout(() => runReviewStep(i + 1, token), pace.reviewGap);
            reviewTimers.push(tNext);
        }, pace.reviewLoad);
        reviewTimers.push(tLoad);
    };

    const beginReviewPhase = (token) => {
        if (token !== cycleToken) return;
        clearSetupTimers();
        if (cta) {
            cta.classList.remove('is-simulated-press');
            cta.classList.add('is-busy');
        }
        setScene('review');
        resetReviewRows();
        if (cursorEl) cursorEl.classList.remove('is-visible');

        const t0 = window.setTimeout(() => runReviewStep(0, token), pace.reviewStartDelay);
        reviewTimers.push(t0);
    };

    const runSetupPhase = (token) => {
        if (token !== cycleToken) return;
        clearSetupTimers();
        setScene('setup');
        resetAwaitingUpload();
        resetDropdowns();
        if (cta) cta.classList.remove('is-busy');

        q(token, () => {
            moveCursorToEl(dropzone, token, () => {
                doCursorClick(token, dropzone, () => {
                    beginUploadAfterClick();
                    q(token, () => {
                        finishUploadVisuals();
                        q(token, () => {
                            moveCursorToEl(triggerChecklist, token, () => {
                                doCursorClick(token, triggerChecklist, () => {
                                    ddChecklist?.classList.add('is-open');
                                    q(token, () => {
                                        moveCursorToEl(optChecklistMyMl, token, () => {
                                            doCursorClick(token, optChecklistMyMl, () => {
                                                pickChecklistMyMl();
                                                q(token, () => {
                                                    moveCursorToEl(triggerProcess, token, () => {
                                                        doCursorClick(token, triggerProcess, () => {
                                                            ddProcess?.classList.add('is-open');
                                                            q(token, () => {
                                                                moveCursorToEl(optProcessSimple, token, () => {
                                                                    doCursorClick(token, optProcessSimple, () => {
                                                                        pickProcessSimple();
                                                                        q(token, () => {
                                                                            moveCursorToEl(cta, token, () => {
                                                                                doCursorClick(token, cta, () => {
                                                                                    if (cta) cta.classList.add('is-simulated-press');
                                                                                    q(token, () => {
                                                                                        if (cta) cta.classList.remove('is-simulated-press');
                                                                                        if (cursorEl) cursorEl.classList.remove('is-visible');
                                                                                        beginReviewPhase(token);
                                                                                    }, pace.ctaPress);
                                                                                });
                                                                            });
                                                                        }, pace.betweenDdAndCta);
                                                                    });
                                                                });
                                                            }, pace.ddOpenPause);
                                                        });
                                                    });
                                                }, pace.afterDdPick);
                                            });
                                        });
                                    }, pace.ddOpenPause);
                                });
                            });
                        }, pace.afterUploadBeat);
                    }, pace.upload);
                });
            });
        }, pace.setupIntro);
    };

    const skipSetupToReview = () => {
        if (cta && cta.classList.contains('is-busy')) return;
        cycleToken += 1;
        const token = cycleToken;
        clearSetupTimers();
        clearReviewTimers();
        clearAnalysisTimer();
        snapSetupToCompleteState();
        if (cta) cta.classList.remove('is-simulated-press');
        if (cursorEl) cursorEl.classList.remove('is-visible');
        beginReviewPhase(token);
    };

    if (cta) {
        cta.addEventListener('click', skipSetupToReview);
    }

    resetReviewRows();
    setScene('setup');
    resetAwaitingUpload();
    resetDropdowns();
    cycleToken += 1;
    runSetupPhase(cycleToken);
}

function initPosterLightbox() {
    const modal = document.getElementById('imageModal');
    if (!modal) return;

    const img = document.getElementById('fullPoster');
    const viewport = modal.querySelector('[data-lightbox-viewport]');
    const toolbar = modal.querySelector('.lightbox-toolbar');
    if (!img || !viewport || !toolbar) return;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const state = {
        scale: 1,
        isDragging: false,
        startX: 0,
        startY: 0,
        startScrollLeft: 0,
        startScrollTop: 0,
        raf: null,
    };

    const MIN_SCALE = 0.15;
    const MAX_SCALE = 6;

    const getViewportPadding = () => {
        const cs = window.getComputedStyle(viewport);
        const px = Number.parseFloat(cs.paddingLeft) || 0;
        const py = Number.parseFloat(cs.paddingTop) || 0;
        return { padX: px, padY: py };
    };

    const updatePadding = () => {
        const nw = img.naturalWidth || 0;
        const nh = img.naturalHeight || 0;
        const scaledW = nw * state.scale;
        const scaledH = nh * state.scale;
        const vw = viewport.clientWidth || 0;
        const vh = viewport.clientHeight || 0;

        const padX = Math.max(0, (vw - scaledW) / 2);
        const padY = Math.max(0, (vh - scaledH) / 2);
        viewport.style.setProperty('--lb-pad-x', `${padX}px`);
        viewport.style.setProperty('--lb-pad-y', `${padY}px`);
    };

    const scheduleApplyScale = () => {
        if (state.raf) return;
        state.raf = window.requestAnimationFrame(() => {
            state.raf = null;
            img.style.transform = `scale(${state.scale})`;
            updatePadding();
        });
    };

    const reset = () => {
        const nh = img.naturalHeight || 0;
        const nw = img.naturalWidth || 0;
        const vh = viewport.clientHeight || 0;

        // Default: fit-to-height (user-friendly for reading a poster).
        // If the image isn't ready yet, fall back to 1.
        let fitHeightScale = 1;
        if (nh > 0 && vh > 0) {
            fitHeightScale = vh / nh;
        }

        // Guard against extreme scales when the viewport is tiny.
        // (We still allow zooming further in/out afterwards.)
        state.scale = clamp(fitHeightScale, MIN_SCALE, MAX_SCALE);
        if (nw > 0) img.style.width = `${nw}px`;
        if (nh > 0) img.style.height = `${nh}px`;
        scheduleApplyScale();

        // Center the view after applying scale.
        window.requestAnimationFrame(() => {
            const scaledW = nw * state.scale;
            const scaledH = nh * state.scale;
            viewport.scrollLeft = Math.max(0, (scaledW - viewport.clientWidth) / 2);
            viewport.scrollTop = Math.max(0, (scaledH - viewport.clientHeight) / 2);
        });
    };

    const zoomAt = (nextScale, clientX, clientY) => {
        const prev = state.scale;
        const target = clamp(nextScale, MIN_SCALE, MAX_SCALE);
        if (target === prev) return;

        const rect = viewport.getBoundingClientRect();
        const { padX, padY } = getViewportPadding();
        const mxScreen = clientX - rect.left;
        const myScreen = clientY - rect.top;
        const mx = mxScreen - padX;
        const my = myScreen - padY;

        // Keep the content point under the cursor stable during zoom.
        const contentX = (viewport.scrollLeft + mx) / prev;
        const contentY = (viewport.scrollTop + my) / prev;

        state.scale = target;
        scheduleApplyScale();

        window.requestAnimationFrame(() => {
            // Re-read padding because it may change after scaling.
            const nextPad = getViewportPadding();
            const nextMx = mxScreen - nextPad.padX;
            const nextMy = myScreen - nextPad.padY;
            viewport.scrollLeft = contentX * target - nextMx;
            viewport.scrollTop = contentY * target - nextMy;
        });
    };

    const onWheel = (e) => {
        if (modal.style.display !== 'flex') return;
        e.preventDefault();
        const zoomIn = e.deltaY < 0;
        const factor = zoomIn ? 1.12 : 1 / 1.12;
        zoomAt(state.scale * factor, e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
        if (modal.style.display !== 'flex') return;
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault();
        state.isDragging = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.startScrollLeft = viewport.scrollLeft;
        state.startScrollTop = viewport.scrollTop;
        viewport.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
        if (!state.isDragging) return;
        const dx = e.clientX - state.startX;
        const dy = e.clientY - state.startY;
        viewport.scrollLeft = state.startScrollLeft - dx;
        viewport.scrollTop = state.startScrollTop - dy;
    };

    const endDrag = () => {
        state.isDragging = false;
    };

    toolbar.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('[data-lightbox-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-lightbox-action');

        if (action === 'zoom_in') zoomAt(state.scale * 1.2, window.innerWidth / 2, window.innerHeight / 2);
        if (action === 'zoom_out') zoomAt(state.scale / 1.2, window.innerWidth / 2, window.innerHeight / 2);
        if (action === 'reset') reset();
    });

    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('pointerleave', endDrag);

    img.addEventListener('load', reset);

    window.__posterLightbox = { reset };
}

// Info Modal Data
const infoData = {
    'manual': {
        title: 'Manual Review',
        icon: '<i class="fa-solid fa-users-viewfinder text-danger"></i>',
        content: '<p>Traditional human-driven verification is the gold standard for accuracy but struggles to scale. It is <strong>expensive</strong>, <strong>slow</strong>, and fundamentally bottlenecked by the availability of domain experts to manually check every claim, code snippet, and dataset against a rigorous checklist.</p>'
    },
    'llm': {
        title: 'Standard LLMs',
        icon: '<i class="fa-solid fa-robot text-danger"></i>',
        content: '<p>Using a basic prompt-based LLM approach seems fast and cheap, but it lacks rigorous reasoning mechanisms. It is heavily <strong>prone to hallucination</strong> and fails to reliably verify complex academic claims without external context or the ability to run tools.</p>'
    },
    'agentic': {
        title: 'Agentic Workflow',
        icon: '<i class="fa-solid fa-network-wired text-success"></i>',
        content: '<p>A structured, multi-agent assessment mitigates LLM shortcomings by separating concerns. It orchestrates specific agents (e.g., Code Reviewer, Math Verifier) to tackle distinct parts of the checklist. It is <strong>powerful</strong>, but traditionally <strong>difficult to implement</strong>. Our toolkit provides a visual, modular interface to solve this complexity.</p>'
    },
    'data_collection': {
        title: '1. Data Collection',
        icon: '<i class="fa-solid fa-folder-tree text-primary"></i>',
        content: '<p>Create collections to organize your papers and keep sets separate—for example, by conference, project, or review purpose. This helps you maintain clear boundaries between different groups of documents while running checklist-based assessments.</p>'
    },
    'review_process': {
        title: '2. Review Process',
        icon: '<i class="fa-solid fa-gears text-accent"></i>',
        content: '<p>The core engine combines a user-defined collection of papers with a specific checklist and a customized workflow process graph. It orchestrates the multi-agent pipeline to evaluate documents and generate structured, evidence-backed outputs dynamically.</p>'
    },
    'human_verification': {
        title: '3. Human Verification',
        icon: '<i class="fa-solid fa-user-check text-success"></i>',
        content: '<p>Human verification is optional. When needed, you can review a selected subset of the generated answers side-by-side with the source document to confirm, reject, or correct findings before sharing results.</p>'
    },
    'analysis': {
        title: '4. Analysis',
        icon: '<i class="fa-solid fa-chart-pie text-warning"></i>',
        content: '<p>Aggregate statistics over completed, verified reviews. Derive meaningful research insights, identify trends in reproducibility, and automatically generate robust summary reports from the compiled review data.</p>'
    },
    'designer_github': {
        title: 'GitHub checker',
        icon: '<i class="fab fa-github" aria-hidden="true"></i>',
        content: '<p>This node represents a GitHub repository checking capability. It can be configured to use a specified <strong>LLM backbone</strong> to inspect repositories and report structured findings as part of the overall review workflow.</p>'
    },
    'designer_materials': {
        title: 'Domain & materials agents',
        icon: '<i class="fa-solid fa-flask" aria-hidden="true"></i>',
        content: '<p>This specialist node handles questions related to <strong>materials science</strong>. It can be configured with a <strong>domain-suitable model</strong> to produce higher-quality, context-aware answers for materials-focused checklist items within the workflow.</p>'
    },
    'designer_agentic': {
        title: 'Model-driven agentic process',
        icon: '<i class="fa-solid fa-diagram-project" aria-hidden="true"></i>',
        content: '<p><strong>New components</strong> can be added <strong>without hard rewiring</strong> the whole stack. The run is intentionally <strong>non-deterministic</strong>: agents branch, retry, and hand off as the workflow graph and checklist evolve.</p>'
    }
};

// Info Modal Logic
function openInfoModal(key) {
    const data = infoData[key];
    if (!data) return;
    
    document.getElementById('infoModalTitle').innerHTML = data.title;
    document.getElementById('infoModalIcon').innerHTML = data.icon;
    document.getElementById('infoModalBody').innerHTML = data.content;
    
    const modal = document.getElementById('infoModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.querySelectorAll('.designer-hit.is-selected').forEach((n) => n.classList.remove('is-selected'));
}

// Poster Modal Logic
function openModal() {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("fullPoster");
    modal.style.display = "flex";
    modalImg.src = "assets/poster.png";
    document.body.style.overflow = "hidden";
    window.__posterLightbox?.reset?.();
}

function closeModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Close modals on outside click
window.onclick = function(event) {
    const imageModal = document.getElementById("imageModal");
    const infoModal = document.getElementById("infoModal");
    const playgroundGateModal = document.getElementById("playgroundGateModal");
    if (event.target == imageModal) {
        closeModal();
    }
    if (event.target == infoModal) {
        closeInfoModal();
    }
    if (event.target == playgroundGateModal) {
        closePlaygroundGateModal();
    }
}

// Escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeModal();
        closeInfoModal();
        closePlaygroundGateModal();
    }
});