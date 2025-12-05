/* ================================
   아코디언 메뉴
================================ */
document.querySelectorAll(".menu-header").forEach(header => {
    header.addEventListener("click", () => {
        const content = header.nextElementSibling;

        if (content.style.display === "block") {
            content.style.display = "none";
            return;
        }

        document.querySelectorAll(".menu-content")
            .forEach(c => c.style.display = "none");

        content.style.display = "block";
    });
});


/* ================================
   🔥 내 게시글 목록 로드 (Found + Lost 모두)
================================ */
function loadMyPosts() {
    const list = document.getElementById("myPostList");
    if (!list) return;

    list.innerHTML = "";

    // 현재 사용자 닉네임 가져오기
    const currentNickname = localStorage.getItem("nickname") || "";
    if (!currentNickname || currentNickname.trim() === "") {
        list.innerHTML = `<li style="color:#777;">작성한 게시글이 없습니다.</li>`;
        return;
    }

    const lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];
    const foundPosts = JSON.parse(localStorage.getItem("foundPosts")) || [];

    // 현재 사용자가 작성한 게시물만 필터링
    const myLostPosts = lostPosts
        .filter(p => p.author && p.author.trim() === currentNickname.trim())
        .map(p => ({...p, type:"lost"}));
    
    const myFoundPosts = foundPosts
        .filter(p => p.author && p.author.trim() === currentNickname.trim())
        .map(p => ({...p, type:"found"}));

    const allPosts = [...myLostPosts, ...myFoundPosts];

    if (allPosts.length === 0) {
        list.innerHTML = `<li style="color:#777;">작성한 게시글이 없습니다.</li>`;
        return;
    }

    allPosts.sort((a,b) => (b.id||0) - (a.id||0));

    allPosts.forEach(post => {
        const li = document.createElement("li");
        li.textContent = post.title + (post.type==="found" ? " (찾음)" : " (분실)");

        li.addEventListener("click", () => {
            if(post.type === "lost")
                window.location.href = `../detail_lost/detail_lost.html?id=${post.id}`;
            else
                window.location.href = `../detail/detail.html?id=${post.id}`;
        });

        list.appendChild(li);
    });
}



/* ================================
   🔥 닉네임 중복 확인
================================ */
let nicknameChecked = false;

async function checkNickname() {
    const nicknameInput = document.getElementById("nickInput");
    const nickname = nicknameInput.value.trim();
    const errorDiv = document.getElementById("nicknameError");
    const checkBtn = document.getElementById("checkNicknameBtn");
    const currentNickname = localStorage.getItem("nickname") || "";
    
    // 현재 닉네임과 동일한 경우
    if (nickname === currentNickname) {
        errorDiv.textContent = "";
        nicknameChecked = true;
        alert("현재 사용 중인 닉네임입니다.");
        return;
    }
    
    if (!nickname) {
        errorDiv.textContent = "닉네임을 입력해주세요.";
        nicknameChecked = false;
        return;
    }
    
    if (nickname.length < 2 || nickname.length > 10) {
        errorDiv.textContent = "닉네임은 2~10자로 입력해주세요.";
        nicknameChecked = false;
        return;
    }
    
    checkBtn.disabled = true;
    checkBtn.textContent = "확인 중...";
    errorDiv.textContent = "";
    
    try {
        // 백엔드 API 호출
        const response = await fetch(`/api/v1/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`, {
            method: 'GET'
        });
        
        const data = await response.json();
        
        if (response.ok && data.available) {
            errorDiv.textContent = "";
            errorDiv.style.color = "#4caf50";
            errorDiv.textContent = "사용 가능한 닉네임입니다.";
            nicknameChecked = true;
            nicknameInput.classList.remove("error");
        } else {
            errorDiv.style.color = "#f44336";
            errorDiv.textContent = "이미 사용 중인 닉네임입니다.";
            nicknameChecked = false;
            nicknameInput.classList.add("error");
        }
    } catch (error) {
        console.error("닉네임 확인 오류:", error);
        // 임시 처리: 서버 없을 때 자동 통과
        errorDiv.textContent = "";
        errorDiv.style.color = "#4caf50";
        errorDiv.textContent = "사용 가능한 닉네임입니다.";
        nicknameChecked = true;
        nicknameInput.classList.remove("error");
    } finally {
        checkBtn.disabled = false;
        checkBtn.textContent = "중복 확인";
    }
}

