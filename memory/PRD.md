# ZentraQR - Product Requirements Document

## Original Problem Statement
Conectar al repositorio https://github.com/zentraqr/zentraqr.git y configurar las variables de entorno para ejecutar el proyecto en el entorno de preview.

## Architecture
- **Frontend**: React.js con Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas (cluster0.sc8ebl5.mongodb.net)
- **Authentication**: JWT-based
- **Payments**: Stripe integration
- **Email**: Gmail SMTP

## User Personas
1. **Restaurant Owner**: Gestiona restaurantes, mesas, menús y pedidos
2. **Customer**: Escanea QR codes y realiza pedidos

## Core Requirements (Static)
- Sistema de gestión de restaurantes
- Generación de QR codes para mesas
- Sistema de pedidos en tiempo real (Socket.IO)
- Procesamiento de pagos con Stripe
- Autenticación de usuarios

## What's Been Implemented
- [2024-03-12] Clonación del repositorio y configuración inicial
- [2024-03-12] Configuración de variables de entorno (MongoDB Atlas, JWT, Stripe, Gmail)
- [2024-03-12] Instalación de dependencias (qrcode[pil])
- [2024-03-12] Servicios backend y frontend funcionando

## Prioritized Backlog
### P0 (Critical)
- ✅ Proyecto funcionando en preview

### P1 (High Priority)
- Seed data para pruebas
- Verificación de flujos de autenticación

### P2 (Nice to Have)
- Optimización de rendimiento
- Tests automatizados

## Next Tasks
1. Probar registro/login de usuarios
2. Crear restaurante de prueba
3. Verificar generación de QR codes
4. Probar flujo de pedidos
