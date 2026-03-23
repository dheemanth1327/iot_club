// ================= NAVIGATION =================
function goToEvents(){
    window.location.href = "events.html";
}

function goHome(){
    window.location.href = "index.html";
}

function openEvent(page){
    window.location.href = page;
}

function goToVerify(){
    window.location.href = "verify.html";
}

// ================= VERIFY CERTIFICATE =================
async function verifyCertificate(){

    const name = document.getElementById("verifyName").value.trim().toLowerCase();
    const id = document.getElementById("verifyId").value.trim().toLowerCase();

    if(!name || !id){
        alert("⚠ Enter all fields");
        return;
    }

    const encoded = btoa(name + "|" + id);

    // 🔥 IMPORTANT FOR GITHUB PAGES
    const link = `${window.location.origin}/iot_club/result.html?data=${encoded}`;

    window.location.href = link;
}

// ================= QR SCANNER =================
let qrScanner;
let cameras = [];
let currentCameraIndex = 0;

function scanQR(){

    const qrBox = document.getElementById("qr-reader");
    if(!qrBox) return;

    qrBox.style.display = "block";

    if(qrScanner){
        qrScanner.clear();
    }

    qrScanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then(devices => {

        cameras = devices;

        if(!devices.length){
            alert("❌ No camera found");
            return;
        }

        let backIndex = devices.findIndex(device =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );

        currentCameraIndex = backIndex !== -1 ? backIndex : devices.length - 1;

        startCamera(cameras[currentCameraIndex].id);

    }).catch(()=>{
        alert("❌ Camera permission denied");
    });
}

function startCamera(cameraId){
    qrScanner.start(
        cameraId,
        { fps: 20, qrbox: { width: 250, height: 250 } },
        onScanSuccess
    );
}

function onScanSuccess(qrMessage){

    // ✅ If QR has full URL → go directly
    if(qrMessage.includes("http")){
        window.location.href = qrMessage;
        return;
    }

    // ❌ Invalid QR
    alert("❌ Invalid QR");
}

function switchCamera(){

    if(!cameras.length) return;

    qrScanner.stop().then(() => {
        currentCameraIndex = (currentCameraIndex + 1) % cameras.length;
        startCamera(cameras[currentCameraIndex].id);
    });
}

// ================= TYPING =================
let text = "IOTIFY";
let i = 0;

function typing(){
    const el = document.getElementById("typing");

    if(el && i < text.length){
        el.innerHTML += text.charAt(i);
        i++;
        setTimeout(typing,150);
    }
}

// ================= PARTICLES =================
window.onload = function(){

    typing();

    const canvas = document.getElementById("bg");

    if(canvas){
        const ctx = canvas.getContext("2d");

        function resizeCanvas(){
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let particles = [];

        for(let i=0;i<100;i++){
            particles.push({
                x:Math.random()*canvas.width,
                y:Math.random()*canvas.height,
                r:Math.random()*2,
                dx:(Math.random()-0.5),
                dy:(Math.random()-0.5)
            });
        }

        function draw(){
            ctx.clearRect(0,0,canvas.width,canvas.height);

            ctx.fillStyle="#00f7ff";

            particles.forEach(p=>{
                ctx.beginPath();
                ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
                ctx.fill();

                p.x+=p.dx;
                p.y+=p.dy;

                if(p.x<0||p.x>canvas.width) p.dx*=-1;
                if(p.y<0||p.y>canvas.height) p.dy*=-1;
            });

            requestAnimationFrame(draw);
        }

        draw();
    }
};