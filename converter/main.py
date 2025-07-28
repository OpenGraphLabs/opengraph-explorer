import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import model_router

# 환경 변수 로드w
load_dotenv()

app = FastAPI(
    title="HuggingFace 3.0 API",
    description="Sui 블록체인을 위한 AI 모델 파싱 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 오리진만 허용하도록 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 설정
app.include_router(model_router.router, prefix="/api/v1/models", tags=["models"])

# 기본 라우트
@app.get("/")
async def root():
    return {"message": "Welcome to HuggingFace 3.0 API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 