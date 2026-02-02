from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.request import Request
from django.db.models import Q, Count, Sum, QuerySet
from django.utils import timezone
from datetime import timedelta
from profiles.models import UserProfile
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .models import PremiumPlan, PremiumFeature, UserReport, AdminAction
from .serializers import (
    PremiumPlanSerializer, PremiumFeatureSerializer,
    UserProfileSerializer, UserReportSerializer, 
    AdminActionSerializer, UserActionSerializer
)


class PremiumManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing premium plans"""
    # Default permission is Admin only, but overriden in get_permissions
    permission_classes = [IsAdminUser]
    serializer_class = PremiumPlanSerializer
    queryset = PremiumPlan.objects.all()
    lookup_field = 'plan_id'
    
    def get_permissions(self):
        """
        CRITICAL UPDATE: Allow public access to list plans.
        """
        if self.action in ['list', 'retrieve', 'public_plans']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Get queryset with optional filtering"""
        request = self.request
        queryset = PremiumPlan.objects.all()
        
        # SECURITY: If user is NOT admin, only show active plans
        if not request.user.is_staff:
            queryset = queryset.filter(active=True)
        
        # Filters for Admin
        active = request.query_params.get('active', None)
        if active is not None and request.user.is_staff:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        popular = request.query_params.get('popular', None)
        if popular is not None:
            queryset = queryset.filter(popular=popular.lower() == 'true')
        
        return queryset.order_by('display_order', 'price')
    
    @action(detail=False, methods=['get'])
    def public_plans(self, request):
        """Get active plans for public display (Explicit endpoint)"""
        plans = PremiumPlan.objects.filter(active=True).order_by('display_order', 'price')
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, plan_id=None):
        """Toggle plan active status"""
        try:
            plan = self.get_object()
            plan.active = not plan.active
            plan.save()
            
            return Response({
                'message': f'Plan {"activated" if plan.active else "deactivated"} successfully',
                'plan': PremiumPlanSerializer(plan).data
            })
        except PremiumPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def toggle_popular(self, request, plan_id=None):
        """Toggle plan popular status"""
        try:
            plan = self.get_object()
            
            # If setting as popular, remove popular from all other plans
            if not plan.popular:
                PremiumPlan.objects.all().update(popular=False)
            
            plan.popular = not plan.popular
            plan.save()
            
            return Response({
                'message': f'Plan marked as {"popular" if plan.popular else "regular"}',
                'plan': PremiumPlanSerializer(plan).data
            })
        except PremiumPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder plans"""
        try:
            orders = request.data.get('orders', [])  # [{plan_id: 'monthly', order: 0}, ...]
            
            for item in orders:
                plan_id = item.get('plan_id')
                order = item.get('order')
                
                if plan_id and order is not None:
                    PremiumPlan.objects.filter(plan_id=plan_id).update(display_order=order)
            
            return Response({'message': 'Plans reordered successfully'})
        except Exception as e:
            return Response(
                {'error': f'Reorder failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PremiumFeatureViewSet(viewsets.ModelViewSet):
    """ViewSet for managing premium features"""
    permission_classes = [IsAdminUser]
    serializer_class = PremiumFeatureSerializer
    queryset = PremiumFeature.objects.all()
    
    def get_permissions(self):
        """
        CRITICAL UPDATE: Allow public access to list features.
        """
        if self.action in ['list', 'retrieve', 'public_features']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Get queryset with optional filtering"""
        request = self.request
        queryset = PremiumFeature.objects.all()
        
        # SECURITY: If user is NOT admin, only show active features
        if not request.user.is_staff:
            queryset = queryset.filter(active=True)
        
        # Filter by active status (Admin only)
        active = request.query_params.get('active', None)
        if active is not None and request.user.is_staff:
            queryset = queryset.filter(active=active.lower() == 'true')
        
        return queryset.order_by('display_order')
    
    @action(detail=False, methods=['get'])
    def public_features(self, request):
        """Get active features for public display (no auth required)"""
        features = PremiumFeature.objects.filter(active=True).order_by('display_order')
        serializer = self.get_serializer(features, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle feature active status"""
        try:
            feature = self.get_object()
            feature.active = not feature.active
            feature.save()
            
            return Response({
                'message': f'Feature {"activated" if feature.active else "deactivated"} successfully',
                'feature': PremiumFeatureSerializer(feature).data
            })
        except PremiumFeature.DoesNotExist:
            return Response(
                {'error': 'Feature not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder features"""
        try:
            orders = request.data.get('orders', [])  # [{id: 1, order: 0}, ...]
            
            for item in orders:
                feature_id = item.get('id')
                order = item.get('order')
                
                if feature_id and order is not None:
                    PremiumFeature.objects.filter(id=feature_id).update(display_order=order)
            
            return Response({'message': 'Features reordered successfully'})
        except Exception as e:
            return Response(
                {'error': f'Reorder failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination class for all viewsets"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminDashboardViewSet(viewsets.ViewSet):
    """ViewSet for admin dashboard statistics"""
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request: Request) -> Response:
        """Get comprehensive dashboard statistics"""
        try:
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            users = UserProfile.objects.all()
            total_users = users.count()
            active_users = users.filter(status='online').count()
            suspended_users = users.filter(account_status='suspended').count()
            banned_users = users.filter(account_status='banned').count()
            new_users_today = users.filter(join_date__date=today).count()
            new_users_week = users.filter(join_date__date__gte=week_ago).count()
            new_users_month = users.filter(join_date__date__gte=month_ago).count()
            
            total_matches = users.aggregate(Sum('matches'))['matches__sum'] or 0
            total_messages = users.aggregate(Sum('messages'))['messages__sum'] or 0
            
            # Reports statistics
            all_reports = UserReport.objects.all()
            reports_count = all_reports.count()
            pending_reports = all_reports.filter(status='pending').count()
            resolved_reports = all_reports.filter(status='resolved').count()
            
            verified_users = users.filter(verified=True).count()
            premium_users = users.filter(premium=True).count()
            complete_profiles = users.filter(profile_complete=True).count()
            
            account_status_dist = {
                'active': users.filter(account_status='active').count(),
                'pending': users.filter(account_status='pending').count(),
                'suspended': users.filter(account_status='suspended').count(),
                'banned': users.filter(account_status='banned').count(),
            }
            
            # Recent admin activity
            recent_actions = AdminAction.objects.filter(
                created_at__gte=week_ago
            ).values('action_type').annotate(count=Count('id'))
            
            # User growth trend (last 7 days)
            user_growth = []
            for i in range(7):
                date = today - timedelta(days=i)
                count = users.filter(join_date__date=date).count()
                user_growth.append({
                    'date': date.isoformat(),
                    'count': count
                })
            user_growth.reverse()
            
            return Response({
                'totalUsers': total_users,
                'activeUsers': active_users,
                'suspendedUsers': suspended_users,
                'bannedUsers': banned_users,
                'newUsersToday': new_users_today,
                'newUsersWeek': new_users_week,
                'newUsersMonth': new_users_month,
                'totalMatches': total_matches,
                'totalMessages': total_messages,
                'reportsCount': reports_count,
                'pendingReports': pending_reports,
                'resolvedReports': resolved_reports,
                'verifiedUsers': verified_users,
                'premiumUsers': premium_users,
                'completeProfiles': complete_profiles,
                'accountStatusDistribution': account_status_dist,
                'recentActions': list(recent_actions),
                'userGrowth': user_growth,
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch statistics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing users"""
    permission_classes = [IsAdminUser]
    serializer_class = UserProfileSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self) -> QuerySet[UserProfile]:
        """Get queryset with filters and search"""
        request: Request = self.request  # type: ignore
        queryset = UserProfile.objects.select_related('user').all()
        
        # Filters
        search = request.query_params.get('search', None)
        status_filter = request.query_params.get('status', None)
        account_status = request.query_params.get('account_status', None)
        verified = request.query_params.get('verified', None)
        premium = request.query_params.get('premium', None)
        ordering = request.query_params.get('ordering', '-join_date')
        
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        if account_status and account_status != 'all':
            queryset = queryset.filter(account_status=account_status)
        
        if verified is not None:
            queryset = queryset.filter(verified=verified.lower() == 'true')
        
        if premium is not None:
            queryset = queryset.filter(premium=premium.lower() == 'true')
        
        # Ordering
        allowed_orderings = [
            'join_date', '-join_date', 'last_active', '-last_active',
            'user__username', '-user__username', 'matches', '-matches'
        ]
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-join_date')
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def detail_view(self, request: Request, pk: int | None = None) -> Response:
        """Get detailed user information including reports and actions"""
        try:
            profile = self.get_object()
            
            # Get user's reports (as reporter and as reported)
            reports_made = UserReport.objects.filter(reporter=profile.user).order_by('-created_at')[:10]
            reports_received = UserReport.objects.filter(reported_user=profile.user).order_by('-created_at')[:10]
            
            # Get admin actions on this user
            actions = AdminAction.objects.filter(target_user=profile.user).order_by('-created_at')[:10]
            
            return Response({
                'profile': UserProfileSerializer(profile).data,
                'reports_made': UserReportSerializer(reports_made, many=True).data,
                'reports_received': UserReportSerializer(reports_received, many=True).data,
                'admin_actions': AdminActionSerializer(actions, many=True).data,
            })
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def user_action(self, request: Request, pk: int | None = None) -> Response:
        """Perform action on user (suspend, ban, activate, delete, verify)"""
        try:
            profile = self.get_object()
            serializer = UserActionSerializer(data=request.data)
            
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            action_type = serializer.validated_data['action']
            reason = serializer.validated_data.get('reason', '')
            
            # Security checks
            if profile.user == request.user:
                return Response(
                    {'error': 'You cannot perform actions on your own account'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prevent non-superusers from acting on staff accounts
            if profile.user.is_staff and not request.user.is_superuser:
                return Response(
                    {'error': 'You cannot perform actions on admin accounts'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Log admin action
            AdminAction.objects.create(
                admin=request.user,
                target_user=profile.user,
                action_type=action_type,
                reason=reason
            )
            
            if action_type == 'suspend':
                profile.account_status = 'suspended'
                profile.save()
                message = 'User suspended successfully'
                
            elif action_type == 'ban':
                profile.account_status = 'banned'
                profile.save()
                message = 'User banned successfully'
                
            elif action_type == 'activate':
                profile.account_status = 'active'
                profile.save()
                message = 'User activated successfully'
                
            elif action_type == 'delete':
                user = profile.user
                username = user.username
                user.delete()  # This will cascade delete the profile
                return Response({
                    'message': f'User {username} deleted successfully'
                })
                
            elif action_type == 'verify':
                profile.verified = True
                profile.save()
                message = 'User verified successfully'
            
            return Response({
                'message': message,
                'user': UserProfileSerializer(profile).data
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request: Request) -> Response:
        """Perform bulk actions on multiple users"""
        try:
            user_ids = request.data.get('user_ids', [])
            action_type = request.data.get('action')
            reason = request.data.get('reason', 'Bulk action performed')
            
            if not user_ids:
                return Response(
                    {'error': 'No users selected'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not isinstance(user_ids, list):
                return Response(
                    {'error': 'user_ids must be a list'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if action_type not in ['suspend', 'activate', 'verify', 'ban']:
                return Response(
                    {'error': 'Invalid action type. Must be: suspend, activate, verify, or ban'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            profiles = UserProfile.objects.filter(user_id__in=user_ids).select_related('user')
            success_count = 0
            skipped_count = 0
            errors = []
            
            for profile in profiles:
                # Skip action on self or staff accounts
                if profile.user == request.user:
                    skipped_count += 1
                    errors.append('Skipped: Cannot act on your own account')
                    continue
                    
                if profile.user.is_staff and not request.user.is_superuser:
                    skipped_count += 1
                    errors.append(f'Skipped: {profile.user.username} (admin account)')
                    continue
                
                try:
                    # Log action
                    AdminAction.objects.create(
                        admin=request.user,
                        target_user=profile.user,
                        action_type=action_type,
                        reason=reason
                    )
                    
                    # Perform action
                    if action_type in ['suspend', 'ban']:
                        profile.account_status = action_type
                    elif action_type == 'activate':
                        profile.account_status = 'active'
                    elif action_type == 'verify':
                        profile.verified = True
                    
                    profile.save()
                    success_count += 1
                except Exception as e:
                    errors.append(f'Error on {profile.user.username}: {str(e)}')
            
            return Response({
                'message': 'Bulk action completed',
                'success_count': success_count,
                'skipped_count': skipped_count,
                'total_requested': len(user_ids),
                'errors': errors if errors else None
            })
            
        except Exception as e:
            return Response(
                {'error': f'Bulk action failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def export(self, request: Request) -> Response:
        """Export users data (CSV format)"""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'data': serializer.data,
                'count': len(serializer.data)
            })
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user reports"""
    permission_classes = [IsAdminUser]
    serializer_class = UserReportSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self) -> QuerySet[UserReport]:
        """Get queryset with filters"""
        request: Request = self.request  # type: ignore
        queryset = UserReport.objects.select_related(
            'reporter', 'reported_user', 'reviewed_by'
        ).all()
        
        status_filter = request.query_params.get('status', None)
        reason_filter = request.query_params.get('reason', None)
        search = request.query_params.get('search', None)
        ordering = request.query_params.get('ordering', '-created_at')
        
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        
        if reason_filter and reason_filter != 'all':
            queryset = queryset.filter(reason=reason_filter)
        
        if search:
            queryset = queryset.filter(
                Q(reporter__username__icontains=search) |
                Q(reported_user__username__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Ordering
        allowed_orderings = ['created_at', '-created_at', 'status', '-status']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def review(self, request: Request, pk: int | None = None) -> Response:
        """Review a report and take action"""
        try:
            report = self.get_object()
            action = request.data.get('action')  # 'resolve', 'dismiss'
            admin_notes = request.data.get('admin_notes', '')
            
            if action not in ['resolve', 'dismiss']:
                return Response(
                    {'error': 'Invalid action. Must be "resolve" or "dismiss"'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            report.reviewed_by = request.user
            report.reviewed_at = timezone.now()
            report.admin_notes = admin_notes
            
            if action == 'resolve':
                report.status = 'resolved'
            elif action == 'dismiss':
                report.status = 'dismissed'
            
            report.save()
            
            return Response({
                'message': f'Report {action}d successfully',
                'report': UserReportSerializer(report).data
            })
            
        except UserReport.DoesNotExist:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def bulk_review(self, request: Request) -> Response:
        """Bulk review multiple reports"""
        try:
            report_ids = request.data.get('report_ids', [])
            action = request.data.get('action')
            admin_notes = request.data.get('admin_notes', 'Bulk review')
            
            if not report_ids:
                return Response(
                    {'error': 'No reports selected'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if action not in ['resolve', 'dismiss']:
                return Response(
                    {'error': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            reports = UserReport.objects.filter(id__in=report_ids)
            updated_count = 0
            
            for report in reports:
                report.reviewed_by = request.user
                report.reviewed_at = timezone.now()
                report.admin_notes = admin_notes
                report.status = 'resolved' if action == 'resolve' else 'dismissed'
                report.save()
                updated_count += 1
            
            return Response({
                'message': f'{updated_count} reports {action}d successfully',
                'updated_count': updated_count
            })
            
        except Exception as e:
            return Response(
                {'error': f'Bulk review failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminActionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing admin action logs"""
    permission_classes = [IsAdminUser]
    serializer_class = AdminActionSerializer
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self) -> QuerySet[AdminAction]:
        """Get queryset with filters"""
        request: Request = self.request  # type: ignore
        queryset = AdminAction.objects.select_related(
            'admin', 'target_user'
        ).all()
        
        user_id = request.query_params.get('user_id', None)
        admin_id = request.query_params.get('admin_id', None)
        action_type = request.query_params.get('action_type', None)
        search = request.query_params.get('search', None)
        ordering = request.query_params.get('ordering', '-created_at')
        
        if user_id:
            queryset = queryset.filter(target_user_id=user_id)
        
        if admin_id:
            queryset = queryset.filter(admin_id=admin_id)
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        if search:
            queryset = queryset.filter(
                Q(admin__username__icontains=search) |
                Q(target_user__username__icontains=search) |
                Q(reason__icontains=search)
            )
        
        # Ordering
        allowed_orderings = ['created_at', '-created_at', 'action_type', '-action_type']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request: Request) -> Response:
        """Get statistics about admin actions"""
        try:
            week_ago = timezone.now() - timedelta(days=7)
            
            total_actions = AdminAction.objects.count()
            recent_actions = AdminAction.objects.filter(created_at__gte=week_ago).count()
            
            actions_by_type = AdminAction.objects.values('action_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            most_active_admins = AdminAction.objects.filter(
                created_at__gte=week_ago
            ).values(
                'admin__username'
            ).annotate(
                count=Count('id')
            ).order_by('-count')[:5]
            
            return Response({
                'total_actions': total_actions,
                'recent_actions': recent_actions,
                'actions_by_type': list(actions_by_type),
                'most_active_admins': list(most_active_admins),
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch statistics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class AdminLoginView(APIView):
    """Admin login view - accepts both username and email"""
    permission_classes = [AllowAny]
    
    def post(self, request: Request) -> Response:
        """Handle admin login with username/email + password"""
        try:
            identifier = request.data.get('username')  # Can be username or email
            password = request.data.get('password')
            
            if not identifier or not password:
                return Response(
                    {'error': 'Username/email and password are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Try to authenticate with username first
            user = authenticate(username=identifier, password=password)
            
            # If that fails and identifier looks like an email, try to find user by email
            if user is None and '@' in identifier:
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    
                    # Get all users with this email (there might be multiple)
                    users_with_email = User.objects.filter(email=identifier)
                    
                    # Try to authenticate with each one until one works
                    for potential_user in users_with_email:
                        user = authenticate(username=potential_user.username, password=password)
                        if user is not None:
                            break  # Found the right user!
                            
                except Exception as e:
                    print(f"Error looking up user by email: {e}")
                    pass
            
            if user is None:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.is_staff:
                return Response(
                    {'error': 'Access denied. Admin privileges required.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Delete old token and create new one
            Token.objects.filter(user=user).delete()
            token = Token.objects.create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print("Admin login error:", traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )