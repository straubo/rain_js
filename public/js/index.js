window.onload = function() {
    looperFunction();
};

let looperFunction = () => {
    window.setInterval(() => {
        let currentRaindrop = new Raindrop();
    }, 300);
};

function Raindrop() {
    const rainLineLength = 1352.439268137;
    const drip1Length = 50.748687744140625;
    const drip2Length = 55.05485534667969;
    const coordinates = [
        Math.random() * window.innerWidth - 465,
        (3 * (Math.random() * window.innerHeight)) / 4 - 650,
    ];

    let rainyDiv = document.createElementNS(
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
        rainyDiv.classList.add("svgContainer");
        rainyDiv.setAttribute("id", "Layer_1");
        rainyDiv.setAttribute("data-name", "Layer 1");
        rainyDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        rainyDiv.setAttribute("width", "600");
        rainyDiv.setAttribute("viewBox", "0 0 953 1210");
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
        let rainDiv = rainyDiv;
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
                    rainyDiv.appendChild(splash1);
                    rainyDiv.appendChild(splash2);
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
