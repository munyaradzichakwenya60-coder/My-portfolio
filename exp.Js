const cube = document.getElementById("cube");
const scene = document.querySelector(".scene");
const loader = document.getElementById("loader");
const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const lightningFlash = document.getElementById("lightning-flash");
const glitchStreak = document.getElementById("glitch-streak");
const particleCanvas = document.getElementById("particle-canvas");
const lightningCanvas = document.getElementById("lightning-canvas");
const glitchTarget = document.querySelector(".glitch-target");

let isDragging = false;
let startX = 0;
let startY = 0;
let rotateX = -15;
let rotateY = -20;
let velocityX = 0;
let velocityY = 0;
let idleTime = 0;
let cubeRafId = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function setCubeTransform() {
    if (!cube) return;
    cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

function startAction(e) {
    if (!scene || !cube) return;
    if (!e.target.closest(".scene")) return;

    isDragging = true;
    idleTime = 0;
    cube.style.transition = "none";

    const point = e.touches ? e.touches[0] : e;
    startX = point.pageX;
    startY = point.pageY;
}

function moveAction(e) {
    if (!isDragging || !cube) return;

    const point = e.touches ? e.touches[0] : e;
    const currentX = point.pageX;
    const currentY = point.pageY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    velocityY = deltaX * 0.08;
    velocityX = deltaY * 0.08;

    rotateY += deltaX * 0.45;
    rotateX -= deltaY * 0.35;
    rotateX = clamp(rotateX, -45, 45);

    setCubeTransform();

    startX = currentX;
    startY = currentY;
}

function endAction() {
    if (!cube) return;
    isDragging = false;
    cube.style.transition = "transform 0.18s ease-out";
}

function setupCubeControls() {
    if (!cube || !scene) return;

    window.addEventListener("mousedown", startAction);
    window.addEventListener("mousemove", moveAction);
    window.addEventListener("mouseup", endAction);

    window.addEventListener("touchstart", startAction, { passive: false });
    window.addEventListener(
        "touchmove",
        (e) => {
            if (isDragging) e.preventDefault();
            moveAction(e);
        },
        { passive: false }
    );
    window.addEventListener("touchend", endAction);

    window.addEventListener("keydown", (e) => {
        const step = 18;
        if (e.key === "ArrowRight") rotateY += step;
        if (e.key === "ArrowLeft") rotateY -= step;
        if (e.key === "ArrowUp") rotateX += step;
        if (e.key === "ArrowDown") rotateX -= step;

        rotateX = clamp(rotateX, -55, 55);
        cube.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
        setCubeTransform();
        idleTime = 0;
    });

    const animateCube = () => {
        if (!isDragging) {
            idleTime += 0.01;
            rotateY += 0.08 + velocityY;
            rotateX += Math.sin(idleTime) * 0.015 - velocityX * 0.15;
            rotateX = clamp(rotateX, -28, 28);

            velocityX *= 0.92;
            velocityY *= 0.92;

            setCubeTransform();
        }

        cubeRafId = requestAnimationFrame(animateCube);
    };

    animateCube();
}

function setupLoader() {
    window.addEventListener("load", () => {
        window.setTimeout(() => {
            if (loader) loader.classList.add("is-hidden");
        }, 1800);
    });
}

function setupNav() {
    if (!navToggle || !siteNav) return;

    navToggle.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            siteNav.classList.remove("is-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

function setupRevealOnScroll() {
    const revealTargets = document.querySelectorAll(
        ".section-heading, .glass-card, .project-card, .metric-card, .scene, .hint"
    );

    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px",
        }
    );

    revealTargets.forEach((el) => observer.observe(el));
}

function triggerFlash() {
    if (!lightningFlash) return;
    lightningFlash.classList.remove("is-active");
    void lightningFlash.offsetWidth;
    lightningFlash.classList.add("is-active");
}

function triggerBrokenLCDGlitch() {
    if (!glitchStreak || !glitchTarget) return;

    glitchStreak.classList.remove("is-active");
    void glitchStreak.offsetWidth;
    glitchStreak.classList.add("is-active");

    glitchTarget.classList.remove("is-glitching");
    void glitchTarget.offsetWidth;
    glitchTarget.classList.add("is-glitching");

    glitchTarget.animate(
        [
            { transform: "translateX(0) skewX(0deg)", filter: "brightness(1)" },
            { transform: "translateX(-14px) skewX(-7deg)", filter: "brightness(1.2)" },
            { transform: "translateX(18px) skewX(9deg)", filter: "brightness(1.45)" },
            { transform: "translateX(-10px) skewX(-6deg)", filter: "brightness(1.3)" },
            { transform: "translateX(6px) skewX(4deg)", filter: "brightness(1.12)" },
            { transform: "translateX(0) skewX(0deg)", filter: "brightness(1)" }
        ],
        {
            duration: 620,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)"
        }
    );

    setTimeout(() => {
        glitchTarget.classList.remove("is-glitching");
    }, 680);
}

