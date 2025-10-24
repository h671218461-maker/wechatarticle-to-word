// 从环境变量获取后端URL，如果没有设置则使用开发环境URL
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : '你的Railway应用URL'; // 替换为实际的Railway URL

async function exportArticle() {
    const urlInput = document.getElementById('wechatUrl');
    const exportBtn = document.getElementById('exportBtn');
    const messageDiv = document.getElementById('message');
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showMessage('请输入微信文章链接', 'error');
        return;
    }
    
    if (!url.startsWith('https://mp.weixin.qq.com/')) {
        showMessage('请提供有效的微信文章链接', 'error');
        return;
    }
    
    // 禁用按钮，显示加载状态
    exportBtn.disabled = true;
    exportBtn.textContent = '处理中...';
    showMessage('正在处理，请稍等...', 'info');
    
    try {
        const response = await fetch(`${API_BASE_URL}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            
            // 从响应头获取文件名，或者使用默认名称
            const contentDisposition = response.headers.get('content-disposition');
            let filename = '微信文章.docx';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // 创建下载链接
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            
            showMessage('导出成功！文件已开始下载', 'success');
            urlInput.value = ''; // 清空输入框
        } else {
            const errorData = await response.json();
            showMessage(`导出失败: ${errorData.error}`, 'error');
        }
    } catch (error) {
        showMessage(`请求失败: ${error.message}`, 'error');
    } finally {
        // 恢复按钮状态
        exportBtn.disabled = false;
        exportBtn.textContent = '导出为Word';
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // 3秒后自动隐藏成功和信息消息
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// 回车键触发导出
document.getElementById('wechatUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        exportArticle();
    }
});
