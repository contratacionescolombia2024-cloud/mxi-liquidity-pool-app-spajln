
# 🎴 Tarjeta de Referencia Rápida - Administrador

## 🗑️ Eliminar Cuenta de Usuario

### Acceso:
```
Panel Admin → Eliminar Cuentas
```

### Pasos:
1. 🔍 Buscar usuario
2. 👆 Tocar en el usuario
3. 📋 Revisar detalles
4. ⚠️ Scroll a "Zona de Peligro"
5. 🗑️ Tocar "Eliminar Cuenta Permanentemente"
6. ✅ Confirmar

### ⚠️ Advertencia:
**NO SE PUEDE DESHACER**

---

## 📧 Correos de Recuperación

### Estado:
✅ **Funcionando** (correos se envían)

### Problema:
📧 Van a **SPAM**

### Solución para Usuario:
```
1. Revisar SPAM
2. Buscar: noreply@mail.app.supabase.io
3. Marcar como "No es spam"
4. Hacer clic en el enlace
```

### Solución Permanente:
🔧 **Configurar SMTP**

**Recomendado**: SendGrid
- URL: https://sendgrid.com
- Gratis: 100 emails/día
- Configurar en: Supabase → Settings → Auth → SMTP

---

## 🔗 Enlaces Rápidos

### Supabase Dashboard:
- **Proyecto**: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn
- **Auth Settings**: .../settings/auth
- **Email Templates**: .../auth/templates
- **Logs**: .../logs/explorer

### Documentación:
- `ADMIN_USER_DELETION_GUIDE.md`
- `PASSWORD_RESET_TROUBLESHOOTING.md`
- `GUIA_RAPIDA_ADMIN.md`

---

## ⚡ Comandos Rápidos

### Verificar correo enviado:
```
Supabase → Logs → Buscar "mail_type:recovery"
```

### Verificar eliminación:
```
Supabase → Table Editor → users → Buscar por email
```

---

## 🆘 Soporte Rápido

### Usuario no recibe correo:
1. ✅ Verificar en logs
2. 📧 Pedir revisar SPAM
3. ⏰ Esperar 40 segundos
4. 🔧 Configurar SMTP

### Error al eliminar:
1. ✅ Verificar permisos
2. 📊 Revisar logs
3. 📚 Consultar guía

---

**v1.0.0** | Enero 2025
