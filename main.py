import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel  # 用于接收JSON
import dashscope
from dashscope import Application

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 阿里云配置
dashscope.api_key = os.getenv("DASHSCOPE_API_KEY")
APP_ID = os.getenv("APP_ID")

# 接收前端JSON的模型
class ChatRequest(BaseModel):
    message: str

# 首页
@app.get("/")
async def root():
    return FileResponse("index.html")

# 修复：JSON接收参数（兼容前端）
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = Application.call(
            app_id=APP_ID,
            prompt=request.message,
            parameters={"enable_thinking": False}
        )

        if not response or not response.output or not response.output.text:
            return {"code": 200, "content": "未找到相关内容"}
        
        answer = response.output.text
        return {"code": 200, "content": answer}

    except Exception as e:
        return {"code": 500, "detail": f"调用失败：{str(e)}"}
