import mobileDetection from './mobileDetection.js';

let rainInterval;
let isPaused = false;
let isMobile = false; // Local mobile state for performance

// Fade a single raindrop <svg> out, then remove it
function fadeOutAndRemove(el) {
    if (!el || !el.parentNode) return;
  
    // If it's already fading/transparent, skip
    const cur = getComputedStyle(el).opacity;
    if (cur === '0') return;
  
    el.style.willChange = 'opacity';
    el.style.opacity = cur;                // lock current opacity
    void el.getBoundingClientRect();       // reflow to separate steps
    el.style.transition = 'opacity 250ms ease';
    requestAnimationFrame(() => { el.style.opacity = '0'; });
  
    const onEnd = (evt) => {
      if (evt.target !== el || evt.propertyName !== 'opacity') return;
      el.removeEventListener('transitionend', onEnd);
      if (el.parentNode) el.parentNode.removeChild(el);
    };
    el.addEventListener('transitionend', onEnd);
};

function fadeOutAllCurrentDrops() {
    document.querySelectorAll('.svgContainer').forEach(fadeOutAndRemove);
};

window.onload = function() {
    setupMobileDetection();
    isMobile = mobileDetection.getIsMobile();
    const initialInterval = isMobile ? 500 : 300;
    startRain(initialInterval);
    setupPauseButton();
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          // stop creating new ones & fade out any in-flight ones
          stopRain();
          fadeOutAllCurrentDrops();
        } else {
          // resume at mobile/desktop speed
          const interval = isMobile ? 500 : 300;
          startRain(interval);
        }
    });
};

const startRain = (interval = 300) => {
    if (!rainInterval) {
        rainInterval = window.setInterval(() => {
            const currentRaindrop = new Raindrop();
        }, interval);
    }
    console.log('Rain interval started');
};

const stopRain = () => {
    if (rainInterval) {
        window.clearInterval(rainInterval);
        console.log('Rain interval stopped');
        rainInterval = null;
    }
};

let setupMobileDetection = () => {
    const updateMobileStatusDisplay = (isMobile) => {
        const statusElement = document.getElementById('mobileStatus');
        const statusTextElement = document.getElementById('mobileStatusText');
        
        if (statusElement && statusTextElement) {
            statusTextElement.textContent = isMobile ? 'Yes' : 'No';
            statusElement.className = `mobile-status ${isMobile ? 'mobile' : 'desktop'}`;
        }
    };

    // Log initial mobile status
    console.log('Initial mobile status:', isMobile);
    console.log('Initial viewport size:', mobileDetection.getViewportSize());
    console.log('Device info:', mobileDetection.getDeviceInfo());

    // Update initial status display
    updateMobileStatusDisplay(mobileDetection.getIsMobile());

    mobileDetection.onMobileChange((newIsMobile) => {
        console.log('Mobile status changed to:', newIsMobile);
        isMobile = newIsMobile;
        
        // Update status display
        updateMobileStatusDisplay(newIsMobile);
        
        // Adjust rain interval based on mobile status
        if (newIsMobile) {
            if (rainInterval) {
                stopRain();
                startRain(500);
            }
        } else {
            // Normal rain speed on desktop
            if (rainInterval) {
                stopRain();
                startRain(300); // 300ms interval for desktop
            }
        }
        console.log('Line weight will be', newIsMobile ? '5' : '1', 'for new raindrops');
    });

    // Listen for viewport changes
    mobileDetection.onViewportChange((viewportData) => {
        console.log('Viewport changed:', viewportData);
        
        // Adjust rain positioning based on viewport size
        if (viewportData.mobileChanged) {
            console.log('Mobile status changed during viewport change');
        }
    });
};

let setupPauseButton = () => {
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.addEventListener('click', () => {
      if (isPaused) {
        const interval = isMobile ? 500 : 300;
        startRain(interval);
        pauseButton.textContent = 'Pause';
        isPaused = false;
      } else {
        stopRain();
        fadeOutAllCurrentDrops();  // <<< add this line
        pauseButton.textContent = 'Play';
        isPaused = true;
      }
    });
  };

