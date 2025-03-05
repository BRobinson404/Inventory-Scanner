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
                width: 640,  
                height: 480,
                aspectRatio: {ideal: 1.777},
                facingMode: "environment",
                advanced: [{ focusMode: "continuous" }, { torch: true }]

            }
        },
        locator: {
            patchSize: "medium",  // Try increasing to "medium" or "large"
            halfSample: true  // Process at a lower resolution for better detection
        },
        frequency: 10,  // Lowering this makes it process each frame more carefully
        detectionMode: "balanced",  // Balances speed and accuracy
        
        decoder: {
            readers: ["code_128_reader", "code_39_reader", "ean_reader", "upc_reader"],
            multiple: false
        },
        locate: true,
        area: { 
            top: "20%",  
            right: "5%",  
            left: "5%",  
            bottom: "80%"  
        }
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
    reticle.style.top = "50%";  // Center vertically
    reticle.style.left = "50%"; // Center horizontally
    reticle.style.width = "80%";  // Make it a box instead of a line
    reticle.style.height = "50px"; 
    reticle.style.border = "2px dashed red";  // Dashed border for better visibility
    reticle.style.background = "rgba(255, 0, 0, 0.1)"; // Slight red tint to guide users
    reticle.style.transform = "translate(-50%, -50%)"; // Ensure perfect centering
    reticle.style.pointerEvents = "none"; // Prevents interaction
    scannerContainer.appendChild(reticle);


    Quagga.onProcessed(function (result) {
        if (result && result.boxes) {
            const canvas = Quagga.canvas.dom.overlay;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            result.boxes.forEach(box => {
                const x = (box[0].x + box[2].x) / 2; // Get center of barcode
                const y = (box[0].y + box[2].y) / 2;
    
                // Only detect if barcode is inside the reticle
                const inReticle = y > canvas.height * 0.4 && y < canvas.height * 0.6;
    
                if (inReticle) {
                    ctx.beginPath();
                    ctx.strokeStyle = "#00FF00"; // Green if inside reticle
                    ctx.lineWidth = 3;
                    ctx.rect(box[0].x, box[0].y, box[2].x - box[0].x, box[2].y - box[0].y);
                    ctx.stroke();
                }
            });
        }
    });
    ;

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
