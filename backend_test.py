#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime

class BackofficeAuthTester:
    def __init__(self, base_url="https://qr-stripe-pay.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()  # Use session for cookie handling
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {json.dumps(response_data, indent=2)}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                except:
                    print(f"   Response: Non-JSON or large response")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")

            return success, response.json() if response.content and response.status_code < 400 else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_backoffice_login_wrong_password(self):
        """Test backoffice login with wrong password"""
        success, response = self.run_test(
            "Backoffice Login (Wrong Password)",
            "POST",
            "backoffice/auth/login",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_backoffice_login_correct_password(self):
        """Test backoffice login with correct password"""
        success, response = self.run_test(
            "Backoffice Login (Correct Password)",
            "POST",
            "backoffice/auth/login",
            200,
            data={"password": "zentra2024admin"}
        )
        if success:
            print(f"   Successfully authenticated to backoffice")
            return True
        return False

    def test_backoffice_auth_me(self):
        """Test GET /api/backoffice/auth/me - should return authenticated status"""
        success, response = self.run_test(
            "Backoffice Auth Status",
            "GET",
            "backoffice/auth/me",
            200
        )
        if success and response.get('authenticated'):
            print(f"   Authentication status: {response.get('authenticated')}")
            return True
        elif success:
            print(f"   ❌ Expected authenticated=true, got: {response}")
            return False
        return False

    def test_backoffice_protected_routes(self):
        """Test protected backoffice routes"""
        routes_to_test = [
            ("Backoffice Pricing", "backoffice/pricing", 200),
            ("Backoffice Restaurants", "backoffice/restaurants", 200)
        ]
        
        all_success = True
        for name, endpoint, expected_status in routes_to_test:
            success, response = self.run_test(name, "GET", endpoint, expected_status)
            if not success:
                all_success = False
        
        return all_success

    def test_backoffice_logout(self):
        """Test backoffice logout"""
        success, response = self.run_test(
            "Backoffice Logout",
            "POST",
            "backoffice/auth/logout",
            200
        )
        return success

    def test_auth_required_after_logout(self):
        """Test that protected routes require auth after logout"""
        success, response = self.run_test(
            "Protected Route After Logout (Should Fail)",
            "GET",
            "backoffice/pricing",
            401
        )
        return success

def main():
    # Setup
    tester = BackofficeAuthTester("https://qr-stripe-pay.preview.emergentagent.com")
    
    print("🚀 Starting Backoffice Authentication Testing")
    print("=" * 50)
    
    # Test 1: Try to access protected route without authentication (should fail)
    print("\n🔒 Testing Unauthenticated Access")
    print("-" * 40)
    success, response = tester.run_test(
        "Protected Route (No Auth - Should Fail)",
        "GET",
        "backoffice/pricing",
        401
    )
    if success:
        print("✅ Correctly blocked unauthenticated access")

    # Test 2: Try login with wrong password (should fail)
    print("\n❌ Testing Wrong Password")
    print("-" * 30)
    if tester.test_backoffice_login_wrong_password():
        print("✅ Correctly rejected wrong password")

    # Test 3: Login with correct password (should succeed)
    print("\n🔑 Testing Correct Password")
    print("-" * 30)
    if not tester.test_backoffice_login_correct_password():
        print("❌ Login failed with correct password, stopping tests")
        return 1

    # Test 4: Check authentication status
    print("\n👤 Testing Authentication Status")
    print("-" * 35)
    if not tester.test_backoffice_auth_me():
        print("❌ Authentication status check failed")
        return 1

    # Test 5: Test protected routes (should work now)
    print("\n🛡️  Testing Protected Routes")
    print("-" * 30)
    if not tester.test_backoffice_protected_routes():
        print("❌ Some protected routes failed")

    # Test 6: Test logout
    print("\n🚪 Testing Logout")
    print("-" * 20)
    if not tester.test_backoffice_logout():
        print("❌ Logout failed")

    # Test 7: Verify routes are protected after logout
    print("\n🔒 Testing Auth Required After Logout")
    print("-" * 40)
    if tester.test_auth_required_after_logout():
        print("✅ Protected routes correctly require auth after logout")

    # Print final results
    print("\n" + "=" * 50)
    print("📊 TESTING SUMMARY")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed! Backoffice authentication is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} test(s) failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())