function Raindrop() {
    const rainLineLength = 1352.439268137;
    const drip1Length = 50.748687744140625;
    const drip2Length = 55.05485534667969;
    const lineWeight = isMobile ? 5 : 2
    // new coordinates calculated here
    // 1) Pick a target landing point on-screen
    const w = window.innerWidth  || 1;
    const h = window.innerHeight || 1;

    // scaling functionality
    // Compute the min/max Y your splash can land at with your spawn formula:
    const X2_LOCAL = 771.85;   // your line's x2
    const Y2_LOCAL = 1119.25;  // your line's y2 (splash end)

    // margins so the right end doesn’t clip when scaled
    const marginLeft   = 20;
    const marginRight  = 20;
    const marginTop    = 40;
    const marginBottom = 40;

    const targetLandingY = Math.random() * (h - marginTop - marginBottom) + marginTop;
    // If you also want to constrain where the end lands in X:
    const targetLandingX = Math.random() * (w - marginLeft - marginRight) + marginLeft;

    // 2) Compute scale from the landing Y (perspective)
    const scale = computeScaleFromLandingY(targetLandingY, { min: 0.6, max: 1.4, gamma: 1.6 });

    // 3) Solve the translate so the splash end lands exactly at the chosen point
    const translateY = targetLandingY - (Y2_LOCAL * scale);
    const translateX = targetLandingX - (X2_LOCAL * scale);

    // end
    
    function clamp01(x){ return Math.min(1, Math.max(0, x)); }
    function norm01(v, a, b){ return clamp01((v - a) / Math.max(1, (b - a))); }

    // Smaller when higher, larger near bottom.
    // Tune min/max/gamma to taste.
    function computeScaleFromLandingY(landingY, { min = 0.6, max = 1.4, gamma = 1.6 } = {}) {
        const h = window.innerHeight || 1;

        // Choose the visible band where you want splashes to land.
        // Keep some margins so big strokes don’t clip at edges.
        const marginTop = 40;
        const marginBottom = 40;
        const bandMin = marginTop;
        const bandMax = h - marginBottom;

        let t = norm01(landingY, bandMin, bandMax); // 0..1 within your intended band
        t = Math.pow(t, gamma);                      // exaggerate contrast if desired
        return min + (max - min) * t;
    }

    // Then, when you compute scale for this instance:
    // const scale = this.computeScaleFromSplashY(splashScreenY, { min: 0.6, max: 1.4, gamma: 1.6 });

    let rainContainer = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    ),
    dripLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    ),
    splash1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    ),
    splash2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    this.makeRainContainer = () => {
        rainContainer.classList.add("svgContainer");
        rainContainer.setAttribute("id", "Layer_1");
        rainContainer.setAttribute("data-name", "Layer 1");
        rainContainer.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        rainContainer.setAttribute("width", "600");
        rainContainer.setAttribute("viewBox", "0 0 953 1210");
    };

    const rainLine = () => {
        dripLine.classList.add("cls-1");
        dripLine.setAttribute("x1", "7.34");
        dripLine.setAttribute("y1", "3.14");
        dripLine.setAttribute("x2", "771.85");
        dripLine.setAttribute("y2", "1119.25");
        dripLine.animateLength = rainLineLength;
        dripLine.setAttribute("stroke-width", lineWeight);
    };
    const drip1 = () => {
        splash1.classList.add("cls-2");
        splash1.setAttribute(
            "d",
            "M780.41,1119.25a66.17,66.17,0,0,1,42.34-25.67"
        );
        splash1.animateLength = drip1Length;
        splash1.setAttribute("stroke-width", lineWeight);
    };
    const drip2 = () => {
        splash2.setAttribute("class", "cls-3");
        splash2.setAttribute(
            "d",
            "M762.27,1119.25a71.82,71.82,0,0,0-21.62-17.34,80.11,80.11,0,0,0-25.72-8.33"
        );
        splash2.animateLength = drip2Length;
        splash2.setAttribute("stroke-width", lineWeight);
    };
    drip1();
    drip2();
    rainLine();
    this.makeRainContainer();

    this.createRain = () => {
        let rainDiv = rainContainer;
        rainDiv.appendChild(dripLine);
        rainContainer.style.transformOrigin = "0 0"; // so translate is from top-left
        // rainContainer.style.transform = `translate(${coordinates[0]}px, ${coordinates[1]}px) scale(${scale})`;
        rainContainer.style.transformBox = "fill-box";
        rainContainer.style.transformOrigin = "0 0";
        rainContainer.style.transform =
            `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        document.getElementById("background").appendChild(rainDiv);
        return rainDiv;
    };

    this.triggerAnimation = function (animatedLine, classname) {
        const el = animatedLine;
      
        el.style.transition = el.style.WebkitTransition = "none";
      
        // Compute a padded dash so the end-cap can't peek with thick strokes
        const strokeW = parseFloat(
          el.getAttribute("stroke-width") || getComputedStyle(el).strokeWidth || "1"
        );
        const L =
          el.animateLength ??
          (typeof el.getTotalLength === "function" ? el.getTotalLength() : 0);
        const pad = strokeW * 2; // (1x also works)
        const dash = L + pad;
      
        el.style.strokeDasharray = `${dash} ${dash}`;
        el.style.strokeDashoffset = `${dash}`;
      
        el.classList.add("addStroke");
        void el.getBoundingClientRect();
      
        if (classname === "cls-1") {
          el.style.transition = el.style.WebkitTransition =
            "stroke-dashoffset 1.75s ease-in-out .5s, opacity 1ms linear .5s";
          el.style.opacity = "1";
        } else {
          el.style.transition = el.style.WebkitTransition =
            "stroke-dashoffset .25s ease-in-out";
        }

        el.style.strokeDashoffset = "0";
      
        el.addEventListener(
            "transitionend",
            () => {
            if (classname === "cls-1") {
                const group = el.parentNode;
                rainContainer.appendChild(splash1);
                rainContainer.appendChild(splash2);

                group.style.willChange = 'opacity';
                group.style.opacity = getComputedStyle(group).opacity || '1';
              
                void group.getBoundingClientRect();
              
                // Set the transition, then flip opacity in the *next frame*
                group.style.transition = 'opacity 700ms ease';
                requestAnimationFrame(() => {
                  group.style.opacity = '0';
                });
              
                const removeAfterFade = (evt) => {
                  // Only react to the group's own opacity transition end
                  if (evt.target !== group || evt.propertyName !== 'opacity') return;
                  group.removeEventListener('transitionend', removeAfterFade);
                  if (group.parentNode) group.parentNode.removeChild(group);
                };
                group.addEventListener('transitionend', removeAfterFade);
              }
        },
            { once: true }
        );
    };

    this.triggerAnimation(
        this.createRain().getElementsByClassName("cls-1")[0],
        "cls-1"
    );
}
