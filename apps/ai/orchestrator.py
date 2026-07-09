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
            
        # Connect to Postgres
        import os
        import psycopg2
        
        product_names = []
        try:
            conn = psycopg2.connect(os.environ.get("DATABASE_URL"))
            cursor = conn.cursor()
            
            # Simple text search for intent in tags or description
            # In a production environment, this would use pgvector
            search_term = f"%{intent.split()[0]}%" if intent != "Unknown" else "%"
            
            if budget > 0:
                cursor.execute(
                    "SELECT name FROM \"Product\" WHERE (name ILIKE %s OR description ILIKE %s) AND \"basePrice\" <= %s LIMIT 3",
                    (search_term, search_term, budget)
                )
            else:
                cursor.execute(
                    "SELECT name FROM \"Product\" WHERE name ILIKE %s OR description ILIKE %s LIMIT 3",
                    (search_term, search_term)
                )
                
            rows = cursor.fetchall()
            product_names = [row[0] for row in rows]
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Database error: {e}")
            product_names = ["Error fetching products"]
            
        if not product_names:
            product_names = ["No matching products found in our catalog."]
        
        # Formulate an AI response to append to the conversation history
        assistant_reply = f"I found that you are looking for: {intent}. {reasoning}. I've lined up these products: {', '.join(product_names)}"
        
        return {
            "reasoning": reasoning,
            "recommended_product_ids": product_names,
            "messages": [AIMessage(content=assistant_reply)]
        }
        
    workflow.add_node("intent_analysis", analyze_intent)
    workflow.add_node("catalog_search", perform_search)
    
    workflow.add_edge(START, "intent_analysis")
    workflow.add_edge("intent_analysis", "catalog_search")
    workflow.add_edge("catalog_search", END)
    
    # Compile with memory checking
    return workflow.compile(checkpointer=memory)
