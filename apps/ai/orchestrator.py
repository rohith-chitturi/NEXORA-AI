from langgraph.graph import StateGraph, START, END
from agents.shopping_agent import ShoppingAgentState, ShoppingAgent

def build_workflow():
    workflow = StateGraph(ShoppingAgentState)
    
    # Initialize our agent classes
    shopping_agent = ShoppingAgent()
    
    # Define Nodes
    def analyze_intent(state: ShoppingAgentState):
        return shopping_agent.process(state)
        
    def perform_search(state: ShoppingAgentState):
        # In the future, this node will query Postgres/pgvector or Elasticsearch
        # using the state.extracted_intent and state.budget
        if state.budget > 0:
            state.reasoning = f"Searching catalog for {state.extracted_intent} under ${state.budget}"
        else:
            state.reasoning = f"Searching catalog for {state.extracted_intent}"
            
        # Mocking product IDs for now
        state.recommended_product_ids = ["prod_1", "prod_2", "prod_3"]
        return state
        
    workflow.add_node("intent_analysis", analyze_intent)
    workflow.add_node("catalog_search", perform_search)
    
    workflow.add_edge(START, "intent_analysis")
    workflow.add_edge("intent_analysis", "catalog_search")
    workflow.add_edge("catalog_search", END)
    
    return workflow.compile()
