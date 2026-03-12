# 🎉 ZentraQR - Configuração Completa

## ✅ Status do Sistema

### Serviços Ativos:
- ✅ **Backend**: FastAPI rodando na porta 8001
- ✅ **Frontend**: React rodando na porta 3000
- ✅ **MongoDB**: Conectado com sucesso ao MongoDB Atlas
- ✅ **Socket.IO**: Configurado para notificações em tempo real

### 🌐 URLs do Projeto:
- **Frontend**: https://zentraqr-hub.preview.emergentagent.com
- **Backend API**: https://zentraqr-hub.preview.emergentagent.com/api
- **Admin Login**: https://zentraqr-hub.preview.emergentagent.com/admin/login

---

## 📊 Dados na Base de Dados (MongoDB Atlas)

### Restaurantes (3):
1. **Restaurante Demo** (ID: `42075462-798e-4f1c-aa88-163306477ecf`)
2. **Test Restaurant** (ID: `6b820844-31e9-4061-9f3a-bc45cd3d9f89`)
3. **Bigodes** (ID: `81d49189-ed4f-49e3-8e7b-1ad307f9e824`)

### Utilizadores (4):
1. **admin@demo.com** - Administrador (Restaurant: Restaurante Demo)
2. **test_234846@demo.com** - Test User (Restaurant: Test Restaurant)
3. **demo@zentraqr.com** - Demo Admin (Restaurant: Restaurante Demo)
4. **bigode@gmail.com** - Bigode (Restaurant: Bigodes)

### Estatísticas:
- **Mesas**: 24 (20 ativas)
- **Categorias**: 12 categorias
- **Produtos**: 14 produtos ativos
- **Pedidos**: 36 pedidos históricos
- **Contactos**: 3 contactos
- **Subscrições**: 1 subscrição ativa
- **Floor Zones**: 3 zonas de piso
- **Floor Walls**: 13 paredes configuradas

### Credenciais de Login:
```
Email: admin@demo.com
Password: admin123
```

---

## 🎯 Funcionalidades Disponíveis

### Para Clientes:
✅ Landing page multi-idioma (PT/EN)
✅ Menu digital via QR Code
✅ Carrinho de compras
✅ Sistema de pedidos
✅ Pagamento online (Stripe) ou no balcão
✅ Tracking em tempo real
✅ Chamar empregado

### Para Administradores:
✅ Dashboard com estatísticas
✅ Gestão de pedidos em tempo real
✅ Gestão de menu (categorias e produtos)
✅ Gestão de mesas
✅ Floor Plan visual
✅ Sistema de subscrição
✅ Backoffice (contactos, preços)
✅ Cancelamento de pedidos
✅ Histórico de pedidos

---

## 🔧 Configuração Aplicada

### Backend (.env):
```env
MONGO_URL="mongodb+srv://pedro:pedro123@cluster0.sc8ebl5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME="QRcode"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production-12345"
STRIPE_API_KEY="sk_test_emergent"
FRONTEND_URL="https://zentraqr-hub.preview.emergentagent.com"
GMAIL_EMAIL="zentraqr@gmail.com"
GMAIL_APP_PASSWORD="sjmktrcaxpoklgyd"
```

### Frontend (.env):
```env
REACT_APP_BACKEND_URL=https://zentraqr-hub.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## 🚀 Comandos Úteis

### Reiniciar Serviços:
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart all
```

### Verificar Status:
```bash
sudo supervisorctl status
```

### Ver Logs:
```bash
# Backend
tail -f /var/log/supervisor/backend.*.log

# Frontend
tail -f /var/log/supervisor/frontend.*.log
```

### Testar APIs:
```bash
# Listar restaurantes
curl http://localhost:8001/api/restaurants

# Listar categorias de um restaurante
curl http://localhost:8001/api/categories/restaurant/42075462-798e-4f1c-aa88-163306477ecf

# Listar produtos de um restaurante
curl http://localhost:8001/api/products/restaurant/42075462-798e-4f1c-aa88-163306477ecf
```

---

## 📱 Exemplos de QR Code

Para gerar QR Code de uma mesa:
```
https://zentraqr-hub.preview.emergentagent.com/menu?restaurant_id=42075462-798e-4f1c-aa88-163306477ecf&table_id=0af1b474-3201-4a67-a85e-78c59a2994b8
```

---

## 🎨 Design Guidelines

O projeto utiliza as seguintes cores:
- **Primary (Zest Orange)**: #FF5500
- **Secondary (Fresh Basil)**: #10B981
- **Background**: #FAFAFA
- **Text Primary**: #18181B

Tipografia:
- **Headings**: Outfit (Google Fonts)
- **Body**: Plus Jakarta Sans (Google Fonts)

---

## ✅ Próximos Passos Recomendados

1. **Testar a aplicação** através do browser
2. **Fazer login no admin** com as credenciais fornecidas
3. **Explorar o dashboard** e funcionalidades
4. **Testar criação de pedidos** através do menu QR
5. **Verificar notificações em tempo real** (Socket.IO)

---

**Data de Configuração**: $(date)
**Status**: ✅ Sistema 100% Operacional
