document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(location.search);
    const postId = Number(params.get("id"));

    let posts = JSON.parse(localStorage.getItem("foundPosts")) || [];
    let post = posts.find(p => p.id === postId);

    if (!post) return;

    // --------------------------
    // 🔥 데이터 바인딩
    // --------------------------
    document.getElementById("detailTitle").textContent = post.title;
    document.getElementById("detailDesc").textContent = post.description;
    document.getElementById("detailPlace").textContent = post.place;
    document.getElementById("detailDate").textContent = post.date;

    if (post.img) {
        document.getElementById("detailImage").src = post.img;
    }

    // --------------------------
    // 🔥 상태 표시 및 전환 버튼 (작성자만 보임)
    // --------------------------
    const statusLabel = document.getElementById("statusLabel");
    const statusDot = document.querySelector(".status-dot");
    const toggleStatusBtn = document.getElementById("toggleStatusBtn");
    
    // 작성자는 삭제/수정 버튼이 보이므로, 이 페이지를 보는 사람은 작성자로 간주
    // 상태 전환 버튼 표시
    toggleStatusBtn.style.display = "flex";
    
    // 현재 상태에 따라 UI 업데이트
    function updateStatusUI() {
        if (post.solved) {
            statusLabel.textContent = "해결 완료";
            statusDot.style.background = "#4caf50"; // 초록색
            toggleStatusBtn.innerHTML = '<i class="material-icons">sync</i>';
            toggleStatusBtn.title = "해결 중으로 변경";
        } else {
            statusLabel.textContent = "해결 중";
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
        posts = posts.map(p => p.id === postId ? post : p);
        localStorage.setItem("foundPosts", JSON.stringify(posts));
        
        // UI 업데이트
        updateStatusUI();
    });

    // --------------------------
    // 🔙 뒤로가기
    // --------------------------
    document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
    });

    // --------------------------
    // 🗑 삭제하기
    // --------------------------
    document.getElementById("deleteBtn").addEventListener("click", () => {
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem("foundPosts", JSON.stringify(posts));

        window.location.href = "../home/home.html";
    });

    // --------------------------
    // ✏ 수정하기
    // --------------------------
    document.getElementById("editBtn").addEventListener("click", () => {
        window.location.href = `../createfind/createfind.html?edit=${postId}`;
    });
});