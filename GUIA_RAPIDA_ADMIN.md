
# 🚀 Guía Rápida para Administradores

## 📋 Nuevas Funcionalidades

### 1. 🗑️ Eliminar Cuentas de Usuario

#### Acceso Rápido:
```
Panel de Administración → Eliminar Cuentas
```

#### Pasos:
1. Buscar usuario (nombre, email, ID o código)
2. Tocar en el usuario
3. Revisar detalles
4. Scroll hasta "Zona de Peligro"
5. Tocar "Eliminar Cuenta Permanentemente"
6. Confirmar

#### ⚠️ Advertencia:
- **NO SE PUEDE DESHACER**
- Elimina TODOS los datos del usuario
- Solo para casos justificados

---

### 2. 📧 Correos de Recuperación de Contraseña

#### Estado Actual:
✅ **Los correos SÍ se están enviando**

#### Problema:
📧 Probablemente están llegando a **SPAM**

#### Solución para Usuarios:
1. Revisar carpeta de SPAM
2. Buscar correos de: `noreply@mail.app.supabase.io`
3. Marcar como "No es spam"
4. Esperar 40 segundos entre solicitudes

#### Solución Permanente (Recomendada):
🔧 **Configurar SMTP Personalizado**

**Opción 1: SendGrid** (Recomendado)
- Gratis: 100 emails/día
- URL: https://sendgrid.com
- Configurar en: Supabase → Settings → Auth → SMTP

**Opción 2: Gmail** (Desarrollo)
- Habilitar App Password
- Configurar en Supabase

**Opción 3: Resend** (Moderno)
- Gratis: 3,000 emails/mes
- URL: https://resend.com
- Configurar en Supabase

---

## 🔗 Enlaces Útiles

### Dashboard de Supabase:
- **Proyecto**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn
- **Auth Settings**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/settings/auth
- **Email Templates**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/templates
- **URL Configuration**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/url-configuration
- **Logs**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/logs/explorer

### Documentación:
- `ADMIN_USER_DELETION_GUIDE.md` - Guía de eliminación
- `PASSWORD_RESET_TROUBLESHOOTING.md` - Solución de correos
- `IMPLEMENTACION_COMPLETA_RESUMEN.md` - Resumen completo

---

## 🆘 Soporte Rápido

### Usuario no recibe correo de reset:
1. ✅ Verificar en logs que se envió
2. 📧 Pedir que revise SPAM
3. ⏰ Verificar que esperó 40 segundos
4. 🔧 Configurar SMTP si persiste

### Error al eliminar cuenta:
1. ✅ Verificar permisos de admin
2. 📊 Revisar logs de base de datos
3. 🔍 Verificar que el usuario existe
4. 📝 Consultar documentación

---

## ⚡ Acciones Rápidas

### Eliminar Cuenta:
```
Admin Panel → Eliminar Cuentas → Buscar → Seleccionar → Eliminar
```

### Verificar Correo Enviado:
```
Supabase Dashboard → Logs → Buscar "mail_type:recovery"
```

### Configurar SMTP:
```
Supabase Dashboard → Settings → Auth → SMTP Settings
```

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
