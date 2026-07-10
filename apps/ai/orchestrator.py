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
        
        products = []
        try:
            db_url = os.environ.get("DATABASE_URL")
            if db_url and "?" in db_url:
                db_url = db_url.split("?")[0]
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            # Load embedding model and encode intent
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer('all-MiniLM-L6-v2')
            intent_vector = model.encode(intent).tolist()
            intent_vector_str = '[' + ','.join(map(str, intent_vector)) + ']'
            
            if budget > 0:
                cursor.execute(
                    """
                    SELECT p.id, p.name, p."basePrice", i.url 
                    FROM "Product" p 
                    LEFT JOIN "ProductImage" i ON p.id = i."productId" AND i."isDefault" = true
                    WHERE p."basePrice" <= %s 
                    ORDER BY p.embedding <=> %s::vector
                    LIMIT 3
                    """,
                    (budget, intent_vector_str)
                )
            else:
                cursor.execute(
                    """
                    SELECT p.id, p.name, p."basePrice", i.url 
                    FROM "Product" p 
                    LEFT JOIN "ProductImage" i ON p.id = i."productId" AND i."isDefault" = true
                    ORDER BY p.embedding <=> %s::vector
                    LIMIT 3
                    """,
                    (intent_vector_str,)
                )
                
            rows = cursor.fetchall()
            for row in rows:
                products.append({
                    "id": row[0],
                    "name": row[1],
                    "price": float(row[2]),
                    "image": row[3] or "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                })
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Database error: {e}")
            
        product_names = [p["name"] for p in products] if products else ["No matching products found."]
        
        # Formulate an AI response to append to the conversation history
        assistant_reply = f"I found that you are looking for: {intent}. {reasoning}. I've lined up these products: {', '.join(product_names)}"
        
        return {
            "reasoning": reasoning,
            "recommended_product_ids": products,
            "messages": [AIMessage(content=assistant_reply)]
        }
        
    workflow.add_node("intent_analysis", analyze_intent)
    workflow.add_node("catalog_search", perform_search)
    
    workflow.add_edge(START, "intent_analysis")
    workflow.add_edge("intent_analysis", "catalog_search")
    workflow.add_edge("catalog_search", END)
    
    # Compile with memory checking
    return workflow.compile(checkpointer=memory)
