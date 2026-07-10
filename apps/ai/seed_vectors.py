import os
import psycopg2
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load env variables to get DATABASE_URL
load_dotenv()

def main():
    print("Loading embedding model (all-MiniLM-L6-v2)...")
    # This generates 384-dimensional vectors
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Connecting to database...")
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    if "?" in db_url:
        db_url = db_url.split("?")[0]
        
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Ensure vector extension is enabled and column exists
    print("Setting up pgvector in database...")
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    # Check if embedding column exists, if not add it
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='Product' AND column_name='embedding';
    """)
    if not cursor.fetchone():
        print("Adding embedding column to Product table...")
        cursor.execute('ALTER TABLE "Product" ADD COLUMN embedding vector(384);')
        conn.commit()
    
    # Fetch all products
    print("Fetching products...")
    cursor.execute('SELECT id, name, description FROM "Product";')
    products = cursor.fetchall()
    
    if not products:
        print("No products found in the database.")
        return
        
    print(f"Found {len(products)} products. Generating embeddings...")
    for product in products:
        product_id = product[0]
        name = product[1]
        description = product[2]
        
        # We embed a combination of name and description for semantic richness
        text_to_embed = f"{name}. {description}"
        
        # Generate the vector
        embedding = model.encode(text_to_embed)
        # Convert to a string list format compatible with pgvector: '[0.1, 0.2, ...]'
        embedding_list = embedding.tolist()
        embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
        
        # Update the product with the new embedding
        cursor.execute(
            'UPDATE "Product" SET embedding = %s WHERE id = %s;',
            (embedding_str, product_id)
        )
        
    conn.commit()
    cursor.close()
    conn.close()
    print("Successfully seeded vector embeddings for all products!")

if __name__ == "__main__":
    main()
