from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from orchestrator import build_workflow

load_dotenv()

app = FastAPI(title="NEXORA AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compile the graph once on startup
workflow_app = build_workflow()

class ChatRequest(BaseModel):
    query: str
    user_id: str

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "nexora-ai-engine"}

@app.post("/api/v1/chat")
def chat_with_agent(request: ChatRequest):
    # Pass user_id as the thread_id for LangGraph MemorySaver
    config = {"configurable": {"thread_id": request.user_id}}
    
    # Send the new HumanMessage to the state
    # LangGraph will automatically append this to the history via the Annotated reducer
    result = workflow_app.invoke({"messages": [HumanMessage(content=request.query)]}, config=config)
    
    return {
        "intent": result.get("extracted_intent"),
        "budget": result.get("budget"),
        "reasoning": result.get("reasoning"),
        "products": result.get("recommended_product_ids")
    }
