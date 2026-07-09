from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from orchestrator import build_workflow
from agents.shopping_agent import ShoppingAgentState

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

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "nexora-ai-engine"}

@app.post("/api/v1/chat")
def chat_with_agent(query: str):
    # Initialize state
    initial_state = ShoppingAgentState(user_query=query)
    
    # Run the graph
    result = workflow_app.invoke(initial_state)
    
    return {
        "intent": result["extracted_intent"],
        "budget": result["budget"],
        "reasoning": result["reasoning"],
        "products": result["recommended_product_ids"]
    }
