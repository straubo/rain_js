import mobileDetection from './mobileDetection.js';

let rainInterval;
let isPaused = false;

window.onload = function() {
    setupMobileDetection();
    // Start rain with appropriate interval based on mobile detection
    const initialInterval = mobileDetection.getIsMobile() ? 500 : 300;
    startRain(initialInterval);
    setupPauseButton();
};

let startRain = (interval = 300) => {
    if (!rainInterval) {
        rainInterval = window.setInterval(() => {
            let currentRaindrop = new Raindrop();
        }, interval);
    }
};

let stopRain = () => {
    if (rainInterval) {
        window.clearInterval(rainInterval);
        rainInterval = null;
    }
};

let setupMobileDetection = () => {

    // Update mobile status display
    const updateMobileStatusDisplay = (isMobile) => {
        const statusElement = document.getElementById('mobileStatus');
        const statusTextElement = document.getElementById('mobileStatusText');
        
        if (statusElement && statusTextElement) {
            statusTextElement.textContent = isMobile ? 'Yes' : 'No';
            statusElement.className = `mobile-status ${isMobile ? 'mobile' : 'desktop'}`;
        }
    };

    // Log initial mobile status
    console.log('Initial mobile status:', mobileDetection.getIsMobile());
    console.log('Initial viewport size:', mobileDetection.getViewportSize());
    console.log('Device info:', mobileDetection.getDeviceInfo());

    // Update initial status display
    updateMobileStatusDisplay(mobileDetection.getIsMobile());

    // Listen for mobile status changes
    mobileDetection.onMobileChange((isMobile) => {
        console.log('Mobile status changed to:', isMobile);
        
        // Update status display
        updateMobileStatusDisplay(isMobile);
        
        // Adjust rain interval based on mobile status
        if (isMobile) {
            // Slower rain on mobile for better performance
            if (rainInterval) {
                stopRain();
                startRain(500); // 500ms interval for mobile
            }
        } else {
            // Normal rain speed on desktop
            if (rainInterval) {
                stopRain();
                startRain(300); // 300ms interval for desktop
            }
        }
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
            // Use mobile-appropriate interval when resuming
            const interval = mobileDetection.getIsMobile() ? 500 : 300;
            startRain(interval);
            pauseButton.textContent = 'Pause';
            isPaused = false;
        } else {
            stopRain();
            pauseButton.textContent = 'Play';
            isPaused = true;
        }
    });
};

function Raindrop() {
    const coordinates = [ // placement coords for raindrop
        Math.random() * window.innerWidth - 465,
        (3 * (Math.random() * window.innerHeight)) / 4 - 650,
    ];
    const rainLineLength = 1352.439268137;
    const drip1Length = 50.748687744140625;
    const drip2Length = 55.05485534667969;

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

    this.makeRainDiv = () => {
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
    };
    const drip1 = () => {
        splash1.classList.add("cls-2");
        splash1.setAttribute(
            "d",
            "M780.41,1119.25a66.17,66.17,0,0,1,42.34-25.67"
        );
        splash1.animateLength = drip1Length;
        // return drip;
    };
    const drip2 = () => {
        splash2.setAttribute("class", "cls-3");
        splash2.setAttribute(
            "d",
            "M762.27,1119.25a71.82,71.82,0,0,0-21.62-17.34,80.11,80.11,0,0,0-25.72-8.33"
        );

        splash2.animateLength = drip2Length;
    };
    drip1();
    drip2();
    rainLine();
    this.makeRainDiv();

    this.createRain = () => {
        let rainDiv = rainContainer;
        rainDiv.appendChild(dripLine);
        rainDiv.style.marginLeft = coordinates[0] + "px";
        rainDiv.style.marginTop = coordinates[1] + "px";
        document.getElementById("background").appendChild(rainDiv);
        return rainDiv;
    };

    this.triggerAnimation = function(animatedLine, classname) {
        let temporaryLine = animatedLine;
        temporaryLine.style.transition = temporaryLine.style.WebKitTransition =
            "none";
        temporaryLine.style.strokeDasharray =
            temporaryLine.animateLength + " " + temporaryLine.animateLength;
        temporaryLine.style.strokeDashoffset = temporaryLine.animateLength;
        temporaryLine.classList.add("addStroke");
        temporaryLine.getBoundingClientRect();

        temporaryLine.style.TransitionTimingFunction = "ease-in-out";
        if (classname === "cls-1") {
            temporaryLine.style.transition = temporaryLine.style.WebkitTransition =
                "stroke-dashoffset 1.75s ease-in-out .5s";
        } else {
            temporaryLine.style.transition = temporaryLine.style.WebkitTransition =
                "stroke-dashoffset .25s ease-in-out";
        }

        temporaryLine.style.strokeDashoffset = "0";
        temporaryLine.addEventListener(
            "transitionend",
            () => {
                if (classname === "cls-1") {
                    rainContainer.appendChild(splash1);
                    rainContainer.appendChild(splash2);
                    window.setTimeout(() => {
                        temporaryLine.classList.remove("addStroke");
                        temporaryLine.parentNode.remove();
                    }, 300);
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
