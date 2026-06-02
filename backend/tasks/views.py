from django.db.models import Count, Q
from rest_framework import generics, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Task
from .serializers import (
    TaskSerializer, RegisterSerializer,
    UserSerializer, ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully.'})


class TaskStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Task.objects.filter(user=request.user)
        stats = qs.aggregate(
            total=Count('id'),
            todo=Count('id', filter=Q(status='todo')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            completed=Count('id', filter=Q(status='completed')),
            high=Count('id', filter=Q(priority='high')),
            medium=Count('id', filter=Q(priority='medium')),
            low=Count('id', filter=Q(priority='low')),
        )
        return Response(stats)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'status', 'priority']

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        task_status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        due_date = self.request.query_params.get('due_date')
        due_date_from = self.request.query_params.get('due_date_from')
        due_date_to = self.request.query_params.get('due_date_to')
        if task_status:
            qs = qs.filter(status=task_status)
        if priority:
            qs = qs.filter(priority=priority)
        if due_date:
            qs = qs.filter(due_date=due_date)
        if due_date_from:
            qs = qs.filter(due_date__gte=due_date_from)
        if due_date_to:
            qs = qs.filter(due_date__lte=due_date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
