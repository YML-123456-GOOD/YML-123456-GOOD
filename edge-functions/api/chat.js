export async function onRequestPost({ request, env }) {
    try {
        const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
        if (!DEEPSEEK_API_KEY) {
            return new Response(JSON.stringify({ error: "缺少DEEPSEEK_API_KEY环境变量" }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            })
        }
        const reqBody = await request.json();
        const { messages } = reqBody;
        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "messages参数错误" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            })
        }
        const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: messages,
                temperature: 0.7
            })
        })
        const result = await res.json();
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" }
        })
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
