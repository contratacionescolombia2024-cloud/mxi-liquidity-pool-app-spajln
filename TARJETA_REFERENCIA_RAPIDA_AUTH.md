
# 🚀 Tarjeta de Referencia Rápida - Autenticación

## 📧 Información de Correos

### Remitente
```
noreply@mail.app.supabase.io
```

### Asuntos
- **Recuperación**: "Reset Your Password"
- **Verificación**: "Confirm Your Email"

### ⚠️ SIEMPRE REVISAR SPAM

---

## 🔗 URLs Importantes

### Producción
```
https://natively.dev
```

### Redirect URLs
```
https://natively.dev/email-confirmed
https://natively.dev/reset-password
```

---

## ⏰ Tiempos y Límites

| Acción | Tiempo |
|--------|--------|
| Expiración de enlaces | 24 horas |
| Espera entre solicitudes | 40 segundos |
| Tiempo de entrega de correo | 1-5 minutos |

---

## 🔧 Solución Rápida de Problemas

### "No recibo el correo"
1. ✅ Revisar SPAM (90% de casos)
2. ⏰ Esperar 5 minutos
3. 🔍 Buscar: `noreply@mail.app.supabase.io`
4. 🔄 Reenviar después de 40 segundos

### "El enlace no funciona"
1. ⏰ Verificar que no hayan pasado 24 horas
2. 🔄 El enlace solo funciona una vez
3. 📧 Solicitar un nuevo enlace

### "Dice que espere 40 segundos"
1. ⏱️ Es normal (seguridad)
2. ⏰ Esperar 40 segundos
3. 🔄 Intentar de nuevo

---

## 📊 Verificación Rápida

### Verificar Estado de Usuario
```sql
SELECT 
  email,
  email_verified,
  email_confirmed_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE email = 'correo@ejemplo.com';
```

### Verificar Sincronización
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN email_verified = true THEN 1 ELSE 0 END) as verified
FROM public.users;
```

---

## 🎯 Tests Rápidos

### Test Recuperación (2 min)
```
1. Login > "¿Olvidaste tu contraseña?"
2. Ingresar correo
3. Revisar email (y SPAM)
4. Click en enlace
5. Cambiar contraseña
6. Login con nueva contraseña
```

### Test Verificación (2 min)
```
1. Login con cuenta no verificada
2. Click "Reenviar Correo"
3. Revisar email (y SPAM)
4. Click en enlace
5. Login nuevamente
```

---

## 📞 Contactos

### Supabase Dashboard
```
https://supabase.com/dashboard
```

### Logs
```
Dashboard > Authentication > Logs
```

### Base de Datos
```
Dashboard > Table Editor
```

---

## ✅ Checklist Rápido

- [ ] URLs configuradas correctamente
- [ ] Trigger de sincronización activo
- [ ] Correos llegando (revisar SPAM)
- [ ] Enlaces redirigen a producción
- [ ] Mensajes claros para usuarios
- [ ] Rate limiting funcionando

---

## 🚨 Alertas Importantes

### ⚠️ SPAM
**Los correos de Supabase van a SPAM en:**
- Gmail
- Outlook
- Hotmail
- Yahoo

### ⏰ EXPIRACIÓN
**Los enlaces expiran después de:**
- 24 horas desde envío
- Usarse una vez

### 🔒 SEGURIDAD
**Límites de tasa:**
- 40 segundos entre solicitudes
- Previene abuso del sistema

---

## 📝 Notas Rápidas

```
Remitente: noreply@mail.app.supabase.io
Producción: https://natively.dev
Expiración: 24 horas
Rate Limit: 40 segundos
SPAM: ⚠️ SIEMPRE REVISAR
```

---

**Última Actualización**: 9 de Diciembre, 2025
**Estado**: ✅ FUNCIONANDO CORRECTAMENTE
