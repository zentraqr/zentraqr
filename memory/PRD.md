# ZentraQR - Product Requirements Document

## Original Problem Statement
Sistema de gestao de restaurantes com menus QR Code, pedidos em tempo real e pagamentos.
Refatoracao principal: eliminar duplicacao entre menu por imagem e menu por texto, ficando com uma unica fonte de verdade (categories/products) e dois modos de apresentacao (image/text).

## Architecture
- **Frontend**: React.js com Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Real-time**: Socket.IO
- **Payments**: Stripe

## Key DB Schema
- `restaurants`: { id, name, description, address, phone, logo_url, primary_color, secondary_color, menu_config: { active_menu_type, text_menu_template } }
- `categories`: { id, restaurant_id, name, description?, image_url?, display_order, active }
- `products`: { id, restaurant_id, category_id, name, description?, price, image_url?, extras, highlighted, display_order, active }

## What's Been Implemented

### Previous Sessions
- Clonagem do repositorio zentraqr e setup
- Logo personalizado
- Rota /login para area de clientes
- QRCodeEditor com 4 tabs, 8 paletas, 3 layouts, upload de logo, impressao em batch
- Modo escuro no painel de administracao (ThemeContext)
- Correcao CORS e .env para ambiente de preview
- Correcao QR codes (URL correta do ambiente)

### Session (2025-03-18) - Refatoracao Menu Unificado
- **Backend**: Modelo Product com highlighted e display_order. Modelo Category com display_order. MenuConfig simplificado (apenas active_menu_type e text_menu_template, sem text_menu_data). Modelos obsoletos TextMenuItem/TextMenuSection/TextMenuData removidos. Endpoint menu-config limpo (nao retorna campos legacy).
- **Frontend MenuManagement.js**: Corrigido erro JSX (fragmento orfao). Toggle de tipo de menu (imagem/texto). Seletor de template (classic/modern/cafe). Preview do menu de texto com TextMenuRenderer. ProductModal com campos highlighted e display_order. ProductCard com fallback visual (icone Utensils) para produtos sem imagem.
- **Frontend MenuPage.js**: Le sempre de categories/products (fonte unica). Renderiza TextMenuRenderer ou menu de imagem conforme active_menu_type. Funcao addTextMenuItemToCart simplificada usando addToCart.
- **Templates de texto**: ClassicTemplate, ModernTemplate, CafeTemplate usam categories/products unificados com suporte a highlighted.
- **Limpeza**: TextMenuEditor.js e .bak removidos. TextMenuRenderer e componente compartilhado.
- **Testes**: 11/11 testes passaram (backend 100%, frontend 100%).

## Prioritized Backlog

### P0 (Critical) - DONE
- Autenticacao funcional
- Sistema de QR Codes personalizaveis
- Refatoracao menu unificado (fonte unica de dados)

### P1 (High Priority) - PENDING
- Reordenacao drag-and-drop para categorias/produtos (campo display_order)
- Templates de QR pre-definidos por tipo de restaurante
- Exportar PDF com multiplas paginas

### P2 (Nice to Have) - PENDING
- Versao para impressao do menu de texto
- Ferramenta de migracao de dados antigos para nova estrutura
- Fontes personalizaveis
- Bordas e decoracoes
- Integracao com impressoras

## Next Tasks
1. Implementar reordenacao drag-and-drop (P1)
2. Versao para impressao do menu de texto (P2)
3. Ferramenta de migracao de dados antigos (P2)
