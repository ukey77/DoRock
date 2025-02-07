from django.urls import path
from app_dorock import views

urlpatterns = [
    path('', views.index),
    path('tripInfo/', views.tripInfo),
    path('tripInfoDetail/', views.tripInfoDetail),
    path('aiPlanner/', views.aiPlanner),
    path('detail/', views.detail),
]

