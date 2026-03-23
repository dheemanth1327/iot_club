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

// ================= LOGIN =================
function openLogin(){
    const modal = document.getElementById("loginModal");
    if(modal) modal.style.display = "flex";
}

function closeLogin(){
    const modal = document.getElementById("loginModal");
    if(modal) modal.style.display = "none";
}

function login(){
    const username = document.getElementById("adminUser")?.value;
    const password = document.getElementById("adminPass")?.value;

    if(username === "admin" && password === "iotify123"){
        localStorage.setItem("isAdmin", "true");
        window.location.href = "admin.html";
    }else{
        alert("❌ Invalid Login");
    }
}

// ================= ADMIN AUTH =================
if(window.location.pathname.includes("admin.html")){
    if(localStorage.getItem("isAdmin") !== "true"){
        window.location.href = "index.html";
    }
}

function logout(){
    localStorage.removeItem("isAdmin");
    window.location.href = "index.html";
}

// ================= MEMBER STORAGE =================
function getMembers(){
    return JSON.parse(localStorage.getItem("members")) || [];
}

function saveMembers(data){
    localStorage.setItem("members", JSON.stringify(data));
}

// ================= ADD MEMBER =================
function addMember(){

    const member = {
        Name: document.getElementById("name").value,
        ID: document.getElementById("id").value,
        Event: document.getElementById("event").value,
        Date: document.getElementById("date").value,
        Link: document.getElementById("link").value
    };

    if(!member.Name || !member.ID){
        alert("⚠ Fill required fields");
        return;
    }

    let members = getMembers();
    members.push(member);
    saveMembers(members);

    alert("✅ Member Added");
    loadMembers();
}

// ================= LOAD MEMBERS =================
function loadMembers(){

    const list = document.getElementById("memberList");
    if(!list) return;

    let members = getMembers();
    list.innerHTML = "";

    members.forEach((m, index) => {
        list.innerHTML += `
            <div class="card">
                <p><b>${m.Name}</b></p>
                <p>ID: ${m.ID}</p>
                <p>${m.Event}</p>
                <button onclick="deleteMember(${index})">Delete</button>
            </div>
        `;
    });
}

// ================= DELETE MEMBER =================
function deleteMember(index){
    let members = getMembers();
    members.splice(index,1);
    saveMembers(members);
    loadMembers();
}

// ================= VERIFY CERTIFICATE =================
async function verifyCertificate(){

    const nameInput = document.getElementById("verifyName");
    const idInput = document.getElementById("verifyId");

    if(!nameInput || !idInput) return;

    const name = nameInput.value.trim().toLowerCase();
    const id = idInput.value.trim().toLowerCase();

    if(!name || !id){
        alert("⚠ Enter all fields");
        return;
    }

    let foundUser = null;

    const localData = getMembers();

    for(let i=0;i<localData.length;i++){
        if(
            String(localData[i].Name).toLowerCase() === name &&
            String(localData[i].ID).toLowerCase() === id
        ){
            foundUser = localData[i];
            break;
        }
    }

    // GOOGLE SHEET CHECK
    if(!foundUser){
        const url = "https://opensheet.elk.sh/188kV2CseK37tFy5R1tUYm6AZjL9k1Y71i64Jqra1dFQ/Sheet1";

        try{
            const res = await fetch(url);
            const data = await res.json();

            for(let i=0;i<data.length;i++){
                const sheetName = String(data[i].Name || "").trim().toLowerCase();
                const sheetId = String(data[i].ID || data[i]["ID "] || "").trim().toLowerCase();

                if(sheetName === name && sheetId === id){
                    foundUser = data[i];
                    break;
                }
            }

        }catch(err){
            console.error(err);
        }
    }

    // RESULT
    if(foundUser){

        let certLink = String(foundUser.Link || "").trim();

        if(certLink.includes("drive.google.com")){
            certLink = certLink.replace("/view","/preview");
        }

        const finalData = {
            Name: foundUser.Name,
            ID: foundUser.ID || foundUser["ID "],
            Event: foundUser.Event || "N/A",
            Date: foundUser.Date || "N/A",
            Link: certLink
        };

        localStorage.setItem("certData", JSON.stringify(finalData));
        window.location.href = "result.html";

    }else{

        localStorage.setItem("certData", JSON.stringify({
            status: "invalid"
        }));

        window.location.href = "result.html";
    }
}

// ================= QR SCANNER (MOBILE BACK CAMERA ONLY) =================
let qrScanner;

function isMobile(){
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function scanQR(){

    const qrBox = document.getElementById("qr-reader");
    if(!qrBox) return;

    // ❌ BLOCK DESKTOP
    if(!isMobile()){
        qrBox.innerHTML = "<p style='color:red;text-align:center'>📱 Use mobile to scan QR</p>";
        qrBox.style.display = "block";
        return;
    }

    qrBox.style.display = "block";

    if(qrScanner){
        qrScanner.clear();
    }

    qrScanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then(devices => {

        if(!devices || devices.length === 0){
            alert("❌ No camera found");
            return;
        }

        // 🔥 SELECT BACK CAMERA
        let backCamera = devices.find(device =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );

        // fallback → last camera
        if(!backCamera){
            backCamera = devices[devices.length - 1];
        }

        qrScanner.start(
            backCamera.id,
            { fps: 10, qrbox: 250 },

            qrMessage => {

                console.log("QR:", qrMessage);

                if(qrMessage.includes("http")){
                    window.location.href = qrMessage;
                    return;
                }

                try{
                    const decoded = atob(qrMessage);

                    if(decoded.includes("|")){
                        const [name, id] = decoded.split("|");

                        document.getElementById("verifyName").value = name;
                        document.getElementById("verifyId").value = id;

                        qrScanner.stop();
                        qrBox.style.display = "none";

                        verifyCertificate();
                        return;
                    }

                }catch{}

                alert("❌ Invalid QR");
            }

        );

    }).catch(()=>{
        alert("❌ Camera access denied");
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

    loadMembers();
};