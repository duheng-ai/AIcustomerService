let typingElement = null;


async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;
    document.querySelector('.chat-container').classList.add('expanded');
    appendMessage(message, 'user');
    input.value = '';
    showTyping();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });

        const data = await res.json();
        hideTyping();

        if (data.code === 200) {
            appendMessage(data.content, 'ai');
        } else {
            appendMessage('错误：' + data.detail, 'ai');
        }
    } catch (err) {
        hideTyping();
        appendMessage('服务连接失败，请检查后端是否启动！', 'ai');
        console.error(err);
    }
    const header = document.querySelector('.header-container');
    header.classList.add('header-container-hidden');
}

function showTyping() {
    const chatBox = document.getElementById('chatBox');
    typingElement = document.createElement('div');
    typingElement.className = 'message-wrapper';
    typingElement.innerHTML = `
        <div class="avatar ai">火</div>
        <div class="typing">
            <span></span><span></span><span></span>
        </div>
    `;
    chatBox.appendChild(typingElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    if (typingElement) {
        typingElement.remove();
        typingElement = null;
    }
}

function appendMessage(content, type) {
    const chatBox = document.getElementById('chatBox');
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${type}`;

    let html = content;
    html = html.replace(/!\[.*?\]\((https?:\/\/.*?)\)/g, (m, url) =>
        `<img src="${url}" onclick="showPreview('${url}')" alt="点击放大">`
    );
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    html = html.replace(/\n{3,}/g, '<br>');
    html = html.replace(/\n{2,}/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    wrapper.innerHTML = `
        <div class="avatar ${type}">${type === 'ai' ? '火' : '您'}</div>
        <div class="message ${type}">${html}</div>
    `;

    chatBox.appendChild(wrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showPreview(url) {
    const preview = document.getElementById('imgPreview');
    document.getElementById('previewImg').src = url;
    preview.style.display = 'flex';
}

document.getElementById('imgPreview').onclick = function() {
    this.style.display = 'none';
};

document.getElementById('userInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
// ====================== 快捷短语配置（这里改文字，前端看不见） ======================
const quickTexts = [
    "哈哈哈哈1 ",  // 第1个按钮
    "快捷信息2",  // 第2个按钮
    "快捷信息3"   // 第3个按钮
];

// 自动渲染按钮文字
document.querySelectorAll('.quick-btn').forEach((btn, index) => {
    // 从JS加载文字，HTML看不见
    btn.textContent = quickTexts[index];

    // 点击发送逻辑
    btn.addEventListener('click', () => {
        const text = quickTexts[index];
        document.getElementById('userInput').value = text;
        sendMessage();
    });
});