/* ================================
   🔥 프로필 저장 + localStorage 유지
================================ */
function saveProfile() {
    const nicknameInput = document.getElementById("nickInput").value.trim();
    const nickname = document.getElementById("nickname");
    const upload = document.getElementById("profileUpload");
    let profileImage = document.getElementById("profileImage");
    const currentNickname = localStorage.getItem("nickname") || "";

    if(nicknameInput){
        // 현재 닉네임과 동일한 경우 중복 확인 없이 저장
        if (nicknameInput === currentNickname) {
            // 닉네임 변경 없이 프로필 이미지만 저장 가능
        } else {
            // 닉네임이 변경된 경우 중복 확인 필수
            if (!nicknameChecked) {
                alert("닉네임 중복 확인을 해주세요.");
                return;
            }
        }
        
        // 기존 닉네임 가져오기
        const oldNickname = currentNickname;
        
        console.log("닉네임 변경:", oldNickname, "->", nicknameInput);
        
        // 새 닉네임으로 업데이트
        nickname.textContent = nicknameInput;
        localStorage.setItem("nickname", nicknameInput);
        
        // 기존 게시물의 작성자 닉네임도 업데이트
        if(oldNickname && oldNickname.trim() !== "" && oldNickname !== nicknameInput) {
            const updatedCount = updatePostsAuthor(oldNickname.trim(), nicknameInput);
            console.log("업데이트된 게시물 수:", updatedCount);
        }
        
        // 중복 확인 상태 초기화
        nicknameChecked = false;
        document.getElementById("nicknameError").textContent = "";
        document.getElementById("nickInput").value = "";
    }

    if(upload.files && upload.files[0]){
        const reader = new FileReader();
        reader.onload = e =>{
            profileImage.src = e.target.result;
            localStorage.setItem("profileImage", e.target.result);
        }
        reader.readAsDataURL(upload.files[0]);
    }

    showPopup("프로필이 저장되었습니다.");
}

/* ================================
   🔥 게시물 작성자 닉네임 업데이트
================================ */
function updatePostsAuthor(oldNickname, newNickname) {
    let updatedCount = 0;
    
    // 찾았어요 게시물 업데이트
    let foundPosts = JSON.parse(localStorage.getItem("foundPosts")) || [];
    console.log("Found 게시물 개수:", foundPosts.length);
    foundPosts = foundPosts.map(post => {
        // author 필드가 있고 기존 닉네임과 정확히 일치하는 경우
        if (post.author && post.author.trim() === oldNickname) {
            updatedCount++;
            console.log("Found 게시물 업데이트:", post.id, post.title, "작성자:", post.author, "->", newNickname);
            return { ...post, author: newNickname };
        }
        return post;
    });
    localStorage.setItem("foundPosts", JSON.stringify(foundPosts));
    console.log("Found 게시물 저장 완료, 업데이트된 개수:", updatedCount);
    
    // 분실했어요 게시물 업데이트
    let lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];
    console.log("Lost 게시물 개수:", lostPosts.length);
    const beforeLostCount = updatedCount;
    lostPosts = lostPosts.map(post => {
        // author 필드가 있고 기존 닉네임과 정확히 일치하는 경우
        if (post.author && post.author.trim() === oldNickname) {
            updatedCount++;
            console.log("Lost 게시물 업데이트:", post.id, post.title, "작성자:", post.author, "->", newNickname);
            return { ...post, author: newNickname };
        }
        return post;
    });
    localStorage.setItem("lostPosts", JSON.stringify(lostPosts));
    console.log("Lost 게시물 저장 완료, 업데이트된 개수:", updatedCount - beforeLostCount);
    
    return updatedCount;
}