function setupImageOverlay() {
    document.querySelectorAll(".project-card__media img").forEach((img) => {
        img.addEventListener("click", function () {
            const overlay = document.createElement("div");
            overlay.id = "img-overlay";

            const fullImg = document.createElement("img");
            fullImg.src = this.src;
            fullImg.alt = this.alt || "Expanded preview";

            overlay.appendChild(fullImg);
            document.body.appendChild(overlay);

            overlay.addEventListener("click", () => overlay.remove());
        });
    });
}

function setupCardTapEffect() {
    document.querySelectorAll(".glass-card").forEach((card) => {
        card.addEventListener("click", (e) => {
            if (
                e.target.tagName === "A" ||
                e.target.tagName === "BUTTON" ||
                e.target.tagName === "IMG"
            ) {
                return;
            }

            card.animate(
                [
                    { transform: "translateY(0) scale(1)" },
                    { transform: "translateY(-3px) scale(1.01)" },
                    { transform: "translateY(0) scale(1)" }
                ],
                {
                    duration: 260,
                    easing: "ease-out"
                }
            );
        });
    });
}

function setupParticles() {
    if (!particleCanvas) return;

    const ctx = particleCanvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + Math.random() * 80;
            this.size = 1.2 + Math.random() * 3.2;
            this.speedY = 0.3 + Math.random() * 0.9;
            this.speedX = -0.25 + Math.random() * 0.5;
            this.alpha = 0.2 + Math.random() * 0.7;
            this.glow = 8 + Math.random() * 18;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -20 || this.x < -30 || this.x > width + 30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = this.glow;
            ctx.shadowColor = "#22c7ff";
            ctx.fillStyle = "#7fdcff";
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.restore();
        }
    }

    function resizeCanvas() {
        width = particleCanvas.width = window.innerWidth;
        height = particleCanvas.height = window.innerHeight;

        const count = width < 768 ? 28 : 52;
        particles = Array.from({ length: count }, () => new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    animateParticles();
    window.addEventListener("resize", resizeCanvas);
}

/* Realistic lightning canvas */
function setupLightningCanvas() {
    if (!lightningCanvas || !scene || !glitchTarget) return;

    const ctx = lightningCanvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let activeBolts = [];

    function resize() {
        width = lightningCanvas.width = window.innerWidth;
        height = lightningCanvas.height = window.innerHeight;
    }

    function getBoltEndpoints() {
        const titleRect = glitchTarget.getBoundingClientRect();
        const cubeRect = scene.getBoundingClientRect();

        return {
            start: {
                x: titleRect.left + titleRect.width * 0.78,
                y: titleRect.top + titleRect.height * 0.48
            },
            end: {
                x: cubeRect.left + cubeRect.width * 0.28,
                y: cubeRect.top + cubeRect.height * 0.46
            }
        };
    }

    function makeBoltPath(start, end, displacement = 28, detail = 7) {
        let points = [start, end];

        for (let i = 0; i < detail; i++) {
            const nextPoints = [points[0]];
            for (let j = 0; j < points.length - 1; j++) {
                const p1 = points[j];
                const p2 = points[j + 1];

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2;

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.hypot(dx, dy) || 1;

                const nx = -dy / len;
                const ny = dx / len;

                const offset = (Math.random() - 0.5) * displacement;
                const mid = {
                    x: midX + nx * offset,
                    y: midY + ny * offset
                };

                nextPoints.push(mid, p2);
            }
            points = nextPoints;
            displacement *= 0.58;
        }

        return points;
    }

    function buildBranch(basePoints, chance = 0.35) {
        if (Math.random() > chance) return null;
        const idx = Math.floor(basePoints.length * (0.28 + Math.random() * 0.38));
        const origin = basePoints[idx];
        const length = 40 + Math.random() * 90;
        const angle = -0.9 + Math.random() * 1.8;

        const target = {
            x: origin.x + Math.cos(angle) * length,
            y: origin.y + Math.sin(angle) * length
        };

        return makeBoltPath(origin, target, 18, 4);
    }

    function spawnLightning() {
        const { start, end } = getBoltEndpoints();
        const mainPath = makeBoltPath(start, end, 34, 7);
        const branches = [];

        for (let i = 0; i < 3; i++) {
            const branch = buildBranch(mainPath, 0.8);
            if (branch) branches.push(branch);
        }

        activeBolts.push({
            life: 0,
            maxLife: 10 + Math.floor(Math.random() * 5),
            mainPath,
            branches
        });

        triggerFlash();

        scene.classList.add("is-charged", "is-hit");

        const boostSpin = [
            { transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` },
            { transform: `rotateX(${rotateX - 10}deg) rotateY(${rotateY + 18}deg)` },
            { transform: `rotateX(${rotateX + 8}deg) rotateY(${rotateY + 34}deg)` },
            { transform: `rotateX(${rotateX - 3}deg) rotateY(${rotateY + 20}deg)` },
            { transform: `rotateX(${rotateX}deg) rotateY(${rotateY + 10}deg)` }
        ];

        cube.animate(boostSpin, {
            duration: 900,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)"
        });

        rotateY += 12;
        setCubeTransform();

        setTimeout(() => {
            scene.classList.remove("is-hit");
        }, 900);

        setTimeout(() => {
            scene.classList.remove("is-charged");
        }, 1400);
    }

    function drawBolt(points, widthBase, alpha) {
        if (!points || points.length < 2) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.shadowBlur = 24;
        ctx.shadowColor = "rgba(34,199,255,0.9)";
        ctx.strokeStyle = "rgba(90,225,255,0.95)";
        ctx.lineWidth = widthBase;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = Math.max(1.2, widthBase * 0.36);
        ctx.stroke();

        ctx.restore();
    }

    function drawImpactGlow() {
        const cubeRect = scene.getBoundingClientRect();
        const x = cubeRect.left + cubeRect.width * 0.28;
        const y = cubeRect.top + cubeRect.height * 0.46;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 70);
        gradient.addColorStop(0, "rgba(255,255,255,0.55)");
        gradient.addColorStop(0.2, "rgba(34,199,255,0.45)");
        gradient.addColorStop(1, "rgba(34,199,255,0)");

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function animateLightning() {
        ctx.clearRect(0, 0, width, height);

        activeBolts = activeBolts.filter((bolt) => bolt.life < bolt.maxLife);

        activeBolts.forEach((bolt) => {
            const t = bolt.life / bolt.maxLife;
            const alpha = 1 - t;
            const flicker = 0.75 + Math.random() * 0.4;

            drawBolt(bolt.mainPath, 3.2 * flicker, alpha);
            bolt.branches.forEach((branch) => drawBolt(branch, 1.8 * flicker, alpha * 0.8));
            drawImpactGlow();

            bolt.life += 1;
        });

        requestAnimationFrame(animateLightning);
    }

    resize();
    animateLightning();
    window.addEventListener("resize", resize);

    return {
        fire: spawnLightning
    };
}

function injectOverlayStyles() {
    const style = document.createElement("style");
    style.textContent = `
        #img-overlay {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(1, 7, 18, 0.92);
            z-index: 6000;
            padding: 1.2rem;
            cursor: zoom-out;
            backdrop-filter: blur(10px);
        }

        #img-overlay img {
            max-width: min(1100px, 92vw);
            max-height: 90vh;
            object-fit: contain;
            border-radius: 1rem;
            border: 1px solid rgba(88, 150, 255, 0.4);
            box-shadow:
                0 0 0 1px rgba(255, 255, 255, 0.04) inset,
                0 28px 80px rgba(0, 0, 0, 0.45),
                0 0 40px rgba(34, 199, 255, 0.14);
        }
    `;
    document.head.appendChild(style);
}

function setupHeroSequence() {
    const lightningSystem = setupLightningCanvas();
    if (!lightningSystem) return;

    const runSequence = () => {
        triggerBrokenLCDGlitch();

        setTimeout(() => {
            lightningSystem.fire();
        }, 240);

        const next = 4200 + Math.random() * 3600;
        window.setTimeout(runSequence, next);
    };

    window.setTimeout(runSequence, 2200);
}

function init() {
    injectOverlayStyles();
    setupLoader();
    setupNav();
    setupCubeControls();
    setupRevealOnScroll();
    setupImageOverlay();
    setupCardTapEffect();
    setupParticles();
    setupHeroSequence();
    setCubeTransform();
}

init();

window.addEventListener("beforeunload", () => {
    if (cubeRafId) cancelAnimationFrame(cubeRafId);
});