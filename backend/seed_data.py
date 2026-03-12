import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# Design guidelines images
IMAGES = {
    "burger": "https://images.unsplash.com/photo-1608767221051-2b9d18f35a2f?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    "pizza": "https://images.unsplash.com/photo-1751200884901-c1c6f43ae1d6?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    "sushi": "https://images.unsplash.com/photo-1763093226729-b412ad2f309d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    "salad": "https://images.unsplash.com/photo-1722032617357-7b09276b1a8d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    "drink": "https://images.unsplash.com/photo-1761361371739-546f12a9cee4?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
    "dessert": "https://images.unsplash.com/photo-1762631934519-291bf80c3f2a?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
}

async def seed_database():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("🌱 A iniciar seed da base de dados...")
    
    # Clear existing data
    collections = ['users', 'restaurants', 'tables', 'categories', 'products', 'orders', 'payment_transactions', 'call_waiter']
    for collection in collections:
        await db[collection].delete_many({})
    print("✅ Dados anteriores limpos")
    
    # Create restaurant
    restaurant_id = str(uuid.uuid4())
    restaurant = {
        "id": restaurant_id,
        "name": "Restaurante Demo",
        "description": "Um restaurante de demonstração",
        "address": "Rua Demo, 123",
        "phone": "+351 912 345 678",
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.restaurants.insert_one(restaurant)
    print(f"✅ Restaurante criado: {restaurant_id}")
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@demo.com",
        "password": pwd_context.hash("admin123"),
        "name": "Administrador",
        "role": "admin",
        "restaurant_id": restaurant_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin)
    print(f"✅ Admin criado: admin@demo.com / admin123")
    
    # Create tables
    tables = []
    for i in range(1, 11):
        table_id = str(uuid.uuid4())
        table = {
            "id": table_id,
            "restaurant_id": restaurant_id,
            "table_number": str(i),
            "capacity": 4,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        tables.append(table)
        await db.tables.insert_one(table)
    print(f"✅ {len(tables)} mesas criadas")
    
    # Create categories
    categories_data = [
        {"name": "Hambúrgueres", "image": "burger", "order": 1},
        {"name": "Pizzas", "image": "pizza", "order": 2},
        {"name": "Sushi", "image": "sushi", "order": 3},
        {"name": "Saladas", "image": "salad", "order": 4},
        {"name": "Bebidas", "image": "drink", "order": 5},
        {"name": "Sobremesas", "image": "dessert", "order": 6}
    ]
    
    categories = []
    for cat_data in categories_data:
        cat_id = str(uuid.uuid4())
        category = {
            "id": cat_id,
            "restaurant_id": restaurant_id,
            "name": cat_data["name"],
            "description": f"Deliciosos {cat_data['name'].lower()}",
            "image_url": IMAGES.get(cat_data["image"]),
            "display_order": cat_data["order"],
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        categories.append(category)
        await db.categories.insert_one(category)
    print(f"✅ {len(categories)} categorias criadas")
    
    # Create products
    products_data = [
        # Hambúrgueres
        {"cat": 0, "name": "Classic Burger", "desc": "Hambúrguer clássico com queijo, alface e tomate", "price": 8.50, "extras": [
            {"name": "Bacon Extra", "price": 1.50},
            {"name": "Queijo Extra", "price": 1.00}
        ]},
        {"cat": 0, "name": "Veggie Burger", "desc": "Hambúrguer vegetariano com grão e especiarias", "price": 7.90, "extras": []},
        
        # Pizzas
        {"cat": 1, "name": "Pizza Margherita", "desc": "Molho de tomate, mozzarella e manjericão", "price": 9.50, "extras": [
            {"name": "Extra Queijo", "price": 2.00}
        ]},
        {"cat": 1, "name": "Pizza Pepperoni", "desc": "Molho de tomate, mozzarella e pepperoni", "price": 11.00, "extras": []},
        
        # Sushi
        {"cat": 2, "name": "Sushi Mix (16 peças)", "desc": "Variedade de sushi e sashimi", "price": 18.00, "extras": []},
        {"cat": 2, "name": "California Roll", "desc": "Rolos de sushi com caranguejo e abacate", "price": 8.50, "extras": []},
        
        # Saladas
        {"cat": 3, "name": "Caesar Salad", "desc": "Alface, frango, croutons e molho caesar", "price": 7.50, "extras": []},
        {"cat": 3, "name": "Greek Salad", "desc": "Tomate, pepino, azeitonas e queijo feta", "price": 6.90, "extras": []},
        
        # Bebidas
        {"cat": 4, "name": "Coca-Cola", "desc": "330ml", "price": 2.50, "extras": []},
        {"cat": 4, "name": "Água", "desc": "500ml", "price": 1.50, "extras": []},
        {"cat": 4, "name": "Sumo Natural", "desc": "Laranja fresca", "price": 3.50, "extras": []},
        
        # Sobremesas
        {"cat": 5, "name": "Brownie de Chocolate", "desc": "Com gelado de baunilha", "price": 5.50, "extras": []},
        {"cat": 5, "name": "Cheesecake", "desc": "Cheesecake cremoso com frutos vermelhos", "price": 6.00, "extras": []}
    ]
    
    products = []
    for prod_data in products_data:
        prod_id = str(uuid.uuid4())
        
        # Convert extras
        extras = []
        for extra_data in prod_data["extras"]:
            extras.append({
                "id": str(uuid.uuid4()),
                "name": extra_data["name"],
                "price": extra_data["price"],
                "active": True
            })
        
        product = {
            "id": prod_id,
            "restaurant_id": restaurant_id,
            "category_id": categories[prod_data["cat"]]["id"],
            "name": prod_data["name"],
            "description": prod_data["desc"],
            "price": prod_data["price"],
            "image_url": categories[prod_data["cat"]]["image_url"],
            "extras": extras,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        products.append(product)
        await db.products.insert_one(product)
    print(f"✅ {len(products)} produtos criados")
    
    print("\n🎉 Seed concluído com sucesso!")
    print("\n📝 Credenciais de acesso:")
    print("   Email: admin@demo.com")
    print("   Password: admin123")
    print(f"\n🍽️  Restaurante ID: {restaurant_id}")
    print(f"📱 URL de teste (Mesa 1): /menu?restaurant_id={restaurant_id}&table_id={tables[0]['id']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
