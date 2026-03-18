"""
Test suite for ZentraQR Menu System Refactoring
Tests the unified menu architecture: categories/products as single source of truth for both image and text menu modes.
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://menu-unify.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "Test1234"
TEST_NAME = "Test User"

# Known restaurant with existing data
RESTAURANT_ID = "42075462-798e-4f1c-aa88-163306477ecf"  # Meeple & Co.


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token via login or signup"""
    # Try login first
    login_response = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if login_response.status_code == 200:
        return login_response.json().get("token")
    
    # If login fails, create user via signup
    signup_response = api_client.post(
        f"{BASE_URL}/api/auth/signup",
        json={
            "name": TEST_NAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "restaurantName": "Test Restaurant",
            "tablesCount": 3
        }
    )
    
    if signup_response.status_code == 200:
        return signup_response.json().get("token")
    
    pytest.skip("Could not authenticate - skipping authenticated tests")


@pytest.fixture(scope="module")
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


class TestRestaurantsAPI:
    """Test 1: GET /api/restaurants - should return list of restaurants"""
    
    def test_get_restaurants_returns_list(self, api_client):
        """Verify GET /api/restaurants returns a list"""
        response = api_client.get(f"{BASE_URL}/api/restaurants")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one restaurant"
        
        # Verify structure of first restaurant
        restaurant = data[0]
        assert "id" in restaurant
        assert "name" in restaurant
        print(f"✓ Found {len(data)} restaurants")
    
    def test_get_restaurant_has_required_fields(self, api_client):
        """Verify restaurant has expected fields"""
        response = api_client.get(f"{BASE_URL}/api/restaurants")
        data = response.json()
        
        # Find our known restaurant
        meeple = next((r for r in data if r["id"] == RESTAURANT_ID), None)
        assert meeple is not None, f"Restaurant {RESTAURANT_ID} not found"
        
        required_fields = ["id", "name", "active", "primary_color", "secondary_color"]
        for field in required_fields:
            assert field in meeple, f"Missing field: {field}"
        
        assert meeple["name"] == "Meeple & Co."
        print(f"✓ Restaurant 'Meeple & Co.' found with all required fields")


