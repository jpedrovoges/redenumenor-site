"""
URL configuration for numenor_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from products.views import ProductViewSet, RegisterView, UserView, ChangePasswordView, login_view, CartView, AddToCartView, RemoveFromCartView, CheckoutView

router = DefaultRouter()
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('', lambda request: HttpResponse('Welcome to Numenor API')),
    path('admin/', admin.site.urls),

    # 🔐 AUTH
    path('api/login/', login_view),
    path('api/register/', RegisterView.as_view()),
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/user/', UserView.as_view()),
    path('api/change-password/', ChangePasswordView.as_view()),
    path('api/cart/', CartView.as_view()),
    path('api/cart/add/', AddToCartView.as_view()),
    path('api/cart/remove/', RemoveFromCartView.as_view()),
    path('api/cart/checkout/', CheckoutView.as_view()),

    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
