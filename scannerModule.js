export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }

    const beep = new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3"); 
    let lastScannedCode = null;

    const scannerContainer = document.querySelector("#scanner-container");
    
    // Dynamically set constraints based on the container's size
    const width = scannerContainer.offsetWidth;
    const height = scannerContainer.offsetHeight;

    // If the container doesn't have a set height, we will use a default value
    const defaultHeight = 300;
    const scannerHeight = height > 0 ? height : defaultHeight;

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer,
            constraints: {
                width: width,
                height: scannerHeight,
                facingMode: "environment"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: false,
        },
        decoder: {
            readers: [
                "code_128_reader", 
                "code_39_reader"
            ],
            multiple: false
        },
        locate: true
    }, function (err) {
        if (err) {
            console.error("Quagga initialization failed:", err);
            return;
        }
        Quagga.start();
    });

    const reticle = document.createElement("div");
    reticle.style.position = "absolute";
    reticle.style.top = "50%";
    reticle.style.left = "0";
    reticle.style.width = "100%";
    reticle.style.height = "2px";
    reticle.style.background = "red";
    reticle.style.transform = "translateY(-50%)";
    scannerContainer.appendChild(reticle);

    Quagga.onProcessed(function (result) {
        if (result) {
            const canvas = Quagga.canvas.dom.overlay;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (result.boxes) {
                result.boxes.forEach(box => {
                    ctx.beginPath();
                    ctx.strokeStyle = "#00FF00"; // Bright green for visibility
                    ctx.lineWidth = 2;
                    ctx.moveTo(box[0].x, box[0].y);
                    box.forEach((point, index) => {
                        if (index > 0) ctx.lineTo(point.x, point.y);
                    });
                    ctx.closePath();
                    ctx.stroke();
                });
            }
        }
    });

    Quagga.onDetected(function (result) {
        let code = result.codeResult.code;
        if (code && code !== lastScannedCode) {
            lastScannedCode = code;
            beep.play();
            onDetected(String(code));
            setTimeout(() => { lastScannedCode = null; }, 2000); // Prevent duplicates within 2 seconds
        }
    });
}

export function stopScanner() {
    Quagga.stop();
    document.querySelector("#scanner-container").style.display = "none";
}
