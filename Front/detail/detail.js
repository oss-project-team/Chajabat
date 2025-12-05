document.addEventListener("DOMContentLoaded", () => {

    // ================= 게시글 상세 데이터 표시 =================
    const params = new URLSearchParams(location.search);
    const postId = Number(params.get("id"));
    let posts = JSON.parse(localStorage.getItem("foundPosts")) || [];
    let post = posts.find(p => p.id === postId);

    if (!post) return;

    document.getElementById("detailTitle").textContent = post.title;
    document.getElementById("detailDesc").textContent = post.description;
    document.getElementById("detailPlace").textContent = post.place;
    document.getElementById("detailDate").textContent = post.date;
    document.getElementById("detailCategory").textContent = post.category;
    if(post.img) document.getElementById("detailImage").src = post.img;

    // 작성자 정보 표시
    let authorName = post.author || "닉네임";
    // author 필드가 없으면 기본값만 표시 (자동으로 현재 사용자로 설정하지 않음)
    if (!authorName || authorName.trim() === "") {
        authorName = "닉네임";
    }
    document.querySelector(".user-name").textContent = authorName;

    // 해결 상태 표시
    const statusText = document.querySelector(".status-text");
    const statusDot = document.querySelector(".status-dot");
    if (post.solved) {
        statusText.textContent = "해결완료";
        statusDot.style.background = "#4caf50";
    } else {
        statusText.textContent = "해결 중";
        statusDot.style.background = "#ff9800";
    }

    // 현재 로그인한 사용자 확인
    let currentUser = localStorage.getItem("nickname") || "";
    // nickname이 없으면 기본값 생성 및 저장
    if (!currentUser || currentUser.trim() === "") {
        currentUser = "사용자" + Date.now().toString().slice(-6);
        localStorage.setItem("nickname", currentUser);
    }
    currentUser = currentUser.trim();
    
    const postAuthor = (post.author || "").trim();
    const isAuthor = currentUser && postAuthor && currentUser === postAuthor;
    
    // 디버깅용 로그 (개발 중에만 사용)
    console.log("현재 사용자:", currentUser);
    console.log("게시물 작성자:", postAuthor);
    console.log("작성자 여부:", isAuthor);

    // 버튼 표시/숨김 처리
    const msgBtn = document.getElementById("msgBtn");
    const authorBtns = document.getElementById("authorBtns");
    const statusToggleBtn = document.getElementById("statusToggleBtn");
    const editBtn = document.getElementById("editBtn");
    const deleteBtn = document.getElementById("deleteBtn");

    if (isAuthor) {
        // 작성자일 경우: 수정/삭제 버튼 표시, 상태 토글 버튼 표시
        msgBtn.style.display = "none";
        authorBtns.style.display = "block";
        statusToggleBtn.style.display = "flex";
    } else {
        // 일반 사용자일 경우: 쪽지 보내기 버튼 표시, 상태 토글 버튼 숨김
        msgBtn.style.display = "block";
        authorBtns.style.display = "none";
        statusToggleBtn.style.display = "none";
    }

    // 🔥 쪽지 보내기 (게시글 정보 저장 → contact에 표시될 제목/카테고리 전달)
    msgBtn.addEventListener("click", () => {
        const user = document.querySelector(".user-name").textContent.trim();  // 상대 닉네임
        const title = document.getElementById("detailTitle").textContent.trim();
        const category = document.getElementById("detailCategory").textContent.trim();

        // 🔥 기존 chatInfo 불러오기
        let chatInfo = JSON.parse(localStorage.getItem("chatInfo") || "{}");

        // 🔥 user 기준으로 제목/카테고리 저장
        chatInfo[user] = { title, category };
        localStorage.setItem("chatInfo", JSON.stringify(chatInfo));

        // contact로 이동 (user만 넘기면 contact.js가 자동 적용)
        window.location.href = "../contact/contact.html?user=" + encodeURIComponent(user);
    });

    // 해결 상태 전환 버튼 (상단 토글 아이콘)
    statusToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 이벤트 전파 방지
        
        // 회전 애니메이션
        const icon = statusToggleBtn.querySelector(".material-icons");
        icon.style.transform = "rotate(360deg)";
        icon.style.transition = "transform 0.3s";
        
        setTimeout(() => {
            icon.style.transform = "rotate(0deg)";
        }, 300);
        
        post.solved = !post.solved;
        
        // 상태 업데이트
        if (post.solved) {
            statusText.textContent = "해결완료";
            statusDot.style.background = "#4caf50";
        } else {
            statusText.textContent = "해결 중";
            statusDot.style.background = "#ff9800";
        }

        // localStorage에 저장
        posts = posts.map(p => p.id === postId ? post : p);
        localStorage.setItem("foundPosts", JSON.stringify(posts));
    });

    // 수정하기 버튼
    editBtn.addEventListener("click", () => {
        window.location.href = `../createfind/createfind.html?edit=${postId}&origin=detail`;
    });

    // 삭제하기 버튼
    deleteBtn.addEventListener("click", () => {
        if (confirm("정말 삭제하시겠습니까?")) {
            posts = posts.filter(p => p.id !== postId);
            localStorage.setItem("foundPosts", JSON.stringify(posts));
            alert("게시물이 삭제되었습니다.");
            window.location.href = "../home/home.html";
        }
    });

    // 뒤로가기 버튼 - 찾았어요 게시판으로 이동
    document.getElementById("backBtn").onclick = () => {
        // URL 파라미터로 origin이 있으면 그대로 사용, 없으면 찾았어요 게시판으로
        const urlParams = new URLSearchParams(window.location.search);
        const origin = urlParams.get("origin");
        
        if (origin === "search") {
            window.location.href = "../search/search.html";
        } else {
            // 기본적으로 찾았어요 게시판으로 이동
            window.location.href = "../home/home.html";
        }
    };
});
