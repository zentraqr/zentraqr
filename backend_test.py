#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class RestaurantAPITester:
    def __init__(self, base_url="https://menuqr-12.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.restaurant_id = "4e5be1a0-9a05-4909-8d30-8a4ce714d599"
        self.table_id = "d07ca7e4-f1f6-4ab8-abcb-a22243ea63c1"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                if response.text:
                    try:
                        resp_data = response.json()
                        if isinstance(resp_data, list) and len(resp_data) > 0:
                            print(f"   Response: {len(resp_data)} items returned")
                        elif isinstance(resp_data, dict) and 'id' in resp_data:
                            print(f"   Response: ID {resp_data['id'][:8]}...")
                    except:
                        print(f"   Response: {response.text[:100]}...")
                return success, response.json() if response.text else {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@demo.com", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   🔑 Token obtained: {self.token[:20]}...")
            
            # Test get current user
            self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            return True
        
        return False

    def test_restaurants(self):
        """Test restaurant endpoints"""
        print("\n" + "="*50)
        print("TESTING RESTAURANTS")
        print("="*50)
        
        # Get all restaurants
        success, restaurants = self.run_test(
            "Get All Restaurants",
            "GET", 
            "restaurants",
            200
        )
        
        if success and restaurants:
            # Get specific restaurant
            self.run_test(
                "Get Specific Restaurant",
                "GET",
                f"restaurants/{self.restaurant_id}",
                200
            )
        
        return success

    def test_categories(self):
        """Test category endpoints"""
        print("\n" + "="*50)
        print("TESTING CATEGORIES")
        print("="*50)
        
        # Get categories for restaurant
        success, categories = self.run_test(
            "Get Restaurant Categories",
            "GET",
            f"categories/restaurant/{self.restaurant_id}",
            200
        )
        
        return success and len(categories) > 0

    def test_products(self):
        """Test product endpoints"""
        print("\n" + "="*50)
        print("TESTING PRODUCTS")
        print("="*50)
        
        # Get products for restaurant
        success, products = self.run_test(
            "Get Restaurant Products",
            "GET",
            f"products/restaurant/{self.restaurant_id}",
            200
        )
        
        if success and len(products) > 0:
            # Get products by category (use first category)
            categories_success, categories = self.run_test(
                "Get Categories for Product Test",
                "GET",
                f"categories/restaurant/{self.restaurant_id}",
                200
            )
            
            if categories_success and len(categories) > 0:
                first_category_id = categories[0]['id']
                self.run_test(
                    "Get Products by Category",
                    "GET",
                    f"products/category/{first_category_id}",
                    200
                )
        
        return success

    def test_tables(self):
        """Test table endpoints"""
        print("\n" + "="*50)
        print("TESTING TABLES")
        print("="*50)
        
        # Get tables for restaurant
        success, tables = self.run_test(
            "Get Restaurant Tables",
            "GET",
            f"tables/restaurant/{self.restaurant_id}",
            200
        )
        
        if success and len(tables) > 0:
            # Get QR code for table
            qr_success, _ = self.run_test(
                "Get Table QR Code",
                "GET",
                f"tables/{self.table_id}/qrcode",
                200
            )
        
        return success

    def test_orders(self):
        """Test order endpoints"""
        print("\n" + "="*50)
        print("TESTING ORDERS")
        print("="*50)
        
        # Create test order
        test_order = {
            "restaurant_id": self.restaurant_id,
            "table_id": self.table_id,
            "table_number": "0001",
            "items": [
                {
                    "product_id": "test-product-id",
                    "product_name": "Test Burger",
                    "quantity": 2,
                    "price": 12.50,
                    "extras": [],
                    "notes": "Test order"
                }
            ],
            "total": 25.00,
            "notes": "Test order from API test"
        }
        
        # Create order
        success, order = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=test_order
        )
        
        order_id = None
        if success and 'id' in order:
            order_id = order['id']
            
            # Get specific order
            self.run_test(
                "Get Specific Order",
                "GET",
                f"orders/{order_id}",
                200
            )
            
            # Update order status
            self.run_test(
                "Update Order Status",
                "PUT",
                f"orders/{order_id}/status",
                200,
                data={"status": "preparing"}
            )
        
        # Get restaurant orders (requires auth)
        if self.token:
            self.run_test(
                "Get Restaurant Orders",
                "GET",
                f"orders/restaurant/{self.restaurant_id}",
                200
            )
        
        return success, order_id

    def test_payments(self):
        """Test payment endpoints"""
        print("\n" + "="*50)
        print("TESTING PAYMENTS")
        print("="*50)
        
        # Create order first for payment testing
        success, order_id = self.test_orders()
        
        if success and order_id:
            # Test create checkout session
            checkout_success, checkout = self.run_test(
                "Create Checkout Session",
                "POST",
                "payments/create-checkout",
                200,
                data={
                    "order_id": order_id,
                    "origin_url": self.base_url
                }
            )
            
            if checkout_success and 'session_id' in checkout:
                session_id = checkout['session_id']
                
                # Test get checkout status
                self.run_test(
                    "Get Checkout Status",
                    "GET",
                    f"payments/checkout-status/{session_id}",
                    200
                )
        
        return success

    def test_statistics(self):
        """Test statistics endpoints"""
        print("\n" + "="*50)
        print("TESTING STATISTICS")
        print("="*50)
        
        if not self.token:
            print("⚠️  No auth token - skipping stats test")
            return False
            
        # Get restaurant statistics
        success, stats = self.run_test(
            "Get Restaurant Statistics",
            "GET",
            f"stats/restaurant/{self.restaurant_id}",
            200
        )
        
        if success:
            print(f"   📊 Stats: Orders: {stats.get('total_orders_today', 0)}, Revenue: €{stats.get('revenue_today', 0)}")
        
        return success

    def test_call_waiter(self):
        """Test call waiter endpoints"""
        print("\n" + "="*50)
        print("TESTING CALL WAITER")
        print("="*50)
        
        # Call waiter
        success, call = self.run_test(
            "Call Waiter",
            "POST",
            "call-waiter",
            200,
            data={
                "restaurant_id": self.restaurant_id,
                "table_id": self.table_id,
                "table_number": "0001"
            }
        )
        
        if self.token:
            # Get waiter calls (requires auth)
            calls_success, calls = self.run_test(
                "Get Waiter Calls",
                "GET",
                f"call-waiter/restaurant/{self.restaurant_id}",
                200
            )
            
            if calls_success and len(calls) > 0:
                call_id = calls[0]['id']
                # Resolve call
                self.run_test(
                    "Resolve Waiter Call",
                    "PUT",
                    f"call-waiter/{call_id}/resolve",
                    200
                )
        
        return success

