#!/usr/bin/env python3
"""
Turnkey Sub-Organization Deletion Script

This script deletes a sub-organization in Turnkey using the official Python SDK.
All sensitive credentials are requested via console input for security.

Usage: pip install turnkey-sdk && python delete_suborganization.py
"""

import json
import time
import getpass
import os
from typing import Dict, Any, Optional

try:
    from turnkey import TurnkeyClient
    from turnkey.models import DeleteSubOrganizationRequest
    TURNKEY_SDK_AVAILABLE = True
except ImportError:
    print("⚠️  Turnkey SDK not found. Install with: pip install turnkey-sdk")
    print("Falling back to manual API implementation...")
    import hashlib
    import hmac
    import base64
    import requests
    TURNKEY_SDK_AVAILABLE = False

try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False


def load_env_config() -> Dict[str, Optional[str]]:
    """Load configuration from .env file if available."""
    config = {}
    
    if DOTENV_AVAILABLE:
        # Try to load from .env.local first, then .env
        for env_file in ['.env.local', '.env']:
            if os.path.exists(env_file):
                load_dotenv(env_file)
                print(f"📁 Loaded configuration from {env_file}")
                break
    
    # Load values from environment variables
    config['organization_id'] = os.getenv('TURNKEY_ORGANIZATION_ID')
    config['api_key_name'] = os.getenv('TURNKEY_API_KEY_NAME')
    config['api_base_url'] = os.getenv('TURNKEY_API_BASE_URL', 'https://api.turnkey.com')
    config['delete_without_export'] = os.getenv('DELETE_WITHOUT_EXPORT', 'false').lower() == 'true'
    
    return config


def get_user_input() -> Dict[str, str]:
    """Collect required credentials and parameters from user input."""
    print("Turnkey Sub-Organization Deletion")
    print("=" * 40)
    
    # Load configuration from .env if available
    env_config = load_env_config()
    
    # Organization ID
    org_id_default = env_config.get('organization_id', '')
    if org_id_default:
        organization_id = input(f"Enter your Organization ID [{org_id_default}]: ").strip() or org_id_default
    else:
        organization_id = input("Enter your Organization ID: ").strip()
    
    # API Key Name
    key_name_default = env_config.get('api_key_name', '')
    if key_name_default:
        api_key_name = input(f"Enter your API Key Name [{key_name_default}]: ").strip() or key_name_default
    else:
        api_key_name = input("Enter your API Key Name: ").strip()
    
    # API Private Key (always prompt for security)
    api_private_key = getpass.getpass("Enter your API Private Key: ").strip()
    
    # Deletion options
    print("\nDeletion Options:")
    print("- With export (default): Exports wallets and private keys before deletion")
    print("- Without export: Deletes immediately without backup")
    
    env_delete_without_export = env_config.get('delete_without_export', False)
    if env_delete_without_export:
        print("⚠️  .env file is configured to delete WITHOUT export!")
        delete_without_export = input("Delete without export? (Y/n): ").strip().lower() != 'n'
    else:
        delete_without_export = input("Delete without export? (y/N): ").strip().lower() == 'y'
    
    return {
        'organization_id': organization_id,
        'api_key_name': api_key_name,
        'api_private_key': api_private_key,
        'api_base_url': env_config.get('api_base_url', 'https://api.turnkey.com'),
        'delete_without_export': delete_without_export
    }


