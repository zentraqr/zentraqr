# ZentraQR - Product Requirements Document

## Visão Geral
Sistema de menu digital via QR Code para restaurantes. Permite pedidos pelo telemóvel, gestão em tempo real e pagamentos integrados.

## Stack Técnica
- **Frontend**: React.js com Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Autenticação**: JWT + Session-based (backoffice)
- **Pagamentos**: Stripe

---

## O Que Foi Implementado

### 2026-03-18: Refactoring do Backoffice + Segurança
- ✅ Novo design visual alinhado com a marca ZentraQR
- ✅ Autenticação segura via backend com cookies HttpOnly
- ✅ Sessões guardadas em MongoDB (`backoffice_sessions`)
- ✅ Todas as rotas do backoffice protegidas com `require_backoffice_auth`
- ✅ Login/logout funcional com validação de sessão

### 2026-03-19: Sistema de Waitlist/Whitelist
- ✅ Novo campo `landing_mode` em global settings (`"plans"` | `"waitlist"`)
- ✅ Endpoint `POST /api/waitlist` para submissão de waitlist
- ✅ Coleção `waitlist_entries` no MongoDB
- ✅ Secção de waitlist premium na landing page (quando `landing_mode="waitlist"`)
- ✅ Tab "Whitelist" no backoffice para gestão de entradas
- ✅ Controlo de modo na tab "Lançamento" do backoffice
- ✅ Traduções PT/EN para waitlist
- ✅ Pricing intacto e editável no backoffice (apenas escondido temporariamente)

---

## User Personas

### 1. Administrador ZentraQR (Backoffice)
- Gere configurações globais da plataforma
- Controla vendas de planos e modo da landing
- Visualiza contactos e waitlist
- Cria restaurantes e administradores

### 2. Dono de Restaurante
- Faz registo/subscrição de plano
- Gere menu, pedidos e pagamentos
- Acede ao dashboard do restaurante

### 3. Cliente Final
- Escaneia QR code na mesa
- Visualiza menu e faz pedidos
- Paga pelo telemóvel

---

## Core Requirements (Estáticos)

### Backoffice
- [x] Autenticação segura (não hardcoded)
- [x] Dashboard com estatísticas
- [x] Gestão de contactos
- [x] Gestão de pricing
- [x] Gestão de restaurantes
- [x] Gestão de admins
- [x] Configurações de lançamento
- [x] Modo landing (plans/waitlist)
- [x] Gestão de waitlist
- [x] Histórico de emails

### Landing Page
- [x] Modo pricing (3 planos)
- [x] Modo waitlist (formulário)
- [x] Traduções PT/EN
- [x] Design premium

---

## Backlog Priorizado

### P0 (Crítico - Produção)
- [ ] Configurar `COOKIE_SECURE=true` em produção
- [ ] Configurar `GMAIL_APP_PASSWORD` para envio de emails

### P1 (Alto)
- [ ] Dashboard de restaurante completo
- [ ] Gestão de menu
- [ ] Sistema de pedidos em tempo real
- [ ] Integração Stripe para subscrições

### P2 (Médio)
- [ ] Notificações push
- [ ] Multi-idiomas no menu
- [ ] Exportação de relatórios

### P3 (Baixo)
- [ ] App móvel nativa
- [ ] Integrações com POS
- [ ] API pública

---

## Próximas Tarefas
1. Testar waitlist em produção
2. Enviar emails de confirmação para waitlist
3. Implementar onboarding de restaurantes
4. Dashboard de restaurante

---

## Variáveis de Ambiente

### Backend (.env)
```
MONGO_URL=mongodb+srv://...
DB_NAME=QRcode
BACKOFFICE_PASSWORD=***
BACKOFFICE_SESSION_HOURS=12
COOKIE_SECURE=false (true em produção)
JWT_SECRET=***
STRIPE_API_KEY=***
GMAIL_EMAIL=zentraqr@gmail.com
GMAIL_APP_PASSWORD=***
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://...
```

---

*Última atualização: 2026-03-19*
