export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }

    const beep = new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3");
    let lastScannedCode = null;

    const scannerContainer = document.querySelector("#scanner-container");
    
    // Ensure the scanner container is visible
    scannerContainer.style.display = "block";
    
    // Dynamically set constraints based on the container's size, only if it has dimensions
    const width = scannerContainer.offsetWidth;
    const height = scannerContainer.offsetHeight;
    
    if (width === 0 || height === 0) {
        console.error("Scanner container has no size.");
        return;
    }

    // Set fixed size for the scanner viewport
    scannerContainer.style.width = `${width}px`;
    scannerContainer.style.height = `${height}px`;

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer,
            constraints: {
                width: width,
                height: height,
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

    // Create reticle and position it relative to the container
    const reticle = document.createElement("div");
    reticle.style.position = "absolute";
    reticle.style.top = "50%";
    reticle.style.left = "0";
    reticle.style.width = "100%";
    reticle.style.height = "2px";
    reticle.style.background = "red";
    reticle.style.transform = "translateY(-50%)";
    scannerContainer.appendChild(reticle);

    // Recalculate the reticle position and size if the container size changes (responsive handling)
    const updateReticlePosition = () => {
        const containerWidth = scannerContainer.offsetWidth;
        const containerHeight = scannerContainer.offsetHeight;
        reticle.style.width = `${containerWidth}px`;
        reticle.style.top = `${containerHeight / 2}px`;
    };

    // Initially update reticle position
    updateReticlePosition();

    // Add event listener to handle window resize if needed
    window.addEventListener('resize', updateReticlePosition);

    Quagga.onProcessed(function (result) {
        if (result) {
            const canvas = Quagga.canvas.dom.overlay;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (result.boxes) {
                result.boxes.forEach(box => {
                    ctx.beginPath();
                    ctx.strokeStyle = "#00FF00";
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