def create_stamp(payload: str, api_private_key: str) -> str:
    """Create the X-Stamp header for Turnkey API authentication."""
    try:
        # Clean the private key - remove whitespace and common prefixes
        clean_key = api_private_key.strip()
        
        # Remove '0x' prefix if present
        if clean_key.startswith('0x'):
            clean_key = clean_key[2:]
        
        # Try to decode as hex first
        try:
            private_key_bytes = bytes.fromhex(clean_key)
        except ValueError:
            # If hex decoding fails, try base64
            try:
                private_key_bytes = base64.b64decode(clean_key)
            except Exception:
                # If both fail, treat as raw bytes
                private_key_bytes = clean_key.encode('utf-8')
        
        # Create HMAC-SHA256 signature
        signature = hmac.new(
            private_key_bytes,
            payload.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Return base64 encoded signature
        return base64.b64encode(signature).decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Failed to create authentication stamp: {str(e)}")


def create_request_payload(organization_id: str, delete_without_export: bool) -> Dict[str, Any]:
    """Create the request payload for the delete sub-organization API call."""
    timestamp_ms = str(int(time.time() * 1000))
    
    return {
        "type": "ACTIVITY_TYPE_DELETE_SUB_ORGANIZATION",
        "timestampMs": timestamp_ms,
        "organizationId": organization_id,
        "parameters": {
            "deleteWithoutExport": delete_without_export
        }
    }


def delete_suborganization_sdk(credentials: Dict[str, str]) -> bool:
    """Delete the sub-organization using Turnkey SDK."""
    try:
        # Initialize Turnkey client
        client = TurnkeyClient(
            api_key_name=credentials['api_key_name'],
            private_key=credentials['api_private_key'],
            base_url=credentials.get('api_base_url', 'https://api.turnkey.com')
        )
        
        # Create delete request
        request = DeleteSubOrganizationRequest(
            organization_id=credentials['organization_id'],
            delete_without_export=credentials['delete_without_export']
        )
        
        print(f"\nSending delete request for organization: {credentials['organization_id']}")
        print(f"Delete without export: {credentials['delete_without_export']}")
        
        # Submit the deletion request
        response = client.delete_sub_organization(request)
        
        print("✅ Sub-organization deletion request submitted successfully!")
        print(f"Activity ID: {response.activity_id}")
        print(f"Activity Status: {response.status}")
        
        return True
        
    except Exception as e:
        print(f"❌ SDK error: {str(e)}")
        return False


def delete_suborganization_manual(credentials: Dict[str, str]) -> bool:
    """Delete the sub-organization using manual API calls (fallback)."""
    
    # Create request payload
    payload = create_request_payload(
        credentials['organization_id'],
        credentials['delete_without_export']
    )
    
    # Convert payload to JSON string
    payload_json = json.dumps(payload, separators=(',', ':'))
    
    try:
        # Create authentication stamp
        stamp = create_stamp(payload_json, credentials['api_private_key'])
    except ValueError as e:
        print(f"❌ Authentication error: {str(e)}")
        print("💡 Tip: Ensure your API private key is in hex format (64 characters)")
        return False
    
    # Prepare headers
    headers = {
        'Content-Type': 'application/json',
        'X-Stamp': stamp,
        'X-API-Key-Name': credentials['api_key_name']
    }
    
    # API endpoint
    base_url = credentials.get('api_base_url', 'https://api.turnkey.com')
    url = f'{base_url}/public/v1/submit/delete_sub_organization'
    
    try:
        print(f"\nSending delete request for organization: {credentials['organization_id']}")
        print(f"Delete without export: {credentials['delete_without_export']}")
        
        # Make the API request
        response = requests.post(url, headers=headers, data=payload_json)
        
        if response.status_code == 200:
            print("✅ Sub-organization deletion request submitted successfully!")
            
            # Parse response
            result = response.json()
            
            if 'activity' in result:
                activity_id = result['activity'].get('id', 'N/A')
                activity_status = result['activity'].get('status', 'N/A')
                print(f"Activity ID: {activity_id}")
                print(f"Activity Status: {activity_status}")
            
            print("\nResponse:", json.dumps(result, indent=2))
            return True
            
        else:
            print(f"❌ API request failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False


def delete_suborganization(credentials: Dict[str, str]) -> bool:
    """Delete the sub-organization using the best available method."""
    if TURNKEY_SDK_AVAILABLE:
        print("Using Turnkey SDK for authentication...")
        return delete_suborganization_sdk(credentials)
    else:
        print("Using manual API authentication...")
        return delete_suborganization_manual(credentials)


def main():
    """Main function to execute the deletion process."""
    try:
        # Get user input
        credentials = get_user_input()
        
        # Confirm deletion
        print("\n" + "=" * 50)
        print("⚠️  WARNING: This will permanently delete the sub-organization!")
        
        if credentials['delete_without_export']:
            print("⚠️  CRITICAL: Deletion without export cannot be undone!")
            print("   All wallets and private keys will be permanently lost!")
        else:
            print("   Wallets and private keys will be exported before deletion.")
        
        print("=" * 50)
        
        confirmation = input("\nType 'DELETE' to confirm (case-sensitive): ").strip()
        
        if confirmation != 'DELETE':
            print("❌ Deletion cancelled. Confirmation text did not match.")
            return
        
        # Execute deletion
        success = delete_suborganization(credentials)
        
        if success:
            print("\n✅ Sub-organization deletion process completed successfully!")
            print("Note: The deletion may take some time to process on Turnkey's servers.")
        else:
            print("\n❌ Sub-organization deletion failed. Please check the error messages above.")
            
    except KeyboardInterrupt:
        print("\n\n❌ Operation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error in main: {str(e)}")


if __name__ == "__main__":
    main()