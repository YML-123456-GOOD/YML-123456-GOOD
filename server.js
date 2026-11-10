const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.use(cors());
app.use(express.json());

// API接口全部写在static之前
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: '请求格式错误，需要包含 messages 数组' });
        }
        if (!DEEPSEEK_API_KEY) {
            return res.status(500).json({ error: '后端未配置 DEEPSEEK_API_KEY' });
        }
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: messages,
                stream: false,
                max_tokens: 2048,
                temperature: 0.7
            })
        });
        if (!response.ok) {
            const errText = await response.text();
            console.error('DeepSeek API 错误:', response.status, errText);
            return res.status(response.status).json({
                error: `DeepSeek API 错误 ${response.status}`,
                details: errText.slice(0, 200)
            });
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('服务器内部错误:', error);
        res.status(500).json({ error: '服务器处理请求时发生错误' });
    }
});

// 静态托管放在接口之后！！！
app.use(express.static(path.join(__dirname, '/')));

///app.listen(PORT, "0.0.0.0", () => {
// console.log(`✅ 后端服务器已启动: http://localhost:${PORT}`);
//console.log(`🔐 密钥已加载: ${DEEPSEEK_API_KEY ? '是（安全）' : '否（请检查 .env)'}`);
// 打印已注册路由，方便排错
//const routes = app._router.stack.filter(layer => layer.route).map(layer => layer.route.path);
//console.log("已注册所有路由：", routes);
///});
module.exports = app;
