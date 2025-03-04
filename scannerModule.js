export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }

    const beep = new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3");
    let lastScannedCode = null;
    let isScanning = false; // Flag to prevent multiple scans

    const scannerContainer = document.querySelector("#scanner-container");

    // Dynamically set constraints based on the container's size
    const width = scannerContainer.offsetWidth;
    const height = scannerContainer.offsetHeight;

    // Set fixed size for the scanner viewport
    scannerContainer.style.width = "300px"; // or set to any fixed value you need
    scannerContainer.style.height = "300px"; // this can also be adjusted

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer,
            constraints: {
                width: 300,  // Fixed width for video feed
                height: 300, // Fixed height for video feed
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

    // Create reticle with an id for better targeting
    const reticle = document.createElement("div");
    reticle.id = "scanner-reticle";  // Add an ID for targeting
    reticle.style.position = "absolute";
    reticle.style.top = "50%";
    reticle.style.left = "50%";
    reticle.style.width = "100%";
    reticle.style.height = "2px";
    reticle.style.background = "red";
    reticle.style.transform = "translate(-50%, -50%)";
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
        
        // Only process if the scan code is not the same as the last one and scanning is allowed
        if (code && code !== lastScannedCode && !isScanning) {
            isScanning = true;  // Prevent further scans

            lastScannedCode = code; // Store the current scanned code
            beep.play();  // Play beep sound
            onDetected(String(code));  // Trigger the onDetected function
            
            setTimeout(() => {
                lastScannedCode = null;  // Clear the scanned code after 2 seconds
                isScanning = false;  // Allow scanning again after the delay
            }, 2000);  // Prevent duplicates within 2 seconds
        }
    });
}

export function stopScanner() {
    Quagga.stop();
    document.querySelector("#scanner-container").style.display = "none";
}
