/** @type {string[]} */
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

/** @returns {string} 풀에서 이미지 URL을 순환하며 반환 */
function nextImage() {
    const img = imagePool[imageIdx % imagePool.length];
    imageIdx++;
    return img;
}

/** @type {Array<{id: number, name: string, role: string, intro: string, badge: string, skills: string[], bio: string, image: string, email: string, phone: string, website: string, quote: string, isMyCard: boolean}>} */
let lions = [];
let nextId = 0;

function saveToLocalStorage() {
    localStorage.setItem('lions_data', JSON.stringify(lions));
}

/**
 * localStorage에서 명단을 불러온다.
 * 저장된 데이터가 없으면 HTML DOM에서 초기 파싱을 수행한다.
 */
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('lions_data');
    if (savedData) {
        lions = JSON.parse(savedData);
        if (lions.length > 0) {
            // 재로드 시 ID 충돌 방지를 위해 기존 최댓값 기준으로 동기화
            nextId = Math.max(...lions.map(l => l.id)) + 1;
        }
        renderAllCards();
    } else {
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

/** @type {string[]} 세션 보존 대상 input ID 목록 */
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

/**
 * HTML에 정적으로 작성된 카드 DOM을 파싱해 lions 배열을 초기화한다.
 * localStorage에 저장된 데이터가 없을 때만 호출된다.
 */
function initFromDOM() {
    const summaryCards = document.querySelectorAll('#summarySection .summary-card');
    const detailCards = document.querySelectorAll('#detailSection .detail-card');

    summaryCards.forEach((sc, i) => {
        const dc = detailCards[i];
        const id = nextId++;

        sc.setAttribute('data-id', id.toString());
        if (dc) {
            dc.setAttribute('data-id', id.toString());
        }

        const skillItems = dc
            ? [...dc.querySelectorAll('.detail-content ul li')].map(li => li.textContent.trim())
            : [];

        let email = '', phone = '', website = '', quote = '';
        if (dc) {
            dc.querySelectorAll('.contact-list li').forEach(li => {
                const text = li.textContent;
                if (text.startsWith('Email:')) {
                    email = text.replace('Email:', '').trim();
                } else if (text.startsWith('Phone:')) {
                    phone = text.replace('Phone:', '').trim();
                } else {
                    const a = li.querySelector('a');
                    if (a) website = a.href;
                }
            });

            const qp = dc.querySelector('.quote-text');
            if (qp) {
                quote = qp.textContent.trim();
            }
        }

        lions.push({
            id,
            name: sc.querySelector('.name').textContent.trim(),
            role: sc.querySelector('.role').textContent.trim(),
            intro: sc.querySelector('.intro').textContent.trim(),
            badge: sc.querySelector('.badge')?.textContent.trim() ?? '',
            skills: skillItems,
            bio: dc ? (dc.querySelector('.detail-content p') || { textContent: '' }).textContent.trim() : '',
            image: sc.querySelector('img').src,
            email, phone, website, quote,
            isMyCard: sc.classList.contains('my-card'),
        });
    });
    saveToLocalStorage();
    updateCount();
}

function updateCount() {
    document.getElementById('totalCount').textContent = `총 ${lions.length}명`;
}

/**
 * @param {{ id: number, name: string, role: string, intro: string, badge: string, skills: string[], image: string, isMyCard: boolean }} lion
 * @returns {HTMLDivElement}
 */
function createSummaryCard(lion) {
    const div = document.createElement('div');
    div.className = 'summary-card' + (lion.isMyCard ? ' my-card' : '');
    div.setAttribute('data-id', lion.id.toString());

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

/**
 * @param {{ id: number, name: string, role: string, bio: string, skills: string[], email: string, phone: string, website: string, quote: string }} lion
 * @returns {HTMLDivElement}
 */
function createDetailCard(lion) {
    const div = document.createElement('div');
    div.className = 'detail-card';
    div.setAttribute('data-id', lion.id.toString());

    const skillsHTML = lion.skills.map(s => `<li>${s}</li>`).join('');
    const contactLines = [];

    if (lion.email) {
        contactLines.push(`<li>Email: ${lion.email}</li>`);
    }

    if (lion.phone) {
        contactLines.push(`<li>Phone: ${lion.phone}</li>`);
    }

    if (lion.website) {
        contactLines.push(`<li><a href="${lion.website}" target="_blank">${lion.website}</a></li>`);
    }

    const contactHTML = contactLines.length
        ? `<h3>연락처</h3><ul class="contact-list">${contactLines.join('')}</ul>`
        : '';
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

const toggleFormBtn = document.getElementById('toggleFormBtn');
const formSection = document.getElementById('formSection');
const cancelBtn = document.getElementById('cancelBtn');

toggleFormBtn.addEventListener('click', () => {
    const isOpen = formSection.classList.toggle('open');
    toggleFormBtn.classList.toggle('active', isOpen);

    if (!isOpen) {
        resetForm();
    }
});

cancelBtn.addEventListener('click', () => {
    formSection.classList.remove('open');
    toggleFormBtn.classList.remove('active');
    resetForm();
});

function resetForm() {
    inputIds.forEach(id => {
        document.getElementById(id).value = id === 'inputPart' ? 'Frontend' : '';
        sessionStorage.removeItem(`temp_${id}`);
    });
    clearWarnings();
}

function clearWarnings() {
    document.querySelectorAll('.warning-msg')
        .forEach(el => el.classList.remove('show'));
}

document.getElementById('submitBtn').addEventListener('click', () => {
    clearWarnings();

    const name    = document.getElementById('inputName').value.trim();
    const part    = document.getElementById('inputPart').value;
    const skills  = document.getElementById('inputSkills').value.trim();
    const intro   = document.getElementById('inputIntro').value.trim();
    const bio     = document.getElementById('inputBio').value.trim();
    const email   = document.getElementById('inputEmail').value.trim();
    const phone   = document.getElementById('inputPhone').value.trim();
    const website = document.getElementById('inputWebsite').value.trim();
    const quote   = document.getElementById('inputQuote').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const urlRegex   = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

    let valid = true;

    if (!name)  {
        showWarn('warnName',   '이름을 입력해 주세요.');
        valid = false;
    }

    if (!skills){
        showWarn('warnSkills', '관심 기술을 입력해 주세요.');
        valid = false;
    }

    if (!intro) {
        showWarn('warnIntro',  '한 줄 소개를 입력해 주세요.');
        valid = false;
    }

    if (!bio)   {
        showWarn('warnBio',    '자기소개를 입력해 주세요.');
        valid = false;
    }

    if (!phone) {
        showWarn('warnPhone',  '전화번호를 입력해 주세요.');
        valid = false;
    }

    if (!quote) {
        showWarn('warnQuote',  '한 마디를 입력해 주세요.');
        valid = false;
    }

    if (!email) {
        showWarn('warnEmail', '이메일을 입력해 주세요.');
        valid = false;
    } else if (!emailRegex.test(email)) {
        showWarn('warnEmail', '올바른 이메일 형식이 아닙니다. (예: user@link.com)');
        valid = false;
    }

    if (!website) {
        showWarn('warnWebsite', 'URL을 입력해 주세요.');
        valid = false;
    } else if (!urlRegex.test(website)) {
        showWarn('warnWebsite', '올바른 URL 형식이 아닙니다. (http:// 또는 https:// 포함)');
        valid = false;
    }

    if (!valid) {
        return;  // 저장 안됨
    }

    const skillArr = skills.split(',').map(s => s.trim()).filter(Boolean);
    const lion = {
        id: nextId++,
        name, role: part, intro, badge: skillArr[0] || '',
        skills: skillArr, bio, image: nextImage(),
        email, phone, website, quote, isMyCard: false,
    };

    lions.push(lion);
    saveToLocalStorage();

    document.getElementById('summarySection').appendChild(createSummaryCard(lion));
    document.getElementById('detailSection').appendChild(createDetailCard(lion));
    updateCount();

    formSection.classList.remove('open');
    toggleFormBtn.classList.remove('active');
    resetForm();
});

/** @param {string} id
 *  @param {string} msg
 */
function showWarn(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('show');
}

document.getElementById('deleteLastBtn').addEventListener('click', () => {
    if (lions.length === 0) {
        return;
    }

    const last = lions.pop();
    saveToLocalStorage();

    document.querySelector(`#summarySection .summary-card[data-id="${last.id}"]`)?.remove();
    document.querySelector(`#detailSection .detail-card[data-id="${last.id}"]`)?.remove();

    updateCount();
});

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupSessionStorage();
    restoreFromSession();
});