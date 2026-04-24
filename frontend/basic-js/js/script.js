// ────────────────────────────────────────────
// 랜덤 Unsplash 이미지 풀 (새로 추가된 카드용)
// ────────────────────────────────────────────
const imagePool = [
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=400',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=400',
    'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400',
    'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400',
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400',
];
let imageIdx = 0;

function nextImage() {
    const img = imagePool[imageIdx % imagePool.length];
    imageIdx++;
    return img;
}

// ────────────────────────────────────────────
// 데이터 관리 변수
// ────────────────────────────────────────────
let lions = [];
let nextId = 0;

// ────────────────────────────────────────────
// LocalStorage 관련 함수 (명단 저장)
// ────────────────────────────────────────────

function saveToLocalStorage() {
    localStorage.setItem('lions_data', JSON.stringify(lions));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('lions_data');
    if (savedData) {
        lions = JSON.parse(savedData);
        // ID 값 동기화 (기존 데이터 중 가장 큰 ID + 1)
        if (lions.length > 0) {
            nextId = Math.max(...lions.map(l => l.id)) + 1;
        }
        renderAllCards();
    } else {
        // 저장된 데이터가 없는 초기 상태라면 DOM에서 직접 파싱
        initFromDOM();
    }
}

function renderAllCards() {
    const summarySection = document.getElementById('summarySection');
    const detailSection = document.getElementById('detailSection');

    summarySection.innerHTML = '';
    detailSection.innerHTML = '';

    lions.forEach(lion => {
        summarySection.appendChild(createSummaryCard(lion));
        detailSection.appendChild(createDetailCard(lion));
    });
    updateCount();
}

// ────────────────────────────────────────────
// SessionStorage 관련 함수 (입력 폼 임시 보존)
// ────────────────────────────────────────────
const inputIds = ['inputName', 'inputSkills', 'inputIntro', 'inputBio', 'inputEmail', 'inputPhone', 'inputWebsite', 'inputQuote', 'inputPart'];

function setupSessionStorage() {
    inputIds.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
            sessionStorage.setItem(`temp_${id}`, el.value);
        });
    });
}

function restoreFromSession() {
    inputIds.forEach(id => {
        const savedValue = sessionStorage.getItem(`temp_${id}`);
        if (savedValue) {
            document.getElementById(id).value = savedValue;
        }
    });
}

// ────────────────────────────────────────────
// 기존 핵심 로직 (DOM 파싱 및 UI 생성)
// ────────────────────────────────────────────
function initFromDOM() {
    const summaryCards = document.querySelectorAll('#summarySection .summary-card');
    const detailCards = document.querySelectorAll('#detailSection .detail-card');

    summaryCards.forEach((sc, i) => {
        const dc = detailCards[i];
        const id = nextId++;

        sc.setAttribute('data-id', id);
        if (dc) dc.setAttribute('data-id', id);

        const skillItems = dc ? [...dc.querySelectorAll('.detail-content ul li')].map(li => li.textContent.trim()) : [];

        let email = '', phone = '', website = '', quote = '';
        if (dc) {
            const contactItems = [...dc.querySelectorAll('.contact-list li')];
            contactItems.forEach(li => {
                const text = li.textContent;
                if (text.startsWith('Email:')) email = text.replace('Email:', '').trim();
                else if (text.startsWith('Phone:')) phone = text.replace('Phone:', '').trim();
                else {
                    const a = li.querySelector('a');
                    if (a) website = a.href;
                }
            });
            const qp = dc.querySelector('.quote-text');
            if (qp) quote = qp.textContent.trim();
        }

        lions.push({
            id,
            name: sc.querySelector('.name').textContent.trim(),
            role: sc.querySelector('.role').textContent.trim(),
            intro: sc.querySelector('.intro').textContent.trim(),
            badge: sc.querySelector('.badge') ? sc.querySelector('.badge').textContent.trim() : '',
            skills: skillItems,
            bio: dc ? (dc.querySelector('.detail-content p') || {textContent: ''}).textContent.trim() : '',
            image: sc.querySelector('img').src,
            email, phone, website, quote,
            isMyCard: sc.classList.contains('my-card'),
        });
    });
    saveToLocalStorage(); // 파싱 후 최초 저장
    updateCount();
}

function updateCount() {
    document.getElementById('totalCount').textContent = `총 ${lions.length}명`;
}

function createSummaryCard(lion) {
    const div = document.createElement('div');
    div.className = 'summary-card' + (lion.isMyCard ? ' my-card' : '');
    div.setAttribute('data-id', lion.id);

    const badge = lion.badge || (lion.skills[0] || '');
    div.innerHTML = `
            <div class="image-container">
                <img src="${lion.image}" alt="${lion.name} 사진" onerror="this.src='https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400'">
                ${badge ? `<span class="badge">${badge}</span>` : ''}
            </div>
            <div class="summary-info">
                <p class="name">${lion.name}</p>
                <p class="role">${lion.role}</p>
                <p class="intro">${lion.intro}</p>
            </div>
        `;
    return div;
}

