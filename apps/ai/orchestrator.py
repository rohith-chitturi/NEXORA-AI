from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage
from agents.shopping_agent import ShoppingAgentState, ShoppingAgent

def build_workflow():
    workflow = StateGraph(ShoppingAgentState)
    
    # Initialize our agent classes
    shopping_agent = ShoppingAgent()
    
    # Initialize memory saver
    memory = MemorySaver()
    
    # Define Nodes
    def analyze_intent(state: ShoppingAgentState):
        return shopping_agent.process(state)
        
    def perform_search(state: ShoppingAgentState):
        intent = state.get("extracted_intent", "Unknown")
        budget = state.get("budget", 0.0)
        
        reasoning = ""
        if budget > 0:
            reasoning = f"Searching catalog for {intent} under ${budget}"
        else:
            reasoning = f"Searching catalog for {intent}"
            
        # Mocking product IDs for now (Next phase: pgvector!)
        product_ids = ["prod_1", "prod_2", "prod_3"]
        
        # Formulate an AI response to append to the conversation history
        assistant_reply = f"I found that you are looking for: {intent}. {reasoning}. I've lined up these products: {', '.join(product_ids)}"
        
        return {
            "reasoning": reasoning,
            "recommended_product_ids": product_ids,
            "messages": [AIMessage(content=assistant_reply)]
        }
        
    workflow.add_node("intent_analysis", analyze_intent)
    workflow.add_node("catalog_search", perform_search)
    
    workflow.add_edge(START, "intent_analysis")
    workflow.add_edge("intent_analysis", "catalog_search")
    workflow.add_edge("catalog_search", END)
    
    # Compile with memory checking
    return workflow.compile(checkpointer=memory)
