#!/usr/bin/env python3
"""Static file server + AI proxy for Nanjing Travel app (Lingdong Jinling)."""
import http.server
import json
import os
import sys

import httpx

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Bypass system proxy for direct API access
os.environ["NO_PROXY"] = "*"
os.environ["no_proxy"] = "*"

AI_API_KEY = os.getenv("AI_API_KEY", "sk-ws-H.REIRDIY.bLc7.MEUCIC4oDhHycxNA10zfUvJK7MxsztMItZt3b-bzm2GHhaylAiEA9z0y3PlV3hNmm0hz7fOrK_X7SYxEaMqP6EBbwa-Mzwg")
AI_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
AI_MODEL = "qwen-turbo"

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "src", "main", "resources", "static", "app")
PORT = 8080

http_client = httpx.Client(timeout=httpx.Timeout(15.0, connect=5.0))

SYSTEM_PROMPT = """你是「灵动金陵」APP的内嵌AI旅游向导，一位从小在南京长大的本地朋友。

⚠️ 最重要规则：先看用户在问什么，再回答。不要答非所问！
- 问美食/吃的 → 推荐美食小吃线和老门东/夫子庙美食
- 问历史/校园/南大 → 推荐南大校史线
- 问夜景/秦淮河 → 推荐秦淮夜游线
- 问博物馆/展览 → 推荐博物馆展览线
- 问景点/拍照/打卡 → 推荐对应景点

回复规则：
- 用中文，简短精炼，2-3句话
- 语气轻松亲切，像南京本地朋友在聊天
- 偶尔加一句南京话（如"蛮好""扎实""唠"）

=== 南京知识库 ===
路线：
- 美食小吃线(2h)：老门东小吃→夫子庙秦淮八绝→新街口，纯吃路线
- 秦淮夜游线(3h)：秦淮河→夫子庙→老门东，夜景+美食
- 南大校史线(2.5h)：三江师范学堂→北大楼→梧桐大道→校史馆
- 博物馆线(3h)：南京博物院→先锋书店→六朝博物馆
景点：中山陵、明孝陵、总统府、鸡鸣寺、玄武湖、南京城墙、大报恩寺
美食：鸭血粉丝汤(老门东小潘记)、盐水鸭(韩复兴)、牛肉锅贴(李记清真馆)、桂花糖芋苗、赤豆元宵、蟹黄汤包、金陵双臭
贴士：春秋最美(3-5月、10-11月)，梧桐大道秋天绝美，博物院需提前预约

=== 示例（按这个风格回答） ===
用户："推荐美食路线"
你："老门东走起！先去小潘记搞碗鸭血粉丝汤，再到李记啃二两牛肉锅贴，最后去夫子庙收尾吃个赤豆元宵，两个小时撑得你走不动路～"
用户："南大值得去吗"
你："当然值得！梧桐大道是这个季节最美的，北大楼的红砖配蓝天，随手一拍就是壁纸。整条校史线慢慢走下来大概两个半小时～"
用户："晚上有什么好玩的"
你："秦淮河夜游安排上！傍晚先去夫子庙逛吃，天黑坐船看灯影，最后老门东巷子里找家小馆子，金陵夜色的精髓都在这里了。"
用户："想去博物馆"
你："南博必须去！银缕玉衣和竹林七贤砖画值得看半天，出来顺路去先锋书店坐坐，完美的文化日～记得提前一天预约南博哦。"""


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_POST(self):
        if self.path.startswith("/api/ai/chat"):
            self._handle_ai_chat()
        else:
            self._mock_api()

    def do_GET(self):
        if self.path.startswith("/api/"):
            self._mock_api()
        else:
            super().do_GET()

    def _handle_ai_chat(self):
        length = int(self.headers.get("Content-Length", 0))
        body = {}
        if length > 0:
            raw = self.rfile.read(length)
            try:
                body = json.loads(raw)
            except (UnicodeDecodeError, json.JSONDecodeError):
                body = json.loads(raw.decode("utf-8", errors="replace"))

        user_msg = body.get("message", "")

        try:
            resp = http_client.post(
                AI_BASE_URL,
                headers={
                    "Authorization": f"Bearer {AI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": AI_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg},
                    ],
                    "max_tokens": 512,
                    "temperature": 0.7,
                },
            )
            data = resp.json()
            reply = data["choices"][0]["message"]["content"].strip()
            if not reply:
                reply = "让我想想..."

            usage = data.get("usage", {})
            print(f"[AI] model={data.get('model', AI_MODEL)} tokens_in={usage.get('prompt_tokens', 0)} tokens_out={usage.get('completion_tokens', 0)}")

        except Exception as e:
            print(f"[AI] Error: {e}")
            reply = "向导暂时不在线，请稍后重试。"

        result = {
            "code": 200,
            "data": {
                "sessionId": "qwen-session",
                "role": "南京本地向导",
                "content": reply,
                "reply": reply,
                "provider": "qwen",
            },
        }
        self._send_json(result)

    def _mock_api(self):
        self._send_json({"code": 200, "data": {}})

    def _send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")


if __name__ == "__main__":
    print(f"Starting proxy server at http://localhost:{PORT}")
    print(f"Serving static files from: {STATIC_DIR}")
    print(f"AI: Qwen ({AI_MODEL}) via DashScope API (max_tokens=512, timeout=15s)")
    http.server.HTTPServer(("0.0.0.0", PORT), ProxyHandler).serve_forever()