function createDetailCard(lion) {
    const div = document.createElement('div');
    div.className = 'detail-card';
    div.setAttribute('data-id', lion.id);

    const skillsHTML = lion.skills.map(s => `<li>${s}</li>`).join('');
    let contactHTML = '';
    const contactLines = [];

    if (lion.email) contactLines.push(`<li>Email: ${lion.email}</li>`);
    if (lion.phone) contactLines.push(`<li>Phone: ${lion.phone}</li>`);
    if (lion.website) contactLines.push(`<li><a href="${lion.website}" target="_blank">${lion.website}</a></li>`);
    if (contactLines.length) contactHTML = `<h3>연락처</h3><ul class="contact-list">${contactLines.join('')}</ul>`;

    const quoteHTML = lion.quote ? `<h3>한 마디</h3><p class="quote-text">${lion.quote}</p>` : '';

    div.innerHTML = `
            <h2 class="detail-name">${lion.name}</h2>
            <p class="detail-role">${lion.role}</p>
            <p class="detail-track">LION TRACK</p>
            <div class="detail-content">
                <h3>자기소개</h3>
                <p>${lion.bio}</p>
                ${contactHTML}
                <h3>관심 기술</h3>
                <ul>${skillsHTML}</ul>
                ${quoteHTML}
            </div>
        `;
    return div;
}

// ────────────────────────────────────────────
// 이벤트 핸들러 및 폼 관리
// ────────────────────────────────────────────
const toggleFormBtn = document.getElementById('toggleFormBtn');
const formSection = document.getElementById('formSection');
const cancelBtn = document.getElementById('cancelBtn');

toggleFormBtn.addEventListener('click', () => {
    const isOpen = formSection.classList.toggle('open');
    toggleFormBtn.classList.toggle('active', isOpen);
    if (!isOpen) resetForm();
});

cancelBtn.addEventListener('click', () => {
    formSection.classList.remove('open');
    toggleFormBtn.classList.remove('active');
    resetForm();
});

function resetForm() {
    inputIds.forEach(id => {
        document.getElementById(id).value = (id === 'inputPart' ? 'Frontend' : '');
        sessionStorage.removeItem(`temp_${id}`); // 세션 저장소도 비우기
    });
    clearWarnings();
}

function clearWarnings() {
    document.querySelectorAll('.warning-msg').forEach(el => el.classList.remove('show'));
}

// 추가하기 버튼
document.getElementById('submitBtn').addEventListener('click', () => {
    clearWarnings();

    const name = document.getElementById('inputName').value.trim();
    const part = document.getElementById('inputPart').value;
    const skills = document.getElementById('inputSkills').value.trim();
    const intro = document.getElementById('inputIntro').value.trim();
    const bio = document.getElementById('inputBio').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const website = document.getElementById('inputWebsite').value.trim();
    const quote = document.getElementById('inputQuote').value.trim();

    // 이메일 형식 체크: user@domain.com 등
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // URL 형식 체크: http:// 또는 https:// 로 시작하는지 확인
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

    let valid = true;

    // 1. 필수 값 체크 (이전과 동일)
    if (!name) {
        showWarn('warnName', '이름을 입력해 주세요.');
        valid = false;
    }

    if (!skills) {
        showWarn('warnSkills', '관심 기술을 입력해 주세요.');
        valid = false;
    }

    if (!intro) {
        showWarn('warnIntro', '한 줄 소개를 입력해 주세요.');
        valid = false;
    }

    if (!bio) {
        showWarn('warnBio', '자기소개를 입력해 주세요.');
        valid = false;
    }

    if (!phone) {
        showWarn('warnPhone', '전화번호를 입력해 주세요.');
        valid = false;
    }

    if (!quote) {
        showWarn('warnQuote', '한 마디를 입력해 주세요.');
        valid = false;
    }


    // 2. 이메일 형식 체크
    if (!email) {
        showWarn('warnEmail', '이메일을 입력해 주세요.');
        valid = false;
    } else if (!emailRegex.test(email)) {
        showWarn('warnEmail', '올바른 이메일 형식이 아닙니다. (예: user@link.com)');
        valid = false;
    }

    // 3. URL 형식 체크
    if (!website) {
        showWarn('warnWebsite', 'URL을 입력해 주세요.');
        valid = false;
    } else if (!urlRegex.test(website)) {
        showWarn('warnWebsite', '올바른 URL 형식이 아닙니다. (http:// 또는 https:// 포함)');
        valid = false;
    }

    if (!valid) return;

    const skillArr = skills.split(',').map(s => s.trim()).filter(Boolean);
    const lion = {
        id: nextId++,
        name, role: part, intro, badge: skillArr[0] || '',
        skills: skillArr, bio, image: nextImage(),
        email, phone, website, quote, isMyCard: false,
    };

    lions.push(lion);
    saveToLocalStorage(); // 데이터 저장

    document.getElementById('summarySection').appendChild(createSummaryCard(lion));
    document.getElementById('detailSection').appendChild(createDetailCard(lion));
    updateCount();

    formSection.classList.remove('open');
    toggleFormBtn.classList.remove('active');
    resetForm();
});

function showWarn(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('show');
}

// 삭제하기 버튼
document.getElementById('deleteLastBtn').addEventListener('click', () => {
    if (lions.length === 0) return;

    const last = lions.pop();
    saveToLocalStorage(); // 데이터 변경 저장

    const sc = document.querySelector(`#summarySection .summary-card[data-id="${last.id}"]`);
    const dc = document.querySelector(`#detailSection .detail-card[data-id="${last.id}"]`);
    if (sc) sc.remove();
    if (dc) dc.remove();

    updateCount();
});

// ────────────────────────────────────────────
// 앱 실행 (초기 로드)
// ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage(); // 저장된 명단 불러오기
    setupSessionStorage();  // 세션 리스너 등록
    restoreFromSession();   // 작성 중이던 폼 복구
});