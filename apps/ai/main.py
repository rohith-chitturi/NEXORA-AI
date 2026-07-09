from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NEXORA AI Engine", version="1.0.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "nexora-ai-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
