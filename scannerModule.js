export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }

    // Add a beep sound
    const beep = new Audio("https://www.soundjay.com/buttons/sounds/button-35.mp3"); 

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#scanner-container"),
            constraints: {
                width: 400, // Adjust to fit container width
                height: 300, // Adjust height to ~250-300px
                facingMode: "environment" // Use the back camera
            }
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"]
        },
        locate: true // Helps with barcode detection
    }, function (err) {
        if (err) {
            console.error("Quagga initialization failed:", err);
            return;
        }
        Quagga.start();
    });

    // Add reticle overlay
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

    Quagga.onDetected(function (result) {
        let code = String(result.codeResult.code); // Ensure barcode is always a string
        let format = result.codeResult.format; // Get barcode format

        console.log("Detected Barcode:", code, "Format:", format);
        beep.play(); // Play beep sound on scan
        onDetected(code);
    });
}

export function stopScanner() {
    Quagga.stop();
    document.querySelector("#scanner-container").style.display = "none";
}