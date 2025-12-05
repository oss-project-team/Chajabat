// ===============================
// 🔥 홈 데이터 및 초기값
// ===============================
let boardType = "Found";
let selectedCategory = "전체";
let showOnlyInProgress = false;

// Found/Lost 각각 저장 구조
let foundPosts = JSON.parse(localStorage.getItem("foundPosts")) || [];
let lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];

// ===============================
// 🔥 카드 렌더링
// ===============================
function renderCards() {

    const cardList = document.getElementById("cardList");
    if (!cardList) return;

    // 최신 데이터 불러오기
    foundPosts = JSON.parse(localStorage.getItem("foundPosts")) || [];
    lostPosts = JSON.parse(localStorage.getItem("lostPosts")) || [];

    cardList.innerHTML = "";

    // 현재 게시판 선택
    let targetPosts = (boardType === "Found" ? foundPosts : lostPosts)
        .filter(post => !showOnlyInProgress || !post.solved)
        .filter(post => selectedCategory === "전체" || post.category === selectedCategory);
    
    // 최신 게시물이 위에 오도록 id 기준 내림차순 정렬
    targetPosts.sort((a, b) => (b.id || 0) - (a.id || 0));

    targetPosts.forEach(post => {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
            ${post.img
                ? `<img class="card-image" src="${post.img}">`
                : `<div class="card-placeholder">이미지 없음</div>`
            }
            <div class="card-content">
                <div class="card-title">${post.title}</div>
                <div class="card-date">${post.date}</div>
                <div class="card-place">${post.place}</div>
            </div>
        `;

        card.addEventListener("click", () => {
            if (boardType === "Lost") {
                window.location.href = `../detail/detail_lost.html?id=${post.id}`;
            } else {
                window.location.href = `../detail/detail.html?id=${post.id}`;
            }
        });

        cardList.appendChild(card);
    });
}



// ===============================
// 🔥 DOM 로드 후 이벤트 등록
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    // 🔥 URL 파라미터 확인 (createlost에서 올 때 Lost 탭 유지)
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type");
    if (typeParam === "Lost") {
        boardType = "Lost";
        // 탭 UI 업데이트
        const foundTab = document.getElementById("foundTab");
        if (foundTab) {
            foundTab.innerHTML = `분실했어요! <i class="material-icons expand-icon">expand_less</i>`;
        }
    }

    // 🔍 검색 버튼
    const searchBtn = document.querySelector(".search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            window.location.href = "../search/search.html";
        });
    }

    // 🏷 카테고리 클릭
    document.querySelectorAll(".category").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedCategory = btn.textContent.trim();
            renderCards();
        });
    });

    // 🔄 해결중만 보기
    const toggle = document.getElementById("toggleSolved");
    if (toggle) {
        toggle.addEventListener("change", () => {
            showOnlyInProgress = toggle.checked;
            renderCards();
        });
    }

    // 🔄 찾았어요 ↔ 분실했어요 토글 버튼
    const foundTab = document.getElementById("foundTab");
    if (foundTab) {
        foundTab.addEventListener("click", () => {

            boardType = (boardType === "Found" ? "Lost" : "Found");

            foundTab.innerHTML = boardType === "Found"
                ? `찾았어요! <i class="material-icons expand-icon">expand_more</i>`
                : `분실했어요! <i class="material-icons expand-icon">expand_less</i>`;

            selectedCategory = "전체";

            document.querySelectorAll(".category").forEach((c, i) => {
                if (i === 0) c.classList.add("active");
                else c.classList.remove("active");
            });

            renderCards();
        });
    }

    // ✏ 글쓰기 버튼 분기
    const writeBtn = document.querySelector(".write-btn");
    if (writeBtn) {
        writeBtn.addEventListener("click", () => {
            if (boardType === "Found") {
                window.location.href = "../createfind/createfind.html";
            } else {
                window.location.href = "../createlost/createlost.html";
            }
        });
    }

    // 첫 화면 렌더링
    renderCards();
});