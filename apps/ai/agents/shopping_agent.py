import os
import json
import operator
from typing import TypedDict, Annotated, List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage

class ShoppingAgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    extracted_intent: str
    budget: float
    recommended_product_ids: List[str]
    reasoning: str

class ShoppingAgent:
    def __init__(self):
        # We will use OpenAI / GPT-4o for complex reasoning
        self.llm = ChatOpenAI(temperature=0.7, model="gpt-4o")

    def process(self, state: ShoppingAgentState) -> dict:
        # Extract the latest user message
        latest_message = state["messages"][-1].content
        
        prompt = f"""
        You are NEXORA AI, a premium, intelligent shopping assistant.
        The user just said: "{latest_message}"
        
        Analyze the request along with the conversation history. Extract:
        1. The intent (e.g. "Looking for ergonomic chair")
        2. The budget (if any, default to 0.0)
        
        Respond in JSON format: {{"intent": "...", "budget": 0.0}}
        """
        
        # Prepare messages for LLM (System + History + New Prompt)
        llm_messages = [SystemMessage(content="You are an autonomous AI shopping agent.")]
        
        # Add history (excluding the very last user message since we wrapped it in our prompt)
        if len(state["messages"]) > 1:
            llm_messages.extend(state["messages"][:-1])
            
        llm_messages.append(HumanMessage(content=prompt))
        
        response = self.llm.invoke(llm_messages)
        
        extracted_intent = "Unknown"
        budget = 0.0
        
        try:
            data = json.loads(response.content.replace('```json', '').replace('```', ''))
            extracted_intent = data.get("intent", "Unknown")
            budget = float(data.get("budget", 0.0))
        except:
            extracted_intent = "Failed to parse intent"
            
        # We return a dict that will be merged into the state
        return {
            "extracted_intent": extracted_intent,
            "budget": budget
        }
