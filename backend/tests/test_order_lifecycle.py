"""
Test order lifecycle features:
- Cancel order endpoint (PUT /api/orders/{order_id}/cancel)
- Cleanup old orders endpoint (DELETE /api/orders/cleanup-old)
- Order status filtering (active vs history)
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Get base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://order-lifecycle-12.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "admin@demo.com"
TEST_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for admin user"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    return data["token"], data["user"]["restaurant_id"]


@pytest.fixture(scope="module")
def api_session(auth_token):
    """Create authenticated session"""
    token, restaurant_id = auth_token
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    })
    return session, restaurant_id


class TestOrderCancel:
    """Tests for order cancellation feature"""
    
    def test_create_order_for_cancel_test(self, api_session):
        """Create a test order to cancel later"""
        session, restaurant_id = api_session
        
        # Get a table first
        tables_response = session.get(f"{BASE_URL}/api/tables/restaurant/{restaurant_id}")
        assert tables_response.status_code == 200
        tables = tables_response.json()
        assert len(tables) > 0, "No tables found"
        table = tables[0]
        
        # Create an order
        order_data = {
            "restaurant_id": restaurant_id,
            "table_id": table["id"],
            "table_number": table["table_number"],
            "items": [
                {
                    "product_id": "TEST_PROD_1",
                    "product_name": "TEST_CANCEL_ITEM",
                    "quantity": 1,
                    "price": 10.00,
                    "extras": []
                }
            ],
            "total": 10.00,
            "notes": "Test order for cancel testing"
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200, f"Order creation failed: {response.text}"
        
        order = response.json()
        assert order["status"] == "received"
        assert order["id"] is not None
        
        # Store order ID for next tests
        TestOrderCancel.test_order_id = order["id"]
        TestOrderCancel.restaurant_id = restaurant_id
        print(f"Created test order: {order['id']}")
        return order
    
    def test_cancel_order_success(self, api_session):
        """Test canceling an active order"""
        session, _ = api_session
        order_id = TestOrderCancel.test_order_id
        
        # Cancel the order
        response = session.put(f"{BASE_URL}/api/orders/{order_id}/cancel")
        assert response.status_code == 200, f"Cancel failed: {response.text}"
        
        data = response.json()
        assert data["status"] == "canceled"
        assert "Pedido cancelado" in data["message"]
        print(f"Successfully canceled order: {order_id}")
    
    def test_verify_canceled_order_status(self, api_session):
        """Verify the order shows as canceled after cancellation"""
        session, _ = api_session
        order_id = TestOrderCancel.test_order_id
        
        # Get the order and verify status
        response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert response.status_code == 200
        
        order = response.json()
        assert order["status"] == "canceled", f"Order status should be 'canceled', got: {order['status']}"
        print(f"Order {order_id} correctly shows status: {order['status']}")
    
    def test_cannot_cancel_already_canceled_order(self, api_session):
        """Test that canceling an already canceled order fails"""
        session, _ = api_session
        order_id = TestOrderCancel.test_order_id
        
        # Try to cancel again
        response = session.put(f"{BASE_URL}/api/orders/{order_id}/cancel")
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        
        data = response.json()
        assert "já foi finalizado ou cancelado" in data["detail"]
        print(f"Correctly rejected double cancellation")
    
    def test_cancel_nonexistent_order(self, api_session):
        """Test canceling a non-existent order returns 404"""
        session, _ = api_session
        
        response = session.put(f"{BASE_URL}/api/orders/nonexistent-order-id/cancel")
        assert response.status_code == 404
        print("Correctly returned 404 for non-existent order")
    
    def test_canceled_order_in_history(self, api_session):
        """Verify canceled orders appear in history (delivered + canceled)"""
        session, restaurant_id = api_session
        
        # Get all orders
        response = session.get(f"{BASE_URL}/api/orders/restaurant/{restaurant_id}")
        assert response.status_code == 200
        
        orders = response.json()
        
        # Find canceled orders
        canceled_orders = [o for o in orders if o["status"] == "canceled"]
        assert len(canceled_orders) > 0, "Should have at least one canceled order"
        
        # Verify our test order is in the canceled list
        our_order = next((o for o in canceled_orders if o["id"] == TestOrderCancel.test_order_id), None)
        assert our_order is not None, "Our test order should be in canceled orders"
        print(f"Found {len(canceled_orders)} canceled orders in history")


class TestCleanupOldOrders:
    """Tests for automatic cleanup of old orders"""
    
    def test_cleanup_endpoint_exists(self, api_session):
        """Test that cleanup endpoint is accessible"""
        session, _ = api_session
        
        response = session.delete(f"{BASE_URL}/api/orders/cleanup-old")
        assert response.status_code == 200, f"Cleanup endpoint failed: {response.text}"
        
        data = response.json()
        assert "pedidos antigos removidos" in data["message"]
        print(f"Cleanup response: {data['message']}")
    
    def test_cleanup_requires_auth(self):
        """Test that cleanup endpoint requires authentication"""
        # Try without auth
        response = requests.delete(f"{BASE_URL}/api/orders/cleanup-old")
        assert response.status_code == 401
        print("Cleanup correctly requires authentication")


class TestOrderStatusFiltering:
    """Tests for order status filtering (active vs history)"""
    
    def test_get_orders_returns_all_statuses(self, api_session):
        """Verify orders endpoint returns orders with all statuses"""
        session, restaurant_id = api_session
        
        response = session.get(f"{BASE_URL}/api/orders/restaurant/{restaurant_id}")
        assert response.status_code == 200
        
        orders = response.json()
        statuses = set(o["status"] for o in orders)
        
        print(f"Order statuses found: {statuses}")
        print(f"Total orders: {len(orders)}")
        
        # Verify active orders (received, preparing, ready)
        active_orders = [o for o in orders if o["status"] in ["received", "preparing", "ready"]]
        print(f"Active orders: {len(active_orders)}")
        
        # Verify history orders (delivered, canceled)
        history_orders = [o for o in orders if o["status"] in ["delivered", "canceled"]]
        print(f"History orders: {len(history_orders)}")
        
        return orders


class TestCancelOrderAuth:
    """Test cancel order authentication requirements"""
    
    def test_cancel_requires_auth(self, api_session):
        """Test that cancel endpoint requires authentication"""
        session, restaurant_id = api_session
        
        # Create a fresh order
        tables_response = session.get(f"{BASE_URL}/api/tables/restaurant/{restaurant_id}")
        tables = tables_response.json()
        table = tables[0]
        
        order_data = {
            "restaurant_id": restaurant_id,
            "table_id": table["id"],
            "table_number": table["table_number"],
            "items": [
                {
                    "product_id": "TEST_PROD_2",
                    "product_name": "TEST_AUTH_ITEM",
                    "quantity": 1,
                    "price": 5.00,
                    "extras": []
                }
            ],
            "total": 5.00
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        order_id = response.json()["id"]
        
        # Try to cancel without auth
        response = requests.put(f"{BASE_URL}/api/orders/{order_id}/cancel")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Cancel correctly requires authentication")
        
        # Clean up - cancel with auth
        session.put(f"{BASE_URL}/api/orders/{order_id}/cancel")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
