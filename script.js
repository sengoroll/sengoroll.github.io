(() => {
    const career = document.querySelector("[data-career]");
    if (!career) return;

    const sceneOrder = [
        "facebook",
        "meta-ai",
        "copilot",
        "superintelligence",
    ];
    const sceneLabels = {
        facebook: "Facebook",
        "meta-ai": "Meta AI",
        copilot: "Microsoft AI Copilot",
        superintelligence: "Microsoft AI Superintelligence",
    };
    const tabs = [...career.querySelectorAll("[data-scene]")];
    const panels = [...career.querySelectorAll("[data-panel]")];
    const currentCount = career.querySelector(
        "[data-career-current]",
    );
    const status = career.querySelector("[data-career-status]");
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    );
    const drawerInspector = window.matchMedia("(max-width: 760px)");
    const spotlightPanels = [
        ...document.querySelectorAll(
            "[data-gutter-grid-panel], [data-pointillist-panel]",
        ),
    ];
    const finePointer = window.matchMedia("(pointer: fine)");
    const vibeCoding = document.querySelector(".vibe-coding");
    const pointillistPanel = document.querySelector(
        "[data-pointillist-panel]",
    );
    const introCarousel = document.querySelector(
        "[data-intro-carousel]",
    );
    const introSlides = [
        ...document.querySelectorAll("[data-intro-slide]"),
    ];
    const introDots = [
        ...document.querySelectorAll("[data-intro-page]"),
    ];
    const introCurrent = document.querySelector(
        "[data-intro-current]",
    );

    let activeScene = "facebook";
    let playbackToken = 0;
    let carouselEntered = false;
    let spotlightFrame = null;
    let pendingPointer = null;
    let vibeVisible = false;
    let vibeInteracting = false;
    let vibeIdleTimer = null;
    let vibePulseTimer = null;
    let activeIntroPage = 0;

    function clearSpotlightPanels() {
        spotlightPanels.forEach((panel) =>
            panel.classList.remove("is-active"),
        );
    }

    function paintSpotlightPanels() {
        spotlightFrame = null;
        if (!pendingPointer || !finePointer.matches) {
            clearSpotlightPanels();
            return;
        }

        let activePanel = null;
        spotlightPanels.forEach((panel) => {
            const rect = panel.getBoundingClientRect();
            const active =
                pendingPointer.x >= rect.left &&
                pendingPointer.x <= rect.right &&
                pendingPointer.y >= rect.top &&
                pendingPointer.y <= rect.bottom;
            panel.classList.toggle("is-active", active);
            if (active) {
                activePanel = panel;
                panel.style.setProperty(
                    "--spot-x",
                    `${pendingPointer.x - rect.left}px`,
                );
                panel.style.setProperty(
                    "--spot-y",
                    `${pendingPointer.y - rect.top}px`,
                );
            }
        });

        if (!activePanel) clearSpotlightPanels();
    }

    if (finePointer.matches) {
        window.addEventListener(
            "pointermove",
            (event) => {
                if (
                    event.pointerType &&
                    event.pointerType !== "mouse"
                )
                    return;
                pendingPointer = {
                    x: event.clientX,
                    y: event.clientY,
                };
                if (spotlightFrame === null) {
                    spotlightFrame =
                        requestAnimationFrame(paintSpotlightPanels);
                }
            },
            { passive: true },
        );
        window.addEventListener("mouseout", (event) => {
            if (event.relatedTarget) return;
            pendingPointer = null;
            clearSpotlightPanels();
        });
        window.addEventListener("blur", clearSpotlightPanels);
    }

    if (pointillistPanel) {
        const images = [
            ...pointillistPanel.querySelectorAll("img"),
        ];
        function revealPointillist() {
            if (
                !images.every(
                    (image) =>
                        image.complete && image.naturalWidth > 0,
                )
            )
                return;
            pointillistPanel.classList.add("is-loaded");
        }
        images.forEach((image) => {
            image.addEventListener("load", revealPointillist);
            image.addEventListener("error", () => {
                pointillistPanel.classList.add("is-error");
            });
        });
        revealPointillist();
    }

    function activateIntroPage(index, options = {}) {
        const { focus = false } = options;
        activeIntroPage =
            (index + introSlides.length) % introSlides.length;
        introSlides.forEach((slide, slideIndex) => {
            slide.hidden = slideIndex !== activeIntroPage;
        });
        introDots.forEach((dot, dotIndex) => {
            const selected = dotIndex === activeIntroPage;
            dot.setAttribute("aria-selected", String(selected));
            dot.tabIndex = selected ? 0 : -1;
            if (selected && focus) dot.focus();
        });
        introCurrent.textContent = String(
            activeIntroPage + 1,
        ).padStart(2, "0");
    }

    if (introCarousel) {
        introDots.forEach((dot, index) => {
            dot.addEventListener("click", () =>
                activateIntroPage(index),
            );
            dot.addEventListener("keydown", (event) => {
                let nextIndex = null;
                if (event.key === "ArrowRight")
                    nextIndex = (index + 1) % introDots.length;
                if (event.key === "ArrowLeft")
                    nextIndex =
                        (index - 1 + introDots.length) %
                        introDots.length;
                if (event.key === "Home") nextIndex = 0;
                if (event.key === "End")
                    nextIndex = introDots.length - 1;
                if (nextIndex === null) return;
                event.preventDefault();
                activateIntroPage(nextIndex, { focus: true });
            });
        });
        introCarousel
            .querySelector("[data-intro-prev]")
            .addEventListener("click", () => {
                activateIntroPage(activeIntroPage - 1);
            });
        introCarousel
            .querySelector("[data-intro-next]")
            .addEventListener("click", () => {
                activateIntroPage(activeIntroPage + 1);
            });
    }

    function clearVibeTimers(removePulse = true) {
        window.clearTimeout(vibeIdleTimer);
        window.clearTimeout(vibePulseTimer);
        vibeIdleTimer = null;
        vibePulseTimer = null;
        if (removePulse) vibeCoding?.classList.remove("is-pulsing");
    }

    function scheduleVibePulse(delay = 800) {
        window.clearTimeout(vibeIdleTimer);
        if (
            !vibeCoding ||
            reducedMotion.matches ||
            !vibeVisible ||
            vibeInteracting ||
            document.hidden
        ) {
            return;
        }
        vibeIdleTimer = window.setTimeout(() => {
            if (
                vibeInteracting ||
                document.hidden ||
                !vibeVisible
            ) {
                scheduleVibePulse(900);
                return;
            }
            vibeCoding.classList.remove("is-pulsing");
            void vibeCoding.offsetWidth;
            vibeCoding.classList.add("is-pulsing");
            vibePulseTimer = window.setTimeout(() => {
                vibeCoding.classList.remove("is-pulsing");
                scheduleVibePulse(1800);
            }, 2600);
        }, delay);
    }

    if (vibeCoding) {
        vibeCoding.addEventListener("pointerenter", () => {
            vibeInteracting = true;
            clearVibeTimers();
        });
        vibeCoding.addEventListener("pointerleave", () => {
            vibeInteracting = false;
            scheduleVibePulse(900);
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                clearVibeTimers();
            } else {
                scheduleVibePulse(900);
            }
        });

        if ("IntersectionObserver" in window) {
            const vibeObserver = new IntersectionObserver(
                (entries) => {
                    vibeVisible = entries.some(
                        (entry) => entry.isIntersecting,
                    );
                    if (vibeVisible) {
                        scheduleVibePulse();
                    } else {
                        clearVibeTimers();
                    }
                },
                { threshold: 0.5 },
            );
            vibeObserver.observe(vibeCoding);
        } else {
            vibeVisible = true;
            scheduleVibePulse();
        }
    }

    const panelFor = (scene) =>
        career.querySelector(`[data-panel="${scene}"]`);
    const wait = (milliseconds, token) =>
        new Promise((resolve) => {
            const duration = reducedMotion.matches
                ? 0
                : milliseconds;
            window.setTimeout(
                () => resolve(token === playbackToken),
                duration,
            );
        });

    function announce(message) {
        status.textContent = message;
    }

    function hideCursor(panel) {
        const cursor = panel?.querySelector(".demo-cursor");
        if (cursor) cursor.classList.remove("is-visible");
    }

    function cancelPlayback() {
        playbackToken += 1;
        panels.forEach(hideCursor);
    }

    async function moveCursor(
        panel,
        target,
        token,
        duration = 720,
    ) {
        const visual = panel.querySelector(".demo-visual");
        const cursor = panel.querySelector(".demo-cursor");
        if (
            !visual ||
            !cursor ||
            !target ||
            token !== playbackToken
        )
            return false;

        const visualRect = visual.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const cursorOffset = cursor.classList.contains(
            "touch-cursor",
        )
            ? cursor.offsetWidth / 2
            : 3;
        const x =
            targetRect.left -
            visualRect.left +
            targetRect.width / 2 -
            cursorOffset;
        const y =
            targetRect.top -
            visualRect.top +
            targetRect.height / 2 -
            cursorOffset;

        cursor.classList.add("is-visible");
        cursor.style.transitionDuration = reducedMotion.matches
            ? "0ms"
            : `${duration}ms, 140ms`;
        cursor.style.transform = `translate(${x}px, ${y}px)`;
        return wait(duration + 90, token);
    }

    function resetCursor(panel) {
        const cursor = panel.querySelector(".demo-cursor");
        if (!cursor) return;
        cursor.classList.remove("is-visible");
        cursor.style.transitionDuration = "0ms";
        cursor.style.transform = "translate(28px, 28px)";
    }

    function chooseReaction(panel, reaction) {
        const button = panel.querySelector(
            "[data-role='reaction-button']",
        );
        const label = panel.querySelector("[data-reaction-label]");
        button.dataset.reaction = reaction;
        label.textContent = reaction;
        setReactionMenu(panel, false);
    }

    function setReactionMenu(panel, open) {
        const button = panel.querySelector(
            "[data-role='reaction-button']",
        );
        const menu = panel.querySelector(
            "[data-role='reaction-menu']",
        );
        menu.classList.toggle("is-open", open);
        menu.inert = !open;
        menu.setAttribute("aria-hidden", String(!open));
        button.setAttribute("aria-expanded", String(open));
    }

    function setConversationComposer(panel, open, focus = false) {
        const suggestions = panel.querySelector(
            "[data-role='suggestion-strip']",
        );
        const keyboard = panel.querySelector(
            "[data-role='conversation-keyboard']",
        );
        [suggestions, keyboard].forEach((region) => {
            region.classList.toggle("is-open", open);
            region.inert = !open;
            region.setAttribute("aria-hidden", String(!open));
        });
        if (open && focus) {
            panel
                .querySelector("[data-role='conversation-input']")
                .focus({ preventScroll: true });
        }
    }

    function resetConversation(panel) {
        resetCursor(panel);
        chooseReaction(panel, "Like");
        setConversationComposer(panel, false);
        panel.querySelector(
            "[data-role='conversation-input']",
        ).value = "";
    }

    async function playConversation(panel, token) {
        resetConversation(panel);
        if (reducedMotion.matches) {
            chooseReaction(panel, "Love");
            setConversationComposer(panel, true);
            announce(
                "Conversation Guide demonstration ready for interaction.",
            );
            return;
        }

        const reactionButton = panel.querySelector(
            "[data-role='reaction-button']",
        );
        const love = panel.querySelector(
            "[data-reaction-choice='Love']",
        );
        const composer = panel.querySelector(
            "[data-role='conversation-input']",
        );

        if (!(await moveCursor(panel, reactionButton, token, 850)))
            return;
        setReactionMenu(panel, true);
        if (!(await wait(520, token))) return;
        if (!(await moveCursor(panel, love, token, 460))) return;
        chooseReaction(panel, "Love");
        if (!(await wait(360, token))) return;
        if (!(await moveCursor(panel, composer, token, 820)))
            return;
        setConversationComposer(panel, true);
        if (!(await wait(700, token))) return;
        hideCursor(panel);
        announce(
            "Conversation Guide animation complete. The reaction, composer, suggestions, and keyboard are interactive.",
        );
    }

    const completions = [
        "I think simple solutions are often the hardest to find.",
        "The new evaluation framework makes failures easier to understand.",
        "Small tools can make complex systems easier to reason about.",
    ];

    function setSmartKeyboard(panel, open) {
        const keyboard = panel.querySelector(
            "[data-role='smart-keyboard']",
        );
        keyboard.classList.toggle("is-open", open);
        keyboard.setAttribute("aria-hidden", String(!open));
    }

    function updateSmartCompletion(panel) {
        const input = panel.querySelector(
            "[data-role='smart-input']",
        );
        const typed = panel.querySelector("[data-smart-typed]");
        const suffix = panel.querySelector("[data-smart-suffix]");
        const hint = panel.querySelector("[data-role='tab-hint']");
        const value = input.value;
        const completion =
            value.length >= 3
                ? completions.find((candidate) =>
                      candidate
                          .toLowerCase()
                          .startsWith(value.toLowerCase()),
                  )
                : "";

        input.dataset.completion =
            completion && completion !== value ? completion : "";
        typed.textContent = value;
        suffix.textContent = completion
            ? completion.slice(value.length)
            : "";
        hint.classList.toggle(
            "is-visible",
            Boolean(completion && completion !== value),
        );
    }

    function resetCompose(panel) {
        resetCursor(panel);
        const input = panel.querySelector(
            "[data-role='smart-input']",
        );
        input.value = "";
        updateSmartCompletion(panel);
        setSmartKeyboard(panel, false);
    }

    async function typeText(
        input,
        text,
        panel,
        token,
        interval = 52,
    ) {
        input.value = "";
        for (const character of text) {
            if (token !== playbackToken) return false;
            input.value += character;
            input.dispatchEvent(
                new Event("input", { bubbles: true }),
            );
            if (!(await wait(interval, token))) return false;
        }
        return true;
    }

    async function playCompose(panel, token) {
        resetCompose(panel);
        const input = panel.querySelector(
            "[data-role='smart-input']",
        );

        if (reducedMotion.matches) {
            input.value = "I think simple";
            updateSmartCompletion(panel);
            setSmartKeyboard(panel, true);
            announce(
                "Smart Compose demonstration ready. Press Tab in the composer to accept the completion.",
            );
            return;
        }

        if (!(await moveCursor(panel, input, token, 900))) return;
        setSmartKeyboard(panel, true);
        input.focus({ preventScroll: true });
        if (!(await wait(300, token))) return;
        if (
            !(await typeText(input, "I think simple", panel, token))
        )
            return;
        if (!(await wait(900, token))) return;
        hideCursor(panel);
        announce(
            "Smart Compose animation complete. Press Tab to accept the suggested continuation.",
        );
    }

    function setGifTray(panel, open, focus = false) {
        const tray = panel.querySelector("[data-role='gif-tray']");
        const trigger = panel.querySelector(
            "[data-role='gif-trigger']",
        );
        tray.classList.toggle("is-open", open);
        tray.inert = !open;
        tray.setAttribute("aria-hidden", String(!open));
        trigger.setAttribute("aria-expanded", String(open));
        if (open && focus) {
            panel
                .querySelector("[data-role='gif-search']")
                .focus({ preventScroll: true });
        }
    }

    function filterGifOptions(panel, query) {
        const normalized = query.trim().toLowerCase();
        panel
            .querySelectorAll("[data-gif-key]")
            .forEach((option) => {
                option.hidden =
                    Boolean(normalized) &&
                    !option.dataset.gifSearch.includes(normalized);
            });
    }

    function selectGif(panel, key, label) {
        const preview = panel.querySelector(
            "[data-role='gif-preview']",
        );
        const art = panel.querySelector(
            "[data-role='gif-preview-art']",
        );
        const symbol = document.createElement("span");
        symbol.textContent = key === "wave" ? "≈" : "✦";
        art.className = `gif-art ${key}`;
        art.replaceChildren(symbol);
        panel.querySelector(
            "[data-role='gif-preview-title']",
        ).textContent = label;
        preview.hidden = false;
        setGifTray(panel, false);
        announce(
            `${label} GIF added to the Facebook comment composer.`,
        );
    }

    function resetGif(panel) {
        resetCursor(panel);
        setGifTray(panel, false);
        const search = panel.querySelector(
            "[data-role='gif-search']",
        );
        search.value = "";
        filterGifOptions(panel, "");
        panel.querySelector("[data-role='gif-preview']").hidden =
            true;
    }

    async function playGif(panel, token) {
        resetGif(panel);
        const trigger = panel.querySelector(
            "[data-role='gif-trigger']",
        );
        const search = panel.querySelector(
            "[data-role='gif-search']",
        );
        const celebrate = panel.querySelector(
            "[data-gif-key='celebrate']",
        );

        if (reducedMotion.matches) {
            selectGif(panel, "celebrate", "Celebrate");
            return;
        }

        if (!(await moveCursor(panel, trigger, token, 780))) return;
        setGifTray(panel, true);
        if (!(await wait(380, token))) return;
        if (!(await moveCursor(panel, search, token, 480))) return;
        search.focus({ preventScroll: true });
        if (
            !(await typeText(search, "celebrate", panel, token, 48))
        )
            return;
        if (!(await wait(360, token))) return;
        if (!(await moveCursor(panel, celebrate, token, 520)))
            return;
        selectGif(panel, "celebrate", "Celebrate");
        if (!(await wait(420, token))) return;
        hideCursor(panel);
    }

    function setFacebookMode(panel, mode) {
        panel
            .querySelectorAll("[data-facebook-mode]")
            .forEach((button) => {
                const selected =
                    button.dataset.facebookMode === mode;
                button.setAttribute(
                    "aria-selected",
                    String(selected),
                );
                button.tabIndex = selected ? 0 : -1;
            });
        panel
            .querySelectorAll("[data-facebook-demo]")
            .forEach((demo) => {
                demo.hidden = demo.dataset.facebookDemo !== mode;
            });
        panel
            .querySelectorAll("[data-facebook-description]")
            .forEach((description) => {
                description.hidden =
                    description.dataset.facebookDescription !==
                    mode;
            });
        panel.dataset.activeFacebookMode = mode;
    }

    function resetFacebook(panel) {
        const mode =
            panel.dataset.activeFacebookMode || "conversation";
        const demo = panel.querySelector(
            `[data-facebook-demo="${mode}"]`,
        );
        if (mode === "conversation") resetConversation(demo);
        if (mode === "compose") resetCompose(demo);
        if (mode === "gif") resetGif(demo);
    }

    async function playFacebook(panel, token) {
        const mode =
            panel.dataset.activeFacebookMode || "conversation";
        setFacebookMode(panel, mode);
        const demo = panel.querySelector(
            `[data-facebook-demo="${mode}"]`,
        );
        if (mode === "conversation")
            await playConversation(demo, token);
        if (mode === "compose") await playCompose(demo, token);
        if (mode === "gif") await playGif(demo, token);
    }

    const snakeGame = document.querySelector("[data-role='snake-game']");
    const snakeCanvas = document.querySelector("[data-role='snake-canvas']");
    const snakeContext = snakeCanvas?.getContext("2d");
    const snakeScore = document.querySelector("[data-role='snake-score']");
    const snakeStatus = document.querySelector("[data-role='snake-status']");
    const snakeToggle = document.querySelector("[data-role='snake-toggle']");
    const snakeGridSize = 18;
    const snakeCellSize = 24;
    let snakeSegments = [];
    let snakeDirection = { x: 1, y: 0 };
    let snakeNextDirection = { x: 1, y: 0 };
    let snakeFood = { x: 13, y: 9 };
    let snakePoints = 0;
    let snakeTimer = null;
    let snakeRunning = false;
    let snakeGameOver = false;

    function drawSnakeDot(x, y, radius, color) {
        snakeContext.beginPath();
        snakeContext.fillStyle = color;
        snakeContext.arc(x, y, radius, 0, Math.PI * 2);
        snakeContext.fill();
    }

    function drawSnake() {
        if (!snakeContext) return;
        const size = snakeGridSize * snakeCellSize;
        snakeContext.clearRect(0, 0, size, size);
        snakeContext.fillStyle = "#f8f1e6";
        snakeContext.fillRect(0, 0, size, size);

        for (let y = 0; y < snakeGridSize; y += 1) {
            for (let x = 0; x < snakeGridSize; x += 1) {
                drawSnakeDot(
                    x * snakeCellSize + snakeCellSize / 2,
                    y * snakeCellSize + snakeCellSize / 2,
                    1.35,
                    "rgba(35, 75, 59, 0.14)",
                );
            }
        }

        const foodX = snakeFood.x * snakeCellSize + snakeCellSize / 2;
        const foodY = snakeFood.y * snakeCellSize + snakeCellSize / 2;
        [
            [0, 0, 5.2],
            [-5, 0, 2.3],
            [5, 0, 2.3],
            [0, -5, 2.3],
            [0, 5, 2.3],
        ].forEach(([offsetX, offsetY, radius]) => {
            drawSnakeDot(
                foodX + offsetX,
                foodY + offsetY,
                radius,
                "rgba(112, 47, 63, 0.9)",
            );
        });

        snakeSegments
            .slice()
            .reverse()
            .forEach((segment, reverseIndex) => {
                const index = snakeSegments.length - reverseIndex - 1;
                const progress =
                    snakeSegments.length <= 1
                        ? 1
                        : 1 - index / snakeSegments.length;
                const isHead = index === 0;
                const color = isHead
                    ? "rgba(21, 86, 90, 1)"
                    : `rgba(35, 75, 59, ${0.52 + progress * 0.38})`;
                drawSnakeDot(
                    segment.x * snakeCellSize + snakeCellSize / 2,
                    segment.y * snakeCellSize + snakeCellSize / 2,
                    isHead ? 8 : 6.8,
                    color,
                );
            });

        const head = snakeSegments[0];
        if (head) {
            const centerX =
                head.x * snakeCellSize + snakeCellSize / 2;
            const centerY =
                head.y * snakeCellSize + snakeCellSize / 2;
            const perpendicular = {
                x: -snakeDirection.y,
                y: snakeDirection.x,
            };
            [-1, 1].forEach((side) => {
                drawSnakeDot(
                    centerX +
                        snakeDirection.x * 3 +
                        perpendicular.x * side * 2.7,
                    centerY +
                        snakeDirection.y * 3 +
                        perpendicular.y * side * 2.7,
                    1.2,
                    "#f8f1e6",
                );
            });
            snakeGame.dataset.head = `${head.x},${head.y}`;
        }
        snakeGame.dataset.length = String(snakeSegments.length);
    }

    function setSnakeStatus(message) {
        if (snakeStatus) snakeStatus.textContent = message;
    }

    function stopSnakeTimer() {
        window.clearInterval(snakeTimer);
        snakeTimer = null;
        snakeRunning = false;
    }

    function pauseSnake(message = "Paused. Press Start or a direction key.") {
        stopSnakeTimer();
        snakeGame.dataset.state = snakeGameOver
            ? "game-over"
            : "paused";
        if (snakeToggle) snakeToggle.textContent = snakeGameOver ? "Start over" : "Start";
        setSnakeStatus(message);
    }

    function placeSnakeFood() {
        const occupied = new Set(
            snakeSegments.map((segment) => `${segment.x},${segment.y}`),
        );
        const available = [];
        for (let y = 0; y < snakeGridSize; y += 1) {
            for (let x = 0; x < snakeGridSize; x += 1) {
                if (!occupied.has(`${x},${y}`)) available.push({ x, y });
            }
        }
        snakeFood =
            available[Math.floor(Math.random() * available.length)] ||
            { x: 13, y: 9 };
    }

    function resetSnake(start = false) {
        stopSnakeTimer();
        snakeSegments = [
            { x: 4, y: 9 },
            { x: 3, y: 9 },
            { x: 2, y: 9 },
            { x: 1, y: 9 },
        ];
        snakeDirection = { x: 1, y: 0 };
        snakeNextDirection = { x: 1, y: 0 };
        snakeFood = { x: 10, y: 9 };
        snakePoints = 0;
        snakeGameOver = false;
        if (snakeScore) snakeScore.textContent = "0";
        snakeGame.dataset.state = "paused";
        if (snakeToggle) snakeToggle.textContent = "Start";
        setSnakeStatus("Use arrow keys or WASD to steer.");
        drawSnake();
        if (start) startSnake();
    }

    function stepSnake() {
        snakeDirection = snakeNextDirection;
        const head = snakeSegments[0];
        const nextHead = {
            x: head.x + snakeDirection.x,
            y: head.y + snakeDirection.y,
        };
        const hitWall =
            nextHead.x < 0 ||
            nextHead.y < 0 ||
            nextHead.x >= snakeGridSize ||
            nextHead.y >= snakeGridSize;
        const hitSelf = snakeSegments.some(
            (segment) =>
                segment.x === nextHead.x &&
                segment.y === nextHead.y,
        );
        if (hitWall || hitSelf) {
            snakeGameOver = true;
            stopSnakeTimer();
            snakeGame.dataset.state = "game-over";
            snakeToggle.textContent = "Start over";
            setSnakeStatus(
                `Game over at ${snakePoints} point${snakePoints === 1 ? "" : "s"}.`,
            );
            drawSnake();
            return;
        }

        snakeSegments.unshift(nextHead);
        if (nextHead.x === snakeFood.x && nextHead.y === snakeFood.y) {
            snakePoints += 1;
            snakeScore.textContent = String(snakePoints);
            placeSnakeFood();
            setSnakeStatus(`Reward collected. Score ${snakePoints}.`);
        } else {
            snakeSegments.pop();
        }
        drawSnake();
    }

    function startSnake() {
        if (snakeRunning) return;
        if (snakeGameOver) resetSnake(false);
        snakeRunning = true;
        snakeGame.dataset.state = "running";
        snakeToggle.textContent = "Pause";
        setSnakeStatus("Environment running. Steer with arrows or WASD.");
        snakeTimer = window.setInterval(stepSnake, 170);
    }

    function setSnakeDirection(x, y) {
        if (
            x === -snakeDirection.x &&
            y === -snakeDirection.y
        ) {
            return;
        }
        snakeNextDirection = { x, y };
        if (!snakeRunning) startSnake();
    }

    function resetSuperintelligence() {
        resetSnake(false);
    }

    async function playSuperintelligence(panel, token) {
        resetSuperintelligence();
        if (!(await wait(180, token))) return;
        pauseSnake("Press Start or a direction key to run the Snake environment.");
        announce("Microsoft AI Superintelligence Snake environment selected.");
    }

    if (snakeGame) {
        const directions = {
            ArrowUp: { x: 0, y: -1 },
            w: { x: 0, y: -1 },
            W: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            s: { x: 0, y: 1 },
            S: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            a: { x: -1, y: 0 },
            A: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            d: { x: 1, y: 0 },
            D: { x: 1, y: 0 },
        };
        snakeGame.addEventListener("keydown", (event) => {
            if (event.key === " ") {
                event.preventDefault();
                snakeRunning
                    ? pauseSnake()
                    : startSnake();
                return;
            }
            const direction = directions[event.key];
            if (!direction) return;
            event.preventDefault();
            setSnakeDirection(direction.x, direction.y);
        });
        snakeCanvas.addEventListener("pointerdown", () => {
            snakeGame.focus();
        });
        snakeToggle.addEventListener("click", () => {
            snakeGame.focus();
            snakeRunning ? pauseSnake() : startSnake();
        });
        document
            .querySelector("[data-role='snake-restart']")
            .addEventListener("click", () => {
                snakeGame.focus();
                resetSnake(true);
            });
        document
            .querySelectorAll("[data-direction]")
            .forEach((button) => {
                button.addEventListener("click", () => {
                    snakeGame.focus();
                    const direction =
                        directions[
                            {
                                up: "ArrowUp",
                                down: "ArrowDown",
                                left: "ArrowLeft",
                                right: "ArrowRight",
                            }[button.dataset.direction]
                        ];
                    setSnakeDirection(direction.x, direction.y);
                });
            });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && snakeRunning) {
                pauseSnake("Paused while this page is hidden.");
            }
        });
        resetSnake(false);
    }

    function appendChatMessage(panel, role, text) {
        const messages = panel.querySelector(
            "[data-role='chat-messages']",
        );
        const message = document.createElement("div");
        message.className = `chat-message ${role}`;
        message.textContent = text;
        messages.append(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    }

    function appendTypingIndicator(panel) {
        const messages = panel.querySelector(
            "[data-role='chat-messages']",
        );
        const indicator = document.createElement("div");
        indicator.className = "chat-message assistant is-typing";
        indicator.setAttribute(
            "aria-label",
            "Assistant is responding",
        );
        for (let index = 0; index < 3; index += 1) {
            const dot = document.createElement("span");
            dot.className = "typing-dot";
            indicator.append(dot);
        }
        messages.append(indicator);
        messages.scrollTop = messages.scrollHeight;
        return indicator;
    }

    const metaModeLabels = {
        grounding: "Grounding",
        factuality: "Factuality",
    };

    const metaPrompts = {
        grounding: "Who won the 2026 World Cup?",
        factuality:
            "How does speculative decoding make transformer inference faster?",
    };

    function setMetaMode(panel, mode) {
        panel
            .querySelectorAll("[data-meta-mode]")
            .forEach((button) => {
                const selected = button.dataset.metaMode === mode;
                button.setAttribute(
                    "aria-selected",
                    String(selected),
                );
                button.tabIndex = selected ? 0 : -1;
            });
        panel
            .querySelectorAll("[data-meta-description]")
            .forEach((description) => {
                description.hidden =
                    description.dataset.metaDescription !== mode;
            });
        panel.dataset.activeMetaMode = mode;
        const urls = {
            grounding: "meta.ai/chat/grounding",
            factuality: "meta.ai/chat/factuality-evaluation",
        };
        panel.querySelector(
            "[data-role='meta-browser-url']",
        ).textContent = urls[mode];
        panel
            .querySelector("[data-role='meta-browser-toolbar']")
            .setAttribute(
                "aria-label",
                `Browser address: ${urls[mode]}`,
            );
        panel
            .querySelector("#meta-chat")
            .setAttribute("aria-labelledby", `meta-tab-${mode}`);
        panel.querySelector(
            "[data-role='chat-input']",
        ).placeholder =
            mode === "grounding"
                ? "Ask about current events…"
                : "Ask a technical question…";
    }

    function appendMetaSources(message, sources) {
        const row = document.createElement("div");
        row.className = "meta-source-row";
        sources.forEach((source) => {
            const chip = document.createElement("span");
            chip.className = "meta-source-chip";
            chip.textContent = source;
            row.append(chip);
        });
        message.append(row);
    }

    function appendMetaResponse(panel, mode) {
        const messages = panel.querySelector(
            "[data-role='chat-messages']",
        );
        const message = document.createElement("div");
        message.className =
            "chat-message assistant meta-rich-response";

        if (mode === "grounding") {
            const answer = document.createElement("p");
            answer.textContent =
                "Spain won the 2026 FIFA World Cup, defeating Argentina 1–0 after extra time in the final on July 19, 2026. Ferran Torres scored the winning goal in the 106th minute, giving Spain its second men’s World Cup title.";
            const tool = document.createElement("span");
            tool.className = "meta-tool-status";
            tool.textContent =
                "Searched current tournament results";
            message.append(answer, tool);
            appendMetaSources(message, [
                "FIFA match result",
                "ESPN",
                "CBS News",
            ]);
        } else {
            const paragraphOne = document.createElement("p");
            paragraphOne.textContent =
                "Speculative decoding pairs a smaller draft model with the target model. The draft proposes several tokens, and the target verifies those candidate tokens in parallel.";
            const paragraphTwo = document.createElement("p");
            paragraphTwo.textContent =
                "Accepted tokens are emitted immediately; rejected proposals fall back to sampling from a corrected target-model distribution. The method can reduce sequential decoding steps without changing the target distribution, while practical speedups depend on draft latency, acceptance rate, batch size, sequence length, and hardware utilization.";
            message.append(paragraphOne, paragraphTwo);
            appendMetaSources(message, [
                "Leviathan et al. (2023)",
                "Chen et al. (2023)",
                "Transformers documentation",
            ]);
        }

        messages.append(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    }

    function resetMetaAI(panel) {
        chatGeneration += 1;
        resetCursor(panel);
        const mode = panel.dataset.activeMetaMode || "grounding";
        const messages = panel.querySelector(
            "[data-role='chat-messages']",
        );
        messages.replaceChildren();
        appendChatMessage(
            panel,
            "assistant",
            mode === "grounding"
                ? "Ask me about a current event."
                : "Ask a technical question to inspect a multi-claim answer.",
        );
        panel.querySelector("[data-role='chat-input']").value = "";
    }

    const pause = (milliseconds) =>
        new Promise((resolve) =>
            window.setTimeout(resolve, milliseconds),
        );
    let chatGeneration = 0;

    async function submitChat(panel, prompt, options = {}) {
        const { guidedToken = null } = options;
        if (!prompt.trim()) return;
        const generation = chatGeneration;
        const input = panel.querySelector(
            "[data-role='chat-input']",
        );
        appendChatMessage(panel, "user", prompt.trim());
        input.value = "";
        const indicator = appendTypingIndicator(panel);
        const completed =
            guidedToken === null
                ? (await pause(760), true)
                : await wait(760, guidedToken);
        if (!completed || generation !== chatGeneration) {
            indicator.remove();
            return;
        }
        indicator.remove();
        appendMetaResponse(
            panel,
            panel.dataset.activeMetaMode || "grounding",
        );
    }

    async function playMetaAI(panel, token) {
        const mode = panel.dataset.activeMetaMode || "grounding";
        setMetaMode(panel, mode);
        resetMetaAI(panel);
        const input = panel.querySelector(
            "[data-role='chat-input']",
        );
        const send = panel.querySelector(".chat-send");
        const prompt = metaPrompts[mode];

        if (reducedMotion.matches) {
            appendChatMessage(panel, "user", prompt);
            appendMetaResponse(panel, mode);
            announce(
                `${metaModeLabels[mode]} demonstration ready for interaction.`,
            );
            return;
        }

        if (!(await moveCursor(panel, input, token, 850))) return;
        input.focus({ preventScroll: true });
        if (!(await typeText(input, prompt, panel, token, 24)))
            return;
        if (!(await moveCursor(panel, send, token, 420))) return;
        await submitChat(panel, prompt, { guidedToken: token });
        if (token !== playbackToken) return;
        hideCursor(panel);
        announce(
            `${metaModeLabels[mode]} demonstration complete and ready for interaction.`,
        );
    }

    const copilotModeLabels = {
        code: "Code execution",
        connectors: "Tool use",
        tasks: "Copilot Tasks",
    };

    function setCopilotMode(panel, mode) {
        panel
            .querySelectorAll("[data-copilot-mode]")
            .forEach((button) => {
                const selected =
                    button.dataset.copilotMode === mode;
                button.setAttribute(
                    "aria-selected",
                    String(selected),
                );
                button.tabIndex = selected ? 0 : -1;
            });
        panel
            .querySelectorAll("[data-copilot-pane]")
            .forEach((pane) => {
                pane.hidden = pane.dataset.copilotPane !== mode;
            });
        panel
            .querySelectorAll("[data-copilot-description]")
            .forEach((description) => {
                description.hidden =
                    description.dataset.copilotDescription !== mode;
            });
        panel.dataset.activeCopilotMode = mode;
        const urls = {
            code: "copilot.microsoft.com/chat/code-execution",
            connectors: "copilot.microsoft.com/chat/tool-use",
            tasks: "copilot.microsoft.com/chat/copilot-tasks",
        };
        panel.querySelector(
            "[data-role='copilot-browser-url']",
        ).textContent = urls[mode];
        panel
            .querySelector("[data-role='copilot-browser-toolbar']")
            .setAttribute(
                "aria-label",
                `Browser address: ${urls[mode]}`,
            );
        const input = panel.querySelector(
            "[data-role='copilot-chat-input']",
        );
        const placeholders = {
            code: "Ask Copilot to run code or analyze data…",
            connectors:
                "Ask Copilot to use tools or connected services…",
            tasks: "Give Copilot a long-horizon task…",
        };
        input.placeholder = placeholders[mode];
    }

    const copilotPrompts = {
        code: "Plot the remaining balance on a $500,000, 30-year mortgage at 6.5% with $0, $250, and $500 in additional monthly principal.",
        connectors:
            "Check my mail and cloud files for the latest home-buying documents and tell me what is still missing.",
        tasks: "Build a home-buying comparison and prepare a reviewable weekend tour plan.",
    };

    function calculateAmortization(extraPayment) {
        const principal = 500000;
        const monthlyRate = 0.065 / 12;
        const termMonths = 30 * 12;
        const growth = (1 + monthlyRate) ** termMonths;
        const monthlyPayment =
            (principal * monthlyRate * growth) / (growth - 1);
        const balances = [principal];
        let balance = principal;
        let totalInterest = 0;

        for (
            let month = 1;
            month <= termMonths && balance > 0.005;
            month += 1
        ) {
            const interest = balance * monthlyRate;
            const principalPayment = Math.min(
                monthlyPayment + extraPayment - interest,
                balance,
            );
            balance -= principalPayment;
            totalInterest += interest;
            balances.push(Math.max(balance, 0));
        }

        return {
            extraPayment,
            balances,
            payoffMonths: balances.length - 1,
            totalInterest,
            monthlyPayment,
        };
    }

    function renderMortgageChart(panel) {
        const chart = panel.querySelector(
            "[data-role='mortgage-chart']",
        );
        if (chart.dataset.rendered === "true") return;

        const principal = 500000;
        const left = 48;
        const right = 540;
        const top = 20;
        const bottom = 184;
        const scenarios = [0, 250, 500].map(calculateAmortization);

        scenarios.forEach((scenario) => {
            const path = chart.querySelector(
                `[data-chart-extra="${scenario.extraPayment}"]`,
            );
            const points = scenario.balances.map(
                (balance, month) => {
                    const x =
                        left +
                        (Math.min(month, 360) / 360) *
                            (right - left);
                    const y =
                        bottom -
                        (balance / principal) * (bottom - top);
                    return `${month === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
                },
            );
            path.setAttribute("d", points.join(" "));
            path.dataset.payoffMonths = String(
                scenario.payoffMonths,
            );
        });

        const summary = panel.querySelector(
            "[data-role='mortgage-summary']",
        );
        summary.replaceChildren(
            ...scenarios.map((scenario) => {
                const item = document.createElement("div");
                item.className = "mortgage-summary-item";
                const label = document.createElement("span");
                label.textContent =
                    scenario.extraPayment === 0
                        ? "No extra principal"
                        : `$${scenario.extraPayment}/mo extra`;
                const payoff = document.createElement("strong");
                payoff.textContent = `${(scenario.payoffMonths / 12).toFixed(1)} years`;
                const interest = document.createElement("span");
                interest.textContent = `${Math.round(
                    scenario.totalInterest,
                ).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                })} interest`;
                item.append(label, payoff, interest);
                return item;
            }),
        );

        chart.dataset.rendered = "true";
    }

    function setCodeInspector(panel, open, options = {}) {
        const { focusInspector = false, returnFocus = false } =
            options;
        const shell = panel.querySelector(
            "[data-role='copilot-chat-shell']",
        );
        const inspector = panel.querySelector(
            "[data-role='code-inspector']",
        );
        const citation = panel.querySelector(
            "[data-role='code-citation']",
        );
        shell.classList.toggle("is-inspector-open", open);
        inspector.inert = !open;
        inspector.setAttribute("aria-hidden", String(!open));
        citation.setAttribute("aria-expanded", String(open));
        if (open && focusInspector) {
            panel
                .querySelector("[data-role='close-code-inspector']")
                .focus({ preventScroll: true });
        } else if (!open && returnFocus) {
            citation.focus({ preventScroll: true });
        }
    }

    function resetCode(panel) {
        setCodeInspector(panel, false);
        panel
            .querySelector("[data-role='mortgage-result']")
            .classList.remove("is-visible");
    }

    function showCodeResult(panel) {
        renderMortgageChart(panel);
        panel
            .querySelector("[data-role='mortgage-result']")
            .classList.add("is-visible");
    }

    function setCopilotPlusMenu(panel, open) {
        const menu = panel.querySelector(
            "[data-role='copilot-plus-menu']",
        );
        const button = panel.querySelector(
            "[data-role='copilot-plus-button']",
        );
        menu.classList.toggle("is-open", open);
        menu.inert = !open;
        menu.setAttribute("aria-hidden", String(!open));
        button.setAttribute("aria-expanded", String(open));
        if (!open) setConnectorPicker(panel, false);
    }

    function setConnectorPicker(panel, open) {
        const picker = panel.querySelector(
            "[data-role='connector-picker']",
        );
        picker.classList.toggle("is-open", open);
        picker.inert = !open;
        picker.setAttribute("aria-hidden", String(!open));
        if (open && drawerInspector.matches) {
            const menu = panel.querySelector(
                "[data-role='copilot-plus-menu']",
            );
            menu.classList.remove("is-open");
            menu.inert = true;
            menu.setAttribute("aria-hidden", "true");
        }
    }

    function resetConnectors(panel) {
        panel
            .querySelectorAll("[data-connector]")
            .forEach((card) => {
                card.classList.remove("is-connected");
                const button =
                    card.querySelector(".connector-button");
                button.textContent = "Connect";
                button.setAttribute("aria-pressed", "false");
            });
        setCopilotPlusMenu(panel, false);
        panel
            .querySelector("[data-role='connector-answer']")
            .classList.remove("is-visible");
    }

    function setConnector(card, connected) {
        const button = card.querySelector(".connector-button");
        card.classList.toggle("is-connected", connected);
        button.textContent = connected ? "Connected" : "Connect";
        button.setAttribute("aria-pressed", String(connected));
    }

    function updateConnectorAnswer(panel) {
        const cards = [
            ...panel.querySelectorAll("[data-connector]"),
        ];
        const connectedCards = cards.filter((card) =>
            card.classList.contains("is-connected"),
        );
        const connected = connectedCards.length >= 2;
        const answer = panel.querySelector(
            "[data-role='connector-answer']",
        );
        const message =
            "I found the lender estimate and inspection report. The seller disclosure is still missing, and the rate-lock form needs your signature.";
        answer.classList.toggle("is-visible", connected);
        if (connected) {
            const pills = document.createElement("div");
            pills.className = "connector-source-pills";
            connectedCards.slice(0, 2).forEach((card) => {
                const pill = document.createElement("span");
                pill.className = "connector-source-pill";
                pill.textContent = card.dataset.connector;
                pills.append(pill);
            });
            const copy = document.createElement("span");
            copy.textContent = message;
            answer.replaceChildren();
            requestAnimationFrame(() => {
                answer.append(pills, copy);
            });
        }
    }

    async function prepareConnectors(panel, token) {
        const plus = panel.querySelector(
            "[data-role='copilot-plus-button']",
        );
        const useConnectors = panel.querySelector(
            "[data-role='use-connectors']",
        );
        const cards = [
            ...panel.querySelectorAll("[data-connector]"),
        ].slice(0, 2);

        if (reducedMotion.matches) {
            cards.forEach((card) => setConnector(card, true));
            return true;
        }

        if (!(await moveCursor(panel, plus, token, 560)))
            return false;
        setCopilotPlusMenu(panel, true);
        if (!(await wait(320, token))) return false;
        if (!(await moveCursor(panel, useConnectors, token, 460)))
            return false;
        setConnectorPicker(panel, true);
        if (!(await wait(320, token))) return false;
        for (const card of cards) {
            const button = card.querySelector(".connector-button");
            if (!(await moveCursor(panel, button, token, 440)))
                return false;
            setConnector(card, true);
            if (!(await wait(220, token))) return false;
        }
        setCopilotPlusMenu(panel, false);
        return true;
    }

    function resetTasks(panel) {
        panel
            .querySelector("[data-role='task-artifact']")
            .classList.remove("is-visible");
        panel
            .querySelectorAll("[data-task-step]")
            .forEach((step) => {
                step.classList.remove("is-active", "is-done");
                step.querySelector(".task-step-icon").textContent =
                    "";
                step.querySelector(
                    ".task-step-status",
                ).textContent = "Waiting";
            });
    }

    async function runTask(panel, token) {
        const steps = [
            ...panel.querySelectorAll("[data-task-step]"),
        ];
        resetTasks(panel);
        panel
            .querySelector("[data-role='task-artifact']")
            .classList.add("is-visible");

        for (const step of steps) {
            if (token !== playbackToken) return;
            step.classList.add("is-active");
            step.querySelector(".task-step-status").textContent =
                "In progress";
            if (!(await wait(700, token))) return;
            step.classList.remove("is-active");
            step.classList.add("is-done");
            step.querySelector(".task-step-icon").textContent = "✓";
            step.querySelector(".task-step-status").textContent =
                "Done";
        }
    }

    function resetCopilotMode(panel, mode) {
        resetCursor(panel);
        setCodeInspector(panel, false);
        setCopilotPlusMenu(panel, false);
        panel.querySelector(".copilot-conversation").scrollTop = 0;
        panel.querySelector(
            "[data-role='copilot-chat-input']",
        ).value = "";
        panel
            .querySelectorAll(
                ".copilot-user-message, .copilot-assistant-message",
            )
            .forEach((message) => {
                message.classList.remove("is-visible");
            });
        if (mode === "code") resetCode(panel);
        if (mode === "connectors") resetConnectors(panel);
        if (mode === "tasks") resetTasks(panel);
    }

    function revealCopilotMessages(
        panel,
        mode,
        prompt = copilotPrompts[mode],
    ) {
        const thread = panel.querySelector(
            `[data-copilot-pane="${mode}"]`,
        );
        const userMessage = thread.querySelector(
            "[data-role='copilot-user-message']",
        );
        const assistantMessage = thread.querySelector(
            "[data-role='copilot-assistant-message']",
        );
        userMessage.textContent = prompt;
        userMessage.classList.add("is-visible");
        assistantMessage.classList.add("is-visible");
    }

    async function showCopilotResult(panel, mode, token) {
        if (mode === "code") {
            showCodeResult(panel);
            return;
        }

        if (mode === "connectors") {
            updateConnectorAnswer(panel);
            return;
        }

        if (mode === "tasks") {
            await runTask(panel, token);
        }
    }

    async function playCopilotMode(panel, mode, token) {
        setCopilotMode(panel, mode);
        resetCopilotMode(panel, mode);
        const input = panel.querySelector(
            "[data-role='copilot-chat-input']",
        );
        const send = panel.querySelector(".copilot-chat-send");
        const prompt = copilotPrompts[mode];

        if (
            mode === "connectors" &&
            !(await prepareConnectors(panel, token))
        )
            return;

        if (reducedMotion.matches) {
            revealCopilotMessages(panel, mode);
            await showCopilotResult(panel, mode, token);
            announce(
                `${copilotModeLabels[mode]} demonstration ready for interaction.`,
            );
            return;
        }

        if (!(await moveCursor(panel, input, token, 760))) return;
        input.focus({ preventScroll: true });
        if (!(await typeText(input, prompt, panel, token, 8)))
            return;
        if (!(await moveCursor(panel, send, token, 360))) return;
        input.value = "";
        revealCopilotMessages(panel, mode, prompt);
        if (!(await wait(520, token))) return;
        await showCopilotResult(panel, mode, token);

        if (mode === "code") {
            if (!(await wait(850, token))) return;
            const citation = panel.querySelector(
                "[data-role='code-citation']",
            );
            const conversation = panel.querySelector(
                ".copilot-conversation",
            );
            conversation.scrollTo({
                top: conversation.scrollHeight,
                behavior: reducedMotion.matches ? "auto" : "smooth",
            });
            if (!(await wait(420, token))) return;
            if (!(await moveCursor(panel, citation, token, 620)))
                return;
            if (!drawerInspector.matches)
                setCodeInspector(panel, true);
        }

        if (token !== playbackToken) return;
        hideCursor(panel);
        announce(
            `${copilotModeLabels[mode]} demonstration complete and ready for interaction.`,
        );
    }

    async function playCopilot(panel, token) {
        const mode = panel.dataset.activeCopilotMode || "code";
        await playCopilotMode(panel, mode, token);
    }

    async function submitCopilotPrompt(panel, prompt) {
        const mode = panel.dataset.activeCopilotMode || "code";
        cancelPlayback();
        const token = playbackToken;
        resetCopilotMode(panel, mode);
        revealCopilotMessages(panel, mode, prompt);
        if (!(await wait(420, token))) return;
        await showCopilotResult(panel, mode, token);
        if (token === playbackToken) {
            hideCursor(panel);
            announce(
                `${copilotModeLabels[mode]} response complete.`,
            );
        }
    }

    function resetScene(scene) {
        const panel = panelFor(scene);
        if (scene === "facebook") resetFacebook(panel);
        if (scene === "meta-ai") resetMetaAI(panel);
        if (scene === "copilot")
            resetCopilotMode(
                panel,
                panel.dataset.activeCopilotMode || "code",
            );
        if (scene === "superintelligence")
            resetSuperintelligence(panel);
    }

    function playScene(scene) {
        const panel = panelFor(scene);
        playbackToken += 1;
        const token = playbackToken;
        if (scene === "facebook") playFacebook(panel, token);
        if (scene === "meta-ai") playMetaAI(panel, token);
        if (scene === "copilot") playCopilot(panel, token);
        if (scene === "superintelligence")
            playSuperintelligence(panel, token);
    }

    function activateScene(scene, options = {}) {
        const { focus = false, play = true } = options;
        if (!sceneOrder.includes(scene)) return;
        if (
            activeScene === "superintelligence" &&
            scene !== "superintelligence" &&
            snakeRunning
        ) {
            pauseSnake("Paused while the environment is inactive.");
        }
        cancelPlayback();
        activeScene = scene;

        tabs.forEach((tab) => {
            const selected = tab.dataset.scene === scene;
            tab.setAttribute("aria-selected", String(selected));
            tab.tabIndex = selected ? 0 : -1;
            if (selected && focus) tab.focus();
        });

        panels.forEach((panel) => {
            panel.hidden = panel.dataset.panel !== scene;
        });

        currentCount.textContent = String(
            sceneOrder.indexOf(scene) + 1,
        ).padStart(2, "0");
        announce(`${sceneLabels[scene]} career stage selected.`);
        if (play) requestAnimationFrame(() => playScene(scene));
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            carouselEntered = true;
            activateScene(tab.dataset.scene);
        });

        tab.addEventListener("keydown", (event) => {
            const index = sceneOrder.indexOf(tab.dataset.scene);
            let nextIndex = null;
            if (["ArrowDown", "ArrowRight"].includes(event.key))
                nextIndex = (index + 1) % sceneOrder.length;
            if (["ArrowUp", "ArrowLeft"].includes(event.key))
                nextIndex =
                    (index - 1 + sceneOrder.length) %
                    sceneOrder.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End")
                nextIndex = sceneOrder.length - 1;
            if (nextIndex === null) return;
            event.preventDefault();
            carouselEntered = true;
            activateScene(sceneOrder[nextIndex], { focus: true });
        });
    });

    career
        .querySelector("[data-career-prev]")
        .addEventListener("click", () => {
            const index = sceneOrder.indexOf(activeScene);
            activateScene(
                sceneOrder[
                    (index - 1 + sceneOrder.length) %
                        sceneOrder.length
                ],
            );
        });

    career
        .querySelector("[data-career-next]")
        .addEventListener("click", () => {
            const index = sceneOrder.indexOf(activeScene);
            activateScene(
                sceneOrder[(index + 1) % sceneOrder.length],
            );
        });

    career.querySelectorAll("[data-replay]").forEach((button) => {
        button.addEventListener("click", () => {
            const scene = button.dataset.replay;
            resetScene(scene);
            playScene(scene);
        });
    });

    const facebookPanel = panelFor("facebook");
    const facebookModeButtons = [
        ...facebookPanel.querySelectorAll("[data-facebook-mode]"),
    ];
    facebookModeButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            cancelPlayback();
            setFacebookMode(
                facebookPanel,
                button.dataset.facebookMode,
            );
            playScene("facebook");
        });
        button.addEventListener("keydown", (event) => {
            let nextIndex = null;
            if (event.key === "ArrowRight")
                nextIndex =
                    (index + 1) % facebookModeButtons.length;
            if (event.key === "ArrowLeft")
                nextIndex =
                    (index - 1 + facebookModeButtons.length) %
                    facebookModeButtons.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End")
                nextIndex = facebookModeButtons.length - 1;
            if (nextIndex === null) return;
            event.preventDefault();
            const nextButton = facebookModeButtons[nextIndex];
            cancelPlayback();
            setFacebookMode(
                facebookPanel,
                nextButton.dataset.facebookMode,
            );
            nextButton.focus();
            playScene("facebook");
        });
    });

    const conversationPanel = facebookPanel.querySelector(
        "[data-facebook-demo='conversation']",
    );
    const reactionButton = conversationPanel.querySelector(
        "[data-role='reaction-button']",
    );
    let longPressTimer = null;
    let longPressOpened = false;

    reactionButton.addEventListener("pointerdown", () => {
        cancelPlayback();
        longPressOpened = false;
        longPressTimer = window.setTimeout(() => {
            setReactionMenu(conversationPanel, true);
            longPressOpened = true;
        }, 450);
    });

    reactionButton.addEventListener("pointerup", () => {
        window.clearTimeout(longPressTimer);
        if (!longPressOpened)
            chooseReaction(conversationPanel, "Like");
    });

    reactionButton.addEventListener("pointerleave", () =>
        window.clearTimeout(longPressTimer),
    );
    reactionButton.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        setReactionMenu(conversationPanel, true);
    });
    reactionButton.addEventListener("click", (event) => {
        if (event.detail === 0) {
            const menu = conversationPanel.querySelector(
                "[data-role='reaction-menu']",
            );
            const open = !menu.classList.contains("is-open");
            setReactionMenu(conversationPanel, open);
            if (open)
                menu.querySelector(
                    "[data-reaction-choice]",
                ).focus();
        }
    });

    const reactionChoices = [
        ...conversationPanel.querySelectorAll(
            "[data-reaction-choice]",
        ),
    ];
    reactionChoices.forEach((button, index) => {
        button.addEventListener("click", () => {
            cancelPlayback();
            chooseReaction(
                conversationPanel,
                button.dataset.reactionChoice,
            );
        });
        button.addEventListener("keydown", (event) => {
            let nextIndex = null;
            if (["ArrowRight", "ArrowDown"].includes(event.key))
                nextIndex = (index + 1) % reactionChoices.length;
            if (["ArrowLeft", "ArrowUp"].includes(event.key))
                nextIndex =
                    (index - 1 + reactionChoices.length) %
                    reactionChoices.length;
            if (event.key === "Escape") {
                event.preventDefault();
                setReactionMenu(conversationPanel, false);
                reactionButton.focus();
                return;
            }
            if (nextIndex === null) return;
            event.preventDefault();
            reactionChoices[nextIndex].focus();
        });
    });

    document.addEventListener("pointerdown", (event) => {
        if (!event.target.closest(".reaction-wrap"))
            setReactionMenu(conversationPanel, false);
    });

    const conversationInput = conversationPanel.querySelector(
        "[data-role='conversation-input']",
    );
    conversationInput.addEventListener("focus", () =>
        setConversationComposer(conversationPanel, true),
    );
    conversationInput.addEventListener(
        "pointerdown",
        cancelPlayback,
    );
    conversationInput.addEventListener("keydown", cancelPlayback);
    conversationPanel
        .querySelector("[data-role='comment-action']")
        .addEventListener("click", () => {
            cancelPlayback();
            setConversationComposer(conversationPanel, true, true);
        });
    conversationPanel
        .querySelectorAll("[data-suggestion]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                conversationInput.value = button.dataset.suggestion;
                conversationInput.focus({ preventScroll: true });
            });
        });
    conversationPanel
        .querySelectorAll(".mobile-keyboard button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                conversationInput.value +=
                    button.dataset.key ??
                    button.textContent.toLowerCase();
                conversationInput.focus({ preventScroll: true });
            });
        });

    const composePanel = facebookPanel.querySelector(
        "[data-facebook-demo='compose']",
    );
    const smartInput = composePanel.querySelector(
        "[data-role='smart-input']",
    );
    smartInput.addEventListener("focus", () =>
        setSmartKeyboard(composePanel, true),
    );
    smartInput.addEventListener("pointerdown", cancelPlayback);
    smartInput.addEventListener("input", () =>
        updateSmartCompletion(composePanel),
    );
    smartInput.addEventListener("keydown", (event) => {
        cancelPlayback();
        if (event.key !== "Tab" || !smartInput.dataset.completion)
            return;
        event.preventDefault();
        smartInput.value = smartInput.dataset.completion;
        updateSmartCompletion(composePanel);
        announce("Smart Compose suggestion accepted.");
    });

    const gifPanel = facebookPanel.querySelector(
        "[data-facebook-demo='gif']",
    );
    const gifTrigger = gifPanel.querySelector(
        "[data-role='gif-trigger']",
    );
    const gifSearch = gifPanel.querySelector(
        "[data-role='gif-search']",
    );
    gifTrigger.addEventListener("click", () => {
        cancelPlayback();
        const tray = gifPanel.querySelector(
            "[data-role='gif-tray']",
        );
        setGifTray(
            gifPanel,
            !tray.classList.contains("is-open"),
            true,
        );
    });
    gifSearch.addEventListener("pointerdown", cancelPlayback);
    gifSearch.addEventListener("input", () =>
        filterGifOptions(gifPanel, gifSearch.value),
    );
    gifPanel
        .querySelectorAll("[data-gif-key]")
        .forEach((option) => {
            option.addEventListener("click", () => {
                cancelPlayback();
                selectGif(
                    gifPanel,
                    option.dataset.gifKey,
                    option.dataset.gifLabel,
                );
            });
        });
    gifPanel
        .querySelector("[data-role='gif-remove']")
        .addEventListener("click", () => {
            cancelPlayback();
            gifPanel.querySelector(
                "[data-role='gif-preview']",
            ).hidden = true;
            announce(
                "GIF removed from the Facebook comment composer.",
            );
        });

    const metaPanel = panelFor("meta-ai");
    const metaModeButtons = [
        ...metaPanel.querySelectorAll("[data-meta-mode]"),
    ];
    metaModeButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            cancelPlayback();
            setMetaMode(metaPanel, button.dataset.metaMode);
            playScene("meta-ai");
        });
        button.addEventListener("keydown", (event) => {
            let nextIndex = null;
            if (event.key === "ArrowRight")
                nextIndex = (index + 1) % metaModeButtons.length;
            if (event.key === "ArrowLeft")
                nextIndex =
                    (index - 1 + metaModeButtons.length) %
                    metaModeButtons.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End")
                nextIndex = metaModeButtons.length - 1;
            if (nextIndex === null) return;
            event.preventDefault();
            const nextButton = metaModeButtons[nextIndex];
            cancelPlayback();
            setMetaMode(metaPanel, nextButton.dataset.metaMode);
            nextButton.focus();
            playScene("meta-ai");
        });
    });
    const chatInput = metaPanel.querySelector(
        "[data-role='chat-input']",
    );
    chatInput.addEventListener("pointerdown", cancelPlayback);
    chatInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") cancelPlayback();
    });
    metaPanel
        .querySelector("[data-role='chat-form']")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            const input = metaPanel.querySelector(
                "[data-role='chat-input']",
            );
            const prompt = input.value.trim();
            if (!prompt) return;
            cancelPlayback();
            submitChat(metaPanel, prompt);
        });

    const copilotPanel = panelFor("copilot");
    const copilotModeButtons = [
        ...copilotPanel.querySelectorAll("[data-copilot-mode]"),
    ];
    copilotModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            cancelPlayback();
            setCopilotMode(
                copilotPanel,
                button.dataset.copilotMode,
            );
            playScene("copilot");
        });
        button.addEventListener("keydown", (event) => {
            const modeOrder = ["code", "connectors", "tasks"];
            const index = modeOrder.indexOf(
                button.dataset.copilotMode,
            );
            let nextIndex = null;
            if (event.key === "ArrowRight")
                nextIndex = (index + 1) % modeOrder.length;
            if (event.key === "ArrowLeft")
                nextIndex =
                    (index - 1 + modeOrder.length) %
                    modeOrder.length;
            if (event.key === "Home") nextIndex = 0;
            if (event.key === "End")
                nextIndex = modeOrder.length - 1;
            if (nextIndex === null) return;
            event.preventDefault();
            const nextButton = copilotModeButtons[nextIndex];
            cancelPlayback();
            setCopilotMode(
                copilotPanel,
                nextButton.dataset.copilotMode,
            );
            nextButton.focus();
            playScene("copilot");
        });
    });
    const copilotInput = copilotPanel.querySelector(
        "[data-role='copilot-chat-input']",
    );
    copilotInput.addEventListener("pointerdown", cancelPlayback);
    copilotPanel
        .querySelector("[data-role='copilot-chat-form']")
        .addEventListener("submit", (event) => {
            event.preventDefault();
            const prompt = copilotInput.value.trim();
            if (!prompt) return;
            copilotInput.value = "";
            submitCopilotPrompt(copilotPanel, prompt);
        });

    const copilotPlusButton = copilotPanel.querySelector(
        "[data-role='copilot-plus-button']",
    );
    const copilotPlusWrap =
        copilotPanel.querySelector(".copilot-plus-wrap");
    copilotPlusButton.addEventListener("click", () => {
        cancelPlayback();
        const menu = copilotPanel.querySelector(
            "[data-role='copilot-plus-menu']",
        );
        setCopilotPlusMenu(
            copilotPanel,
            !menu.classList.contains("is-open"),
        );
    });
    copilotPanel
        .querySelector("[data-role='use-connectors']")
        .addEventListener("click", () => {
            cancelPlayback();
            setConnectorPicker(copilotPanel, true);
        });
    copilotPlusWrap.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        setCopilotPlusMenu(copilotPanel, false);
        copilotPlusButton.focus();
    });
    document.addEventListener("pointerdown", (event) => {
        if (!event.target.closest(".copilot-plus-wrap")) {
            setCopilotPlusMenu(copilotPanel, false);
        }
    });

    const codeCitation = copilotPanel.querySelector(
        "[data-role='code-citation']",
    );
    codeCitation.addEventListener("click", () => {
        cancelPlayback();
        const shell = copilotPanel.querySelector(
            "[data-role='copilot-chat-shell']",
        );
        const open = !shell.classList.contains("is-inspector-open");
        setCodeInspector(copilotPanel, open, {
            focusInspector: open,
        });
    });
    copilotPanel
        .querySelector("[data-role='close-code-inspector']")
        .addEventListener("click", () => {
            setCodeInspector(copilotPanel, false, {
                returnFocus: true,
            });
        });
    copilotPanel
        .querySelector("[data-role='code-inspector']")
        .addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            setCodeInspector(copilotPanel, false, {
                returnFocus: true,
            });
        });
    copilotPanel
        .querySelectorAll("[data-connector] .connector-button")
        .forEach((button) => {
            button.addEventListener("click", () => {
                cancelPlayback();
                const card = button.closest("[data-connector]");
                setConnector(
                    card,
                    !card.classList.contains("is-connected"),
                );
                updateConnectorAnswer(copilotPanel);
            });
        });
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    carouselEntered ||
                    !entries.some((entry) => entry.isIntersecting)
                )
                    return;
                carouselEntered = true;
                playScene(activeScene);
                observer.disconnect();
            },
            { threshold: 0.25 },
        );
        observer.observe(career);
    } else {
        carouselEntered = true;
        playScene(activeScene);
    }
})();
