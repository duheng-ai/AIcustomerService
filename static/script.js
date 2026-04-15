import os
import sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import dashscope
from dashscope import Application

app = FastAPI()

# ---------------- 跨域全开（解决你100%的问题）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# 阿里云密钥
dashscope.api_key = os.getenv("DASHSCOPE_API_KEY")
APP_ID = os.getenv("APP_ID")

# 首页
@app.get("/")
async def index():
    return FileResponse("index.html")

# 聊天接口
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(req: ChatRequest):
    try:
        response = Application.call(
            app_id=APP_ID,
            prompt=req.message
        )
        return {"code": 200, "data": response.output.text}
    except Exception as e:
        return {"code": 500, "data": "出错：" + str(e)}
