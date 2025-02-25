export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }

    const beep = new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3"); 

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#scanner-container"),
            constraints: {
                width: 400,
                height: 300,
                facingMode: "environment"
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: false, // Increase image clarity
        },
        decoder: {
            readers: [
                "code_128_reader", 
                "ean_reader", 
                "ean_8_reader", 
                "upc_reader",
                "upc_e_reader",
                "code_39_reader"
            ],
            multiple: false // Prevent multiple reads from conflicting
        },
        locate: true // Helps with tricky barcode positions
    }, function (err) {
        if (err) {
            console.error("Quagga initialization failed:", err);
            return;
        }
        Quagga.start();
    });

    const scannerContainer = document.querySelector("#scanner-container");
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
            // Draw detected barcode bounding boxes
            const canvas = Quagga.canvas.dom.overlay;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (result.boxes) {
                result.boxes.forEach(box => {
                    ctx.beginPath();
                    ctx.strokeStyle = "green";
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
        let format = result.codeResult.format;
        console.log(`Scanned: ${code}, Format: ${format}`);

        if (code) {
            beep.play();
            onDetected(String(code)); // Ensure it's always treated as a string
        }
    });
}

export function stopScanner() {
    Quagga.stop();
    document.querySelector("#scanner-container").style.display = "none";
}
