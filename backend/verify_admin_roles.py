#!/usr/bin/env python
"""
Verification script for Admin Role Management setup.
Run this from your Django project root:
    python verify_admin_roles.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # Adjust if needed
django.setup()

print("=" * 70)
print("ADMIN ROLE MANAGEMENT VERIFICATION")
print("=" * 70)

# Test 1: Check if AdminRoleManagementViewSet exists
print("\n1. Checking ViewSet import...")
try:
    from admin_panel.views import AdminRoleManagementViewSet
    print("   ✓ AdminRoleManagementViewSet imported successfully")
except ImportError as e:
    print(f"   ✗ FAILED to import AdminRoleManagementViewSet: {e}")
    sys.exit(1)

# Test 2: Check if AdminRole model exists
print("\n2. Checking AdminRole model...")
try:
    from admin_panel.models import AdminRole
    print("   ✓ AdminRole model imported successfully")
    admin_count = AdminRole.objects.count()
    print(f"   ℹ Current admin roles in database: {admin_count}")
except ImportError as e:
    print(f"   ✗ FAILED to import AdminRole model: {e}")
    sys.exit(1)

# Test 3: Check if URL resolves
print("\n3. Checking URL resolution...")
try:
    from django.urls import resolve
    match = resolve('/api/admin/admin-roles/')
    print(f"   ✓ URL resolves to: {match.func.__name__}")
    print(f"   ℹ View class: {match.func.cls.__name__}")
except Exception as e:
    print(f"   ✗ FAILED to resolve URL: {e}")
    print("\n   Troubleshooting steps:")
    print("   - Make sure 'admin_panel.urls' is included in root urls.py")
    print("   - Check that router.register('admin-roles', ...) exists in admin_panel/urls.py")
    sys.exit(1)

# Test 4: Check all admin-roles URLs
print("\n4. Checking all admin-roles endpoints...")
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    
    admin_role_urls = []
    for pattern in resolver.url_patterns:
        if hasattr(pattern, 'url_patterns'):
            for sub_pattern in pattern.url_patterns:
                if 'admin-roles' in str(sub_pattern.pattern):
                    admin_role_urls.append(str(sub_pattern.pattern))
    
    if admin_role_urls:
        print("   ✓ Found admin-roles URLs:")
        for url in admin_role_urls[:10]:  # Show first 10
            print(f"      - {url}")
    else:
        print("   ⚠ No admin-roles URLs found - router might not be registered")
except Exception as e:
    print(f"   ⚠ Could not enumerate URLs: {e}")

# Test 5: Check permissions
print("\n5. Checking permission classes...")
try:
    from admin_panel.permissions import IsSuperAdmin
    print("   ✓ IsSuperAdmin permission imported successfully")
except ImportError as e:
    print(f"   ✗ FAILED to import IsSuperAdmin: {e}")

# Test 6: Test endpoint manually (if possible)
print("\n6. Testing endpoint access...")
try:
    from django.test import RequestFactory
    from django.contrib.auth.models import User
    
    factory = RequestFactory()
    request = factory.get('/api/admin/admin-roles/')
    
    # Create a mock superuser for testing
    try:
        superuser = User.objects.filter(is_superuser=True).first()
        if superuser:
            request.user = superuser
            print(f"   ✓ Found superuser: {superuser.username}")
            
            # Try to get queryset
            viewset = AdminRoleManagementViewSet()
            viewset.request = request
            queryset = viewset.get_queryset()
            print(f"   ✓ ViewSet queryset returns {queryset.count()} admin roles")
        else:
            print("   ⚠ No superuser found in database for testing")
    except Exception as e:
        print(f"   ⚠ Could not test with superuser: {e}")
        
except Exception as e:
    print(f"   ⚠ Could not test endpoint: {e}")

# Test 7: Check serializers
print("\n7. Checking serializers...")
try:
    from admin_panel.serializers import AdminRoleSerializer, AdminRoleCreateSerializer
    print("   ✓ AdminRoleSerializer imported successfully")
    print("   ✓ AdminRoleCreateSerializer imported successfully")
except ImportError as e:
    print(f"   ✗ FAILED to import serializers: {e}")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)

print("\n✅ If all checks passed, try these manual tests:")
print("\n1. Login as admin:")
print("   curl -X POST http://127.0.0.1:8000/api/admin/login/ \\")
print("        -H 'Content-Type: application/json' \\")
print("        -d '{\"username\":\"admin\",\"password\":\"your_password\"}'")
print("\n2. List admin roles (use token from step 1):")
print("   curl -X GET http://127.0.0.1:8000/api/admin/admin-roles/ \\")
print("        -H 'Authorization: Token YOUR_TOKEN_HERE'")
print("\n3. If you get HTML instead of JSON, restart Django:")
print("   python manage.py runserver")
print()