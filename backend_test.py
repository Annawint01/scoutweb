import requests
import sys
import json
from datetime import datetime

class MetGalaAPITester:
    def __init__(self, base_url="https://emerging-gala-stage.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.app_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_application(self):
        """Test creating a new application"""
        test_data = {
            "brand_name": "Test Fashion House",
            "brand_email": "test@testfashion.com",
            "brand_address": "123 Fashion Ave, New York, NY 10001",
            "brand_website": "https://www.testfashion.com",
            "brand_category": "Haute Couture",
            "year_founded": "2020",
            "contact_person": "John Doe",
            "contact_phone": "+1 (212) 555-0100",
            "brand_description": "A luxury fashion house specializing in avant-garde designs.",
            "country": "United States"
        }
        
        success, response = self.run_test(
            "Create Application",
            "POST",
            "applications",
            200,
            data=test_data
        )
        
        if success and 'id' in response:
            self.app_id = response['id']
            print(f"   Created application with ID: {self.app_id}")
            print(f"   Assigned BTC address: {response.get('btc_address', 'N/A')}")
            return True
        return False

    def test_get_application(self):
        """Test retrieving an application by ID"""
        if not self.app_id:
            print("❌ Skipping - No application ID available")
            return False
            
        success, response = self.run_test(
            "Get Application",
            "GET",
            f"applications/{self.app_id}",
            200
        )
        return success

    def test_payment_status(self):
        """Test checking payment status"""
        if not self.app_id:
            print("❌ Skipping - No application ID available")
            return False
            
        success, response = self.run_test(
            "Check Payment Status",
            "GET",
            f"applications/{self.app_id}/payment-status",
            200
        )
        
        if success:
            print(f"   Payment Status: {response.get('status', 'N/A')}")
            print(f"   BTC Address: {response.get('btc_address', 'N/A')}")
            print(f"   Message: {response.get('message', 'N/A')}")
        
        return success

    def test_invalid_application_id(self):
        """Test with invalid application ID"""
        success, response = self.run_test(
            "Invalid Application ID",
            "GET",
            "applications/invalid-id-123",
            404
        )
        return success

    def test_invalid_payment_status(self):
        """Test payment status with invalid ID"""
        success, response = self.run_test(
            "Invalid Payment Status ID",
            "GET",
            "applications/invalid-id-123/payment-status",
            404
        )
        return success

    def test_create_application_missing_fields(self):
        """Test creating application with missing required fields"""
        incomplete_data = {
            "brand_name": "Incomplete Brand",
            # Missing required fields
        }
        
        success, response = self.run_test(
            "Create Application - Missing Fields",
            "POST",
            "applications",
            422,  # Validation error
            data=incomplete_data
        )
        return success

def main():
    print("🚀 Starting Met Gala Brand Scout API Tests")
    print("=" * 50)
    
    tester = MetGalaAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Create Application", tester.test_create_application),
        ("Get Application", tester.test_get_application),
        ("Payment Status", tester.test_payment_status),
        ("Invalid Application ID", tester.test_invalid_application_id),
        ("Invalid Payment Status", tester.test_invalid_payment_status),
        ("Missing Fields Validation", tester.test_create_application_missing_fields),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())