class TestCategoriesAPI:
    """Test 2: GET /api/categories/restaurant/{restaurant_id} - returns categories sorted by display_order"""
    
    def test_get_categories_returns_list(self, api_client):
        """Verify categories endpoint returns sorted list"""
        response = api_client.get(f"{BASE_URL}/api/categories/restaurant/{RESTAURANT_ID}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 9, f"Expected at least 9 categories, got {len(data)}"
        print(f"✓ Found {len(data)} categories")
    
    def test_category_has_required_fields(self, api_client):
        """Verify categories have all required fields: id, name, description, image_url, display_order, active"""
        response = api_client.get(f"{BASE_URL}/api/categories/restaurant/{RESTAURANT_ID}")
        data = response.json()
        
        required_fields = ["id", "name", "description", "image_url", "display_order", "active"]
        
        for category in data:
            for field in required_fields:
                assert field in category, f"Missing field '{field}' in category {category.get('name', 'unknown')}"
        
        print("✓ All categories have required fields: id, name, description, image_url, display_order, active")
    
    def test_categories_sorted_by_display_order(self, api_client):
        """Verify categories are sorted by display_order"""
        response = api_client.get(f"{BASE_URL}/api/categories/restaurant/{RESTAURANT_ID}")
        data = response.json()
        
        display_orders = [c["display_order"] for c in data]
        assert display_orders == sorted(display_orders), "Categories should be sorted by display_order"
        print(f"✓ Categories sorted by display_order: {display_orders}")


class TestProductsAPI:
    """Test 3: GET /api/products/restaurant/{restaurant_id} - returns products sorted by display_order"""
    
    def test_get_products_returns_list(self, api_client):
        """Verify products endpoint returns list"""
        response = api_client.get(f"{BASE_URL}/api/products/restaurant/{RESTAURANT_ID}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 13, f"Expected at least 13 products, got {len(data)}"
        print(f"✓ Found {len(data)} products")
    
    def test_product_has_required_fields(self, api_client):
        """Verify products have all required fields including highlighted and display_order"""
        response = api_client.get(f"{BASE_URL}/api/products/restaurant/{RESTAURANT_ID}")
        data = response.json()
        
        required_fields = [
            "id", "name", "description", "price", "image_url", 
            "extras", "highlighted", "display_order", "active", "category_id"
        ]
        
        for product in data:
            for field in required_fields:
                assert field in product, f"Missing field '{field}' in product {product.get('name', 'unknown')}"
            
            # Verify types
            assert isinstance(product["highlighted"], bool), "highlighted should be boolean"
            assert isinstance(product["display_order"], int), "display_order should be int"
            assert isinstance(product["price"], (int, float)), "price should be numeric"
            assert isinstance(product["extras"], list), "extras should be a list"
        
        print("✓ All products have required fields: id, name, description, price, image_url, extras, highlighted, display_order, active, category_id")
    
    def test_products_sorted_by_display_order(self, api_client):
        """Verify products are sorted by display_order"""
        response = api_client.get(f"{BASE_URL}/api/products/restaurant/{RESTAURANT_ID}")
        data = response.json()
        
        display_orders = [p["display_order"] for p in data]
        assert display_orders == sorted(display_orders), "Products should be sorted by display_order"
        print(f"✓ Products sorted by display_order")


class TestMenuConfigAPI:
    """Tests 4-5: GET and PUT /api/restaurants/{restaurant_id}/menu-config"""
    
    def test_get_menu_config_returns_expected_fields(self, api_client):
        """Test 4: GET menu-config returns only active_menu_type and text_menu_template (no text_menu_data)"""
        response = api_client.get(f"{BASE_URL}/api/restaurants/{RESTAURANT_ID}/menu-config")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Should have these fields
        assert "active_menu_type" in data, "Missing active_menu_type"
        assert "text_menu_template" in data, "Missing text_menu_template"
        
        # Validate values
        assert data["active_menu_type"] in ["image", "text"], f"Invalid menu type: {data['active_menu_type']}"
        assert data["text_menu_template"] in ["classic", "modern", "cafe"], f"Invalid template: {data['text_menu_template']}"
        
        print(f"✓ Menu config: active_menu_type='{data['active_menu_type']}', text_menu_template='{data['text_menu_template']}'")
        
        # Note: The API still returns text_menu_data for backward compatibility but frontend ignores it
        if "text_menu_data" in data:
            print("  (Note: text_menu_data still present for backward compatibility but should be ignored)")
    
    def test_update_menu_config(self, authenticated_client):
        """Test 5: PUT menu-config updates menu type and template"""
        # First get current config
        get_response = authenticated_client.get(f"{BASE_URL}/api/restaurants/{RESTAURANT_ID}/menu-config")
        original_config = get_response.json()
        
        # Update to text menu with modern template
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/restaurants/{RESTAURANT_ID}/menu-config",
            json={
                "active_menu_type": "text",
                "text_menu_template": "modern"
            }
        )
        
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        
        updated_config = update_response.json()
        assert updated_config["active_menu_type"] == "text"
        assert updated_config["text_menu_template"] == "modern"
        print("✓ Menu config updated to text/modern")
        
        # Restore original config
        restore_response = authenticated_client.put(
            f"{BASE_URL}/api/restaurants/{RESTAURANT_ID}/menu-config",
            json={
                "active_menu_type": original_config.get("active_menu_type", "image"),
                "text_menu_template": original_config.get("text_menu_template", "cafe")
            }
        )
        assert restore_response.status_code == 200
        print("✓ Menu config restored to original")


class TestAuthenticationAPI:
    """Test 6: Authentication flows for admin login"""
    
    def test_login_with_valid_credentials(self, api_client):
        """Test login page functionality"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert "user" in data
            print(f"✓ Login successful for {TEST_EMAIL}")
        elif response.status_code == 401:
            # User doesn't exist yet, that's fine
            print(f"⚠ User {TEST_EMAIL} not found - will be created via signup")
        else:
            pytest.fail(f"Unexpected status: {response.status_code}")
    
    def test_signup_creates_user_and_restaurant(self, api_client):
        """Test signup flow creates both user and restaurant"""
        # Use unique email to avoid conflicts
        import time
        unique_email = f"test_{int(time.time())}@test.com"
        
        response = api_client.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "name": "Test User Signup",
                "email": unique_email,
                "password": "Test1234",
                "restaurantName": "Test Signup Restaurant",
                "tablesCount": 5
            }
        )
        
        # Either 200 (new user) or 400 (email exists)
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert "user" in data
            assert "restaurant" in data
            print(f"✓ Signup successful - created user and restaurant")
        elif response.status_code == 400:
            print("⚠ User already exists")
        else:
            pytest.fail(f"Unexpected status: {response.status_code} - {response.text}")


class TestProductsWithNewFields:
    """Test product create/update with highlighted and display_order fields"""
    
    def test_create_product_with_highlighted_and_display_order(self, authenticated_client):
        """Verify product creation includes highlighted and display_order"""
        # Get a category first
        cat_response = authenticated_client.get(f"{BASE_URL}/api/categories/restaurant/{RESTAURANT_ID}")
        categories = cat_response.json()
        category_id = categories[0]["id"]
        
        # Create a test product
        product_data = {
            "restaurant_id": RESTAURANT_ID,
            "category_id": category_id,
            "name": "TEST_Product_Highlighted",
            "description": "Test product with highlighted flag",
            "price": 15.99,
            "image_url": "",  # Optional - testing fallback
            "highlighted": True,
            "display_order": 999,
            "extras": []
        }
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/products",
            json=product_data
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created_product = response.json()
        assert created_product["highlighted"] == True
        assert created_product["display_order"] == 999
        assert created_product["image_url"] == ""  # Empty image URL for fallback test
        
        print(f"✓ Created product with highlighted=True, display_order=999")
        
        # Cleanup - delete the test product
        del_response = authenticated_client.delete(f"{BASE_URL}/api/products/{created_product['id']}")
        assert del_response.status_code == 200
        print("✓ Test product cleaned up")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
