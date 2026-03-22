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
    const result = document.getElementById("verifyResult");

    if(!name || !id){
        result.innerHTML = `
        <div class="result-card error">
            <h3>⚠ Enter all fields</h3>
        </div>`;
        return;
    }

    // ✅ CORRECT SHEET API (GITHUB SAFE)
    const url = "https://opensheet.elk.sh/188kV2CseK37tFy5R1tUYm6AZjL9k1Y71i64Jqra1dFQ/Sheet1";

    result.innerHTML = `<h3 style="color:#00f7ff;">Checking...</h3>`;

    try{
        const res = await fetch(url, {
            method: "GET",
            mode: "cors"
        });

        const data = await res.json();

        console.log("DATA:", data);

        let foundUser = null;

        for(let i = 0; i < data.length; i++){

            const sheetName = String(data[i].Name || "").trim().toLowerCase();

            // 🔥 Handles BOTH "ID" and "ID " (space issue)
            const sheetId = String(
                data[i].ID || data[i]["ID "] || ""
            ).trim().toLowerCase();

            console.log("Checking:", sheetName, sheetId);

            if(sheetName === name && sheetId === id){
                foundUser = data[i];
                break;
            }
        }

        if(foundUser){

            let certLink = String(foundUser.Link || "").trim();

            // ✅ Fix Google Drive preview
            if(certLink.includes("drive.google.com")){
                certLink = certLink.replace("/view", "/preview");
            }

            result.innerHTML = `
            <div class="result-card success">
                <h3>✅ Certificate Verified</h3>
                <p><strong>${foundUser.Name}</strong></p>
                <p>ID: ${foundUser.ID || foundUser["ID "]}</p>
                <iframe src="${certLink}" width="100%" height="300"></iframe>
            </div>`;

        }else{
            result.innerHTML = `
            <div class="result-card error">
                <h3>❌ Not Verified</h3>
            </div>`;
        }

    }catch(err){
        console.error("ERROR:", err);

        result.innerHTML = `
        <div class="result-card error">
            <h3>⚠ Error fetching data</h3>
        </div>`;
    }
}

// ================= QR =================
function scanQR(){
    alert("QR Scanner coming next 🚀");
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