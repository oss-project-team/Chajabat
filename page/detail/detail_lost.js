document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(location.search);
    const postId = Number(params.get("id"));

    let lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];
    let post = lostPosts.find(p => p.id === postId);

    if (!post) {
        console.error("게시물을 찾을 수 없습니다. postId:", postId, "lostPosts:", lostPosts);
        // 에러 메시지 표시
        document.getElementById("detailTitle").textContent = "게시물을 찾을 수 없습니다";
        document.getElementById("detailDesc").textContent = "요청하신 게시물이 존재하지 않습니다.";
        return;
    }

    // 데이터 넣기
    document.getElementById("detailTitle").textContent = post.title;
    document.getElementById("detailDesc").textContent = post.description;
    document.getElementById("detailPlace").textContent = post.place;
    document.getElementById("detailDate").textContent = post.date;
    document.getElementById("detailCategory").textContent = post.category;

    if (post.img) {
        document.getElementById("detailImage").src = post.img;
    }

    // --------------------------
    // 🔥 상태 표시 및 전환 버튼 (작성자만 보임)
    // --------------------------
    const statusText = document.getElementById("statusText");
    const statusDot = document.querySelector(".status-dot");
    const toggleStatusBtn = document.getElementById("toggleStatusBtn");
    
    // 작성자 여부 판단 (현재는 모든 사용자에게 표시, 나중에 작성자 판단 로직 추가 가능)
    // TODO: 작성자 여부 판단 로직 추가
    const isAuthor = true; // 임시로 true로 설정
    
    if (isAuthor) {
        toggleStatusBtn.style.display = "flex";
    }
    
    // 현재 상태에 따라 UI 업데이트
    function updateStatusUI() {
        if (post.solved) {
            statusText.textContent = "해결 완료";
            statusDot.style.background = "#4caf50"; // 초록색
            toggleStatusBtn.innerHTML = '<i class="material-icons">sync</i>';
            toggleStatusBtn.title = "해결 중으로 변경";
        } else {
            statusText.textContent = "해결 중";
            statusDot.style.background = "#ff9800"; // 주황색
            toggleStatusBtn.innerHTML = '<i class="material-icons">sync</i>';
            toggleStatusBtn.title = "해결 완료로 변경";
        }
    }
    
    // 초기 상태 표시
    updateStatusUI();
    
    // 상태 전환 버튼 클릭 이벤트
    toggleStatusBtn.addEventListener("click", () => {
        post.solved = !post.solved;
        
        // localStorage 업데이트
        lostPosts = lostPosts.map(p => p.id === postId ? post : p);
        localStorage.setItem("lostPosts", JSON.stringify(lostPosts));
        
        // UI 업데이트
        updateStatusUI();
    });

    // --------------------------
    // 🔥 버튼 표시 (작성자 여부에 따라)
    // --------------------------
    const authorBtns = document.getElementById("authorBtns");
    const msgBtn = document.getElementById("msgBtn");
    
    if (isAuthor) {
        // 작성자: 삭제/수정 버튼 표시, 쪽지 버튼 숨김
        if (authorBtns) {
            authorBtns.style.display = "flex";
        }
        if (msgBtn) {
            msgBtn.style.display = "none";
        }
    } else {
        // 다른 사람: 쪽지 버튼 표시, 삭제/수정 버튼 숨김
        if (authorBtns) {
            authorBtns.style.display = "none";
        }
        if (msgBtn) {
            msgBtn.style.display = "block";
        }
    }

    // 뒤로가기 (home 페이지의 분실했어요! 탭으로 이동)
    document.getElementById("backBtn").addEventListener("click", () => {
        window.location.href = "../home/home.html?type=Lost";
    });

    // --------------------------
    // 🗑 삭제하기 (작성자만)
    // --------------------------
    const deleteBtn = document.getElementById("deleteBtn");
    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (confirm("정말 삭제하시겠습니까?")) {
                lostPosts = lostPosts.filter(p => p.id !== postId);
                localStorage.setItem("lostPosts", JSON.stringify(lostPosts));
                window.location.href = "../home/home.html?type=Lost";
            }
        });
    }

    // --------------------------
    // ✏ 수정하기 (작성자만)
    // --------------------------
    const editBtn = document.getElementById("editBtn");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = `../createlost/createlost.html?edit=${postId}`;
        });
    }

    // --------------------------
    // 💬 쪽지보내기 (다른 사람만)
    // --------------------------
    if (msgBtn) {
        msgBtn.addEventListener("click", () => {
            alert("쪽지 기능은 나중에 연결됩니다!");
        });
    }

});