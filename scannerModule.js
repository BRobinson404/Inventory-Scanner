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
  
    // Set fixed size for the scanner viewport
    scannerContainer.style.width = `${width}px`; // Dynamically use container width
    scannerContainer.style.height = `${height}px`; // Dynamically use container height
  
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer,
            constraints: {
                width: width,  // Use dynamic container width
                height: height, // Use dynamic container height
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
    reticle.style.top = "50%";  // Center it vertically in the container
    reticle.style.left = "50%"; // Center it horizontally (if needed)
    reticle.style.transform = "translate(-50%, -50%)"; // Fix alignment issue
    reticle.style.width = "100%"; // Full width of the container
    reticle.style.height = "2px";
    reticle.style.background = "red";
    scannerContainer.appendChild(reticle);
  
    // Recalculate the reticle position and size if the container size changes (responsive handling)
    const updateReticlePosition = () => {
        const containerWidth = scannerContainer.offsetWidth;
        const containerHeight = scannerContainer.offsetHeight;
        reticle.style.width = `${containerWidth}px`; // Ensure reticle matches container width
        reticle.style.top = `${containerHeight / 2}px`; // Keep it centered vertically
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
  