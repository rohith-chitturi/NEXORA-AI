import os
import json
from pydantic import BaseModel
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

class ShoppingAgentState(BaseModel):
    user_query: str
    extracted_intent: str = ""
    budget: float = 0.0
    recommended_product_ids: List[str] = []
    reasoning: str = ""

class ShoppingAgent:
    def __init__(self):
        # We will use Gemini / OpenAI depending on env
        self.llm = ChatOpenAI(temperature=0.7, model="gpt-4o")

    def process(self, state: ShoppingAgentState) -> ShoppingAgentState:
        prompt = f"""
        You are NEXORA AI, a premium, intelligent shopping assistant.
        The user said: "{state.user_query}"
        
        Analyze the request and extract:
        1. The intent (e.g. "Looking for ergonomic chair")
        2. The budget (if any)
        
        Respond in JSON format: {{"intent": "...", "budget": 0.0}}
        """
        
        messages = [
            SystemMessage(content="You are an autonomous AI shopping agent."),
            HumanMessage(content=prompt)
        ]
        
        response = self.llm.invoke(messages)
        try:
            data = json.loads(response.content.replace('```json', '').replace('```', ''))
            state.extracted_intent = data.get("intent", "Unknown")
            state.budget = data.get("budget", 0.0)
        except:
            state.extracted_intent = "Failed to parse intent"
            
        return state
