
# 📊 Flujo de Eliminación de Cuentas de Usuario

## 🔄 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO                                    │
│              Administrador accede al                         │
│              Panel de Administración                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SELECCIONAR OPCIÓN                              │
│           "Eliminar Cuentas" en el menú                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PANTALLA DE BÚSQUEDA                            │
│  ┌─────────────────────────────────────────────────┐        │
│  │  🔍 Buscar por nombre, email, ID, código...     │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ⚠️ Banner: "La eliminación es permanente"                  │
│                                                              │
│  📋 Lista de usuarios filtrados                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              SELECCIONAR USUARIO                             │
│  Tocar en el card del usuario para ver detalles             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MODAL DE DETALLES                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │  📋 Información Personal                         │        │
│  │  • Nombre, Email, ID, Dirección                  │        │
│  └─────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  💰 Información Financiera                       │        │
│  │  • Balance MXI, USDT, Referidos                  │        │
│  └─────────────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────────────┐        │
│  │  ⚠️ ZONA DE PELIGRO                             │        │
│  │  🗑️ Eliminar Cuenta Permanentemente             │        │
│  └─────────────────────────────────────────────────┘        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              TOCAR BOTÓN ELIMINAR                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DIÁLOGO DE CONFIRMACIÓN                         │
│  ⚠️ ¿Estás seguro de eliminar la cuenta de [Nombre]?       │
│                                                              │
│  Esta acción:                                                │
│  • Eliminará todos los datos del usuario                     │
│  • Eliminará todas las transacciones                         │
│  • Eliminará todos los referidos                             │
│  • NO SE PUEDE DESHACER                                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────────────────┐            │
│  │   Cancelar   │  │  Eliminar Permanentemente │            │
│  └──────────────┘  └──────────────────────────┘            │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    CANCELAR                CONFIRMAR
         │                       │
         │                       ▼
         │          ┌─────────────────────────────────┐
         │          │  EJECUTAR ELIMINACIÓN           │
         │          │  Llamar a delete_user_account() │
         │          └────────────┬────────────────────┘
         │                       │
         │                       ▼
         │          ┌─────────────────────────────────┐
         │          │  VERIFICAR PERMISOS             │
         │          │  ¿Es administrador?             │
         │          └────────────┬────────────────────┘
         │                       │
         │           ┌───────────┴───────────┐
         │           │                       │
         │           ▼                       ▼
         │          NO                      SÍ
         │           │                       │
         │           ▼                       ▼
         │    ┌──────────────┐    ┌──────────────────┐
         │    │ Error:       │    │ ELIMINAR DATOS:  │
         │    │ No autorizado│    │ • Referidos      │
         │    └──────────────┘    │ • Comisiones     │
         │                        │ • Contribuciones │
         │                        │ • Retiros        │
         │                        │ • Mensajes       │
         │                        │ • Pagos          │
         │                        │ • KYC            │
         │                        │ • Vesting        │
         │                        │ • Juegos         │
         │                        │ • users table    │
         │                        │ • auth.users     │
         │                        └────────┬─────────┘
         │                                 │
         │                                 ▼
         │                    ┌─────────────────────────┐
         │                    │  ¿Éxito?                │
         │                    └────────┬────────────────┘
         │                             │
         │                 ┌───────────┴───────────┐
         │                 │                       │
         │                 ▼                       ▼
         │               ERROR                   ÉXITO
         │                 │                       │
         │                 ▼                       ▼
         │    ┌──────────────────────┐  ┌──────────────────────┐
         │    │ Mostrar mensaje      │  │ ✅ Cuenta eliminada  │
         │    │ de error             │  │ ✅ Actualizar lista  │
         │    └──────────────────────┘  │ ✅ Cerrar modal      │
         │                               └──────────────────────┘
         │                                         │
         └─────────────────────────────────────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │      FIN        │
                                          └─────────────────┘
```

---

## 🔍 Detalles del Proceso

### 1. Búsqueda de Usuario

**Filtros disponibles**:
- Nombre completo
- Email
- Número de identificación
- Código de referido

**Características**:
- Búsqueda en tiempo real
- Actualización instantánea
- Sin necesidad de presionar "buscar"

### 2. Visualización de Información

**Información mostrada**:
- Avatar con estado (activo/bloqueado)
- Nombre y email
- Balance MXI y USDT
- Número de referidos
- Fecha de registro
- Estado de la cuenta

### 3. Confirmación de Eliminación

**Diálogo de confirmación incluye**:
- Nombre del usuario
- Email del usuario
- Lista de lo que se eliminará
- Advertencia de irreversibilidad
- Botones claros (Cancelar / Eliminar)

### 4. Proceso de Eliminación

**Orden de eliminación**:
1. Verificar permisos de administrador
2. Obtener email del usuario (para log)
3. Eliminar referidos
4. Eliminar comisiones
5. Eliminar contribuciones
6. Eliminar retiros
7. Eliminar mensajes
8. Eliminar pagos
9. Eliminar verificaciones manuales
10. Eliminar programación de retiros MXI
11. Eliminar tickets de lotería
12. Eliminar historial de desafíos
13. Eliminar datos de vesting
14. Eliminar historial de balance
15. Eliminar niveles de embajador
16. Eliminar retiros de bonos
17. Eliminar verificaciones KYC
18. Eliminar historial de transacciones
19. Eliminar participación en juegos
20. Eliminar resultados de juegos
21. Eliminar de tabla `users`
22. Eliminar de `auth.users`

### 5. Confirmación Final

**Mensaje de éxito**:
```
✅ La cuenta de [Nombre] ha sido eliminada 
permanentemente junto con todos sus datos.
```

**Acciones automáticas**:
- Cierre del modal
- Actualización de la lista de usuarios
- Actualización de estadísticas

---

## 🔒 Seguridad

### Verificaciones Automáticas:
- ✅ Usuario debe ser administrador
- ✅ Usuario a eliminar debe existir
- ✅ Confirmación doble requerida
- ✅ Operación atómica (todo o nada)

### Logs:
- Email del usuario eliminado
- ID del administrador que ejecutó
- Timestamp de la eliminación

---

## ⚠️ Casos de Uso

### ✅ Apropiados:
- Solicitud del usuario (GDPR)
- Cuentas fraudulentas confirmadas
- Cuentas duplicadas
- Cuentas de prueba

### ❌ NO Apropiados:
- Suspender temporalmente (usar bloqueo)
- Resolver disputas (investigar primero)
- Eliminar por error (no hay recuperación)

---

## 📧 Correos de Recuperación

### Verificar que se envió:
```
Supabase Dashboard → Logs → Auth
Buscar: "mail_type":"recovery"
```

### Instrucciones para usuarios:
```
1. Revisar bandeja de entrada
2. Revisar carpeta de SPAM
3. Buscar: noreply@mail.app.supabase.io
4. Esperar 5 minutos
5. Intentar de nuevo si no llega
```

### Rate Limiting:
- ⏰ 40 segundos entre solicitudes
- 📧 30 emails/hora (SMTP por defecto)
- ✅ Sin límite con SMTP personalizado

---

## 🎯 Acciones Recomendadas

### Inmediatas:
1. ✅ Probar eliminación de cuenta de prueba
2. 📧 Configurar SMTP personalizado
3. 🧪 Probar reset de contraseña
4. 📚 Capacitar a otros administradores

### A Mediano Plazo:
1. 📊 Implementar monitoreo de eliminaciones
2. 📝 Crear logs de auditoría
3. 🔔 Configurar alertas
4. 📈 Revisar métricas regularmente

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