def main():
    print("🍽️  Restaurant QR Menu API Testing")
    print("="*50)
    
    tester = RestaurantAPITester()
    
    # Run all tests
    auth_success = tester.test_authentication()
    
    if not auth_success:
        print("\n❌ Authentication failed - stopping critical tests")
        
    # Test public endpoints
    restaurants_success = tester.test_restaurants()
    categories_success = tester.test_categories()
    products_success = tester.test_products()
    tables_success = tester.test_tables()
    orders_success = tester.test_orders()[0]  # Just get success status
    
    # Test protected endpoints
    stats_success = False
    calls_success = False
    payments_success = False
    
    if auth_success:
        stats_success = tester.test_statistics()
        calls_success = tester.test_call_waiter()
        payments_success = tester.test_payments()
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"📊 Total tests: {tester.tests_run}")
    print(f"✅ Passed: {tester.tests_passed}")
    print(f"❌ Failed: {tester.tests_run - tester.tests_passed}")
    print(f"📈 Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    print("\n📋 Component Status:")
    print(f"   🔐 Authentication: {'✅' if auth_success else '❌'}")
    print(f"   🏪 Restaurants: {'✅' if restaurants_success else '❌'}")
    print(f"   📁 Categories: {'✅' if categories_success else '❌'}")
    print(f"   🍔 Products: {'✅' if products_success else '❌'}")
    print(f"   🪑 Tables: {'✅' if tables_success else '❌'}")
    print(f"   📦 Orders: {'✅' if orders_success else '❌'}")
    print(f"   💳 Payments: {'✅' if payments_success else '❌'}")
    print(f"   📊 Statistics: {'✅' if stats_success else '❌'}")
    print(f"   🔔 Call Waiter: {'✅' if calls_success else '❌'}")
    
    critical_failures = []
    if not auth_success:
        critical_failures.append("Authentication system not working")
    if not restaurants_success:
        critical_failures.append("Restaurant data not accessible")
    if not categories_success:
        critical_failures.append("Categories not loading")
    if not products_success:
        critical_failures.append("Products not loading")
    if not orders_success:
        critical_failures.append("Order creation failing")
    
    if critical_failures:
        print(f"\n🚨 CRITICAL ISSUES:")
        for issue in critical_failures:
            print(f"   • {issue}")
        return 1
    else:
        print(f"\n🎉 All critical systems operational!")
        return 0 if tester.tests_passed >= tester.tests_run * 0.8 else 1

if __name__ == "__main__":
    sys.exit(main())