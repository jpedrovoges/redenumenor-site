from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Product, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, RegisterSerializer, UserSerializer, CartSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Anúncio excluído com sucesso."}, status=status.HTTP_200_OK)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        user = User.objects.get(username=response.data['username'])
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": response.data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

class UserView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = self.request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"error": "Senha atual incorreta"}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Senha alterada com sucesso"})


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get("product_id")

        if not product_id:
            return Response({"error": "Produto não informado"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id, active=True)
        except Product.DoesNotExist:
            return Response({"error": "Produto não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
        )

        if not created:
            item.quantity += 1
            item.save()

        return Response({"message": "Produto adicionado"})


class RemoveFromCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get("product_id")

        if not product_id:
            return Response({"error": "Produto não informado"}, status=status.HTTP_400_BAD_REQUEST)

        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response({"message": "Removido"})


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related('product').all()

        if not items.exists():
            return Response({"error": "Carrinho vazio"}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.product.price * item.quantity for item in items)

        order = Order.objects.create(
            user=request.user,
            total=total,
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price,
            )

        items.delete()
        return Response({"message": "Pedido realizado"})

@api_view(['POST'])
@permission_classes([])
def login_view(request):
    username_or_email = request.data.get('username')
    password = request.data.get('password')

    user = None
    if '@' in username_or_email:
        # It's an email
        try:
            user = User.objects.get(email=username_or_email)
            username_or_email = user.username
        except User.DoesNotExist:
            return Response({"error": "Usuário ou email não encontrado"}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Authenticate with username
    user = authenticate(username=username_or_email, password=password)
    
    if user is None:
        return Response({"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })
