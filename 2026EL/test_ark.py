import os
import sys
from volcenginesdkarkruntime import Ark

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

api_key = os.getenv("ARK_API_KEY")

client = Ark(
    base_url="https://ark.cn-beijing.volces.com/api/v3",
    api_key=api_key,
)

response = client.responses.create(
    model="doubao-seed-2-0-mini-260428",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_image",
                    "image_url": "https://ark-project.tos-cn-beijing.volces.com/doc_image/ark_demo_img_1.png",
                },
                {
                    "type": "input_text",
                    "text": "你看见了什么？",
                },
            ],
        }
    ],
)

# Extract and print the text content
for item in response.output:
    if hasattr(item, "content"):
        for block in item.content:
            if hasattr(block, "text"):
                print(block.text)

print()
print(f"模型: {response.model}")
print(f"Token: 输入={response.usage.input_tokens}, 输出={response.usage.output_tokens}, 总计={response.usage.total_tokens}")

