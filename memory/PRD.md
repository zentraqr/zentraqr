# ZentraQR - Product Requirements Document

## Original Problem Statement
Sistema de gestão de restaurantes com menus QR Code, pedidos em tempo real e pagamentos.

## Architecture
- **Frontend**: React.js com Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **Payments**: Stripe

## What's Been Implemented

### Session 1 (2024-03-12)
- Clonação do repositório zentraqr
- Configuração de variáveis de entorno
- Logo personalizado implementado

### Session 2 (2024-03-13)
- Rota /login adicionada para área de clientes
- Sistema completo de personalização de QR Codes:
  - QRCodeEditor.js - Editor visual com preview em tempo real
  - 4 tabs: Conteúdo, Estilo, Layout, Logo
  - 8 paletas de cores predefinidas
  - 3 layouts: Clássico, Compacto, Minimalista
  - 3 estilos de cartão: Arredondado, Reto, Minimal
  - Upload de logo personalizado
  - Impressão em batch de múltiplas mesas
  - Endpoints backend: GET/PUT /api/qr-settings

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Autenticação funcional
- ✅ Sistema de QR Codes personalizáveis

### P1 (High Priority)
- Templates de QR pré-definidos por tipo de restaurante
- Exportar PDF com múltiplas páginas

### P2 (Nice to Have)
- Fontes personalizáveis
- Bordas e decorações
- Integração com impressoras

## Next Tasks
1. Testar impressão em diferentes browsers
2. Adicionar mais templates
3. Melhorar preview mobile
