export function initScanner(onDetected) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access not supported on this device.");
        return;
    }
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#scanner-container"),
            constraints: {
                facingMode: "environment" // Use the back camera
            }
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader"]
        }
    }, function (err) {
        if (err) {
            console.error("Quagga initialization failed:", err);
            return;
        }
        Quagga.start();
    });
    
    Quagga.onDetected(function (result) {
        let code = result.codeResult.code;
        if (code) {
            onDetected(code);
        }
    });
}

export function stopScanner() {
    Quagga.stop();
    document.querySelector("#scanner-container").style.display = "none";
}