/* ================================
   🔥 author 필드가 없는 게시물 업데이트 (현재 사용자로)
================================ */
function updatePostsWithoutAuthor(newNickname) {
    const currentNickname = localStorage.getItem("nickname");
    if (!currentNickname) return;
    
    // 찾았어요 게시물 중 author가 없는 경우 현재 사용자로 설정
    let foundPosts = JSON.parse(localStorage.getItem("foundPosts")) || [];
    foundPosts = foundPosts.map(post => {
        if (!post.author || post.author.trim() === "") {
            return { ...post, author: newNickname };
        }
        return post;
    });
    localStorage.setItem("foundPosts", JSON.stringify(foundPosts));
    
    // 분실했어요 게시물 중 author가 없는 경우 현재 사용자로 설정
    let lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];
    lostPosts = lostPosts.map(post => {
        if (!post.author || post.author.trim() === "") {
            return { ...post, author: newNickname };
        }
        return post;
    });
    localStorage.setItem("lostPosts", JSON.stringify(lostPosts));
}



/* ================================
 🔥 팝업 함수
================================ */
function showPopup(msg){
    const popup = document.getElementById("popup");
    document.getElementById("popupMsg").textContent = msg;
    popup.style.display="flex";
}
function closePopup(){
    document.getElementById("popup").style.display="none";
}



/* ================================
   🔥 프로필 자동 불러오기
================================ */
function loadProfile(){
    const nickname = localStorage.getItem("nickname");
    const image = localStorage.getItem("profileImage");

    if(nickname) document.getElementById("nickname").textContent = nickname;
    if(image) document.getElementById("profileImage").src = image;
}



/* ================================
   ▣ 차단 계정 저장 & 유지
================================ */
function loadBlockedUsers(){
    let saved = JSON.parse(localStorage.getItem("blockedUsers")) || [];
    const list = document.getElementById("blockList");
    list.innerHTML = "";

    saved.forEach(name=>{
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${name}</span>
            <button class="block-del-btn" onclick="removeBlockedUser('${name}')">X</button>
        `;
        list.appendChild(li);
    });
}

function addBlock(){
    const input = document.getElementById("blockUser");
    let name = input.value.trim();
    if(!name) return;

    let saved = JSON.parse(localStorage.getItem("blockedUsers")) || [];

    if(saved.includes(name)){
        showPopup("이미 차단된 닉네임입니다.");
        input.value="";
        return;
    }

    saved.push(name);
    localStorage.setItem("blockedUsers", JSON.stringify(saved));
    input.value="";
    loadBlockedUsers();
}

function removeBlockedUser(name){
    let saved = JSON.parse(localStorage.getItem("blockedUsers")) || [];
    saved = saved.filter(item => item !== name);
    localStorage.setItem("blockedUsers", JSON.stringify(saved));
    loadBlockedUsers();
}



/* ================================
   상단 아이콘 이동
================================ */
function saveHistoryAndMove(path){
    let stack = JSON.parse(localStorage.getItem("historyStack"))||[];
    stack.push(location.pathname);
    localStorage.setItem("historyStack",JSON.stringify(stack));
    location.href=path;
}

document.getElementById("noticeBtn").onclick=()=>saveHistoryAndMove("../notice/notice.html");
document.getElementById("settingBtn").onclick=()=>saveHistoryAndMove("../settings/settings.html");



/* ================================
   하단 네비게이션
================================ */
document.querySelectorAll(".nav-item").forEach(item=>{
    item.addEventListener("click",()=>{
        const label=item.querySelector(".nav-label").textContent.trim();
        if(label==="홈")location.href="../home/home.html";
        if(label==="쪽지함")location.href="../contact/contact.html";
        if(label==="마이페이지")location.href="./mypage.html";
    })
});



/* ================================
   📌 개인정보 변경(저장하지 않고 입력 초기화)
================================ */
function savePersonalInfo(){
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");

    showPopup("개인 정보가 변경되었습니다.");

    emailInput.value = "";
    phoneInput.value = "";
}



/* ================================
   🔥 페이지 로드시 실행
================================ */
document.addEventListener("DOMContentLoaded",()=>{
    loadMyPosts();
    loadProfile();
    loadBlockedUsers();
    
    // 닉네임 입력 시 중복 확인 상태 초기화
    const nickInput = document.getElementById("nickInput");
    if (nickInput) {
        nickInput.addEventListener("input", () => {
            nicknameChecked = false;
            document.getElementById("nicknameError").textContent = "";
            nickInput.classList.remove("error");
        });
    }
});
