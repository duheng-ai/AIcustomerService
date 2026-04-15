let typingElement = null;

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';
    showTyping();

    try {
        const res = await fetch('https://ai-customerservice-lianok.up.railway.app/api/chat', {
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

    // 安全处理：统一转换为字符串，避免 undefined / null / 对象报错
    let html = content;
    if (html == null) {
        html = '';
    } else if (typeof html !== 'string') {
        if (typeof html === 'object') {
            if (html.type === 'image' && html.url) {
                html = `![image](${html.url})`;
            } else if (html.image) {
                html = `![image](${html.image})`;
            } else if (html.url) {
                html = `![image](${html.url})`;
            } else {
                try {
                    html = JSON.stringify(html);
                } catch (err) {
                    html = String(html);
                }
            }
        } else {
            try {
                html = JSON.stringify(html);
            } catch (err) {
                html = String(html);
            }
        }
    }

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
        <div class="avatar ${type}">${type === 'ai' ? '火' : 'U'}</div>
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
