#!/usr/bin/env python3
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv(Path(__file__).parent / 'backend' / '.env')

async def test_connection():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    print(f"🔌 Conectando ao MongoDB...")
    print(f"📦 Database: {db_name}")
    
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print("✅ Conexão estabelecida com sucesso!\n")
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"📚 Coleções encontradas ({len(collections)}):")
        for col in collections:
            print(f"   - {col}")
        
        print("\n📊 Contagem de documentos por coleção:")
        for col in collections:
            count = await db[col].count_documents({})
            print(f"   - {col}: {count} documentos")
        
        # Show sample data from key collections
        print("\n" + "="*60)
        print("🏪 DADOS EXISTENTES NA BASE DE DADOS")
        print("="*60)
        
        # Restaurants
        restaurants = await db.restaurants.find({}, {"_id": 0}).to_list(10)
        if restaurants:
            print(f"\n🍽️  RESTAURANTES ({len(restaurants)}):")
            for r in restaurants:
                print(f"   - {r.get('name')} (ID: {r.get('id')})")
                print(f"     Ativo: {r.get('active')}")
        
        # Users
        users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(10)
        if users:
            print(f"\n👥 UTILIZADORES ({len(users)}):")
            for u in users:
                print(f"   - {u.get('name')} ({u.get('email')})")
                print(f"     Role: {u.get('role')} | Restaurant: {u.get('restaurant_id')}")
        
        # Tables
        tables = await db.tables.find({}, {"_id": 0}).to_list(20)
        if tables:
            print(f"\n🪑 MESAS ({len(tables)}):")
            for t in tables:
                print(f"   - Mesa {t.get('table_number')} (ID: {t.get('id')})")
                print(f"     Restaurant: {t.get('restaurant_id')} | Capacidade: {t.get('capacity')} | Ativa: {t.get('active')}")
        
        # Categories
        categories = await db.categories.find({}, {"_id": 0}).to_list(20)
        if categories:
            print(f"\n📁 CATEGORIAS ({len(categories)}):")
            for c in categories:
                print(f"   - {c.get('name')} (ID: {c.get('id')})")
                print(f"     Restaurant: {c.get('restaurant_id')} | Ativa: {c.get('active')}")
        
        # Products
        products = await db.products.find({}, {"_id": 0}).to_list(30)
        if products:
            print(f"\n🍔 PRODUTOS ({len(products)}):")
            for p in products:
                print(f"   - {p.get('name')} - €{p.get('price')}")
                print(f"     Categoria: {p.get('category_id')} | Ativo: {p.get('active')}")
        
        # Orders (recent)
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
        if orders:
            print(f"\n🛒 PEDIDOS RECENTES ({len(orders)}):")
            for o in orders:
                print(f"   - Pedido {o.get('id')[:8]}... | Mesa: {o.get('table_number')}")
                print(f"     Total: €{o.get('total')} | Status: {o.get('status')} | Pagamento: {o.get('payment_status')}")
        
        # Subscriptions
        subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(10)
        if subscriptions:
            print(f"\n💳 SUBSCRIÇÕES ({len(subscriptions)}):")
            for s in subscriptions:
                print(f"   - User: {s.get('user_id')}")
                print(f"     Plano: {s.get('plan_id')} | Status: {s.get('status')} | Ciclo: {s.get('billing_cycle')}")
        
        # Contacts
        contacts = await db.contacts.find({}, {"_id": 0}).to_list(10)
        if contacts:
            print(f"\n📧 CONTACTOS ({len(contacts)}):")
            for c in contacts:
                print(f"   - {c.get('name')} ({c.get('email')})")
                print(f"     Status: {c.get('status')}")
        
        print("\n" + "="*60)
        print("✅ Dados carregados com sucesso!")
        print("="*60)
        
        client.close()
        
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_connection())
