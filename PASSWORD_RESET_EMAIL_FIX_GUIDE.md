
# Guía para Solucionar el Problema de Envío de Correos de Recuperación de Contraseña

## 🔍 Problema Identificado

El usuario reporta que al solicitar recuperación de contraseña, la aplicación no envía el correo electrónico.

## ✅ Verificaciones Realizadas

### 1. Código de la Aplicación
El código en `app/(auth)/login.tsx` está **CORRECTO**:

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
  redirectTo: 'https://natively.dev/reset-password',
});
```

### 2. Página de Reset Password
La página `app/(auth)/reset-password.tsx` está **IMPLEMENTADA** y funcional.

## 🔧 Soluciones a Implementar

### Paso 1: Verificar Configuración de Email en Supabase

1. **Ir al Dashboard de Supabase**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn

2. **Navegar a Authentication → Email Templates**:
   - Ir a: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/templates

3. **Verificar la plantilla "Reset Password"**:
   - Asegurarse de que la plantilla esté habilitada
   - Verificar que el contenido sea correcto

### Paso 2: Configurar la Plantilla de Reset Password

La plantilla debe contener:

```html
<h2>Restablecer Contraseña</h2>

<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p>
  <a href="{{ .ConfirmationURL }}">Restablecer Contraseña</a>
</p>

<p>O copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Este enlace expirará en 24 horas.</p>

<p>Si no solicitaste restablecer tu contraseña, ignora este correo.</p>
```

### Paso 3: Verificar URL de Redirección

1. **Ir a Authentication → URL Configuration**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/url-configuration

2. **Agregar URL de redirección**:
   - Agregar: `https://natively.dev/reset-password`
   - Agregar también: `https://natively.dev/*` (wildcard para todas las rutas)

3. **Verificar Site URL**:
   - Debe ser: `https://natively.dev`

### Paso 4: Configurar SMTP (Recomendado para Producción)

#### Opción A: Usar SMTP Personalizado

1. **Ir a Authentication → Email Settings**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/email-settings

2. **Configurar SMTP**:
   ```
   SMTP Host: smtp.gmail.com (o tu proveedor)
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Password: tu-contraseña-de-aplicación
   Sender Email: noreply@tudominio.com
   Sender Name: MXI Strategic
   ```

#### Opción B: Usar el SMTP por Defecto de Supabase

- **Límite**: 30 emails por hora
- **Disponibilidad**: Best-effort
- **Recomendación**: Solo para desarrollo/pruebas

### Paso 5: Verificar Rate Limits

1. **Ir a Authentication → Rate Limits**:
   - Verificar que no se hayan excedido los límites
   - Límite por defecto: 30 emails/hora con SMTP integrado

2. **Aumentar límites si es necesario**:
   - Configurar SMTP personalizado para eliminar límites

### Paso 6: Probar el Flujo Completo

1. **Solicitar reset de contraseña**:
   ```typescript
   // En la app
   await supabase.auth.resetPasswordForEmail('usuario@ejemplo.com', {
     redirectTo: 'https://natively.dev/reset-password',
   });
   ```

2. **Verificar en el email**:
   - Revisar bandeja de entrada
   - Revisar spam/correo no deseado
   - Verificar que el enlace funcione

3. **Hacer clic en el enlace**:
   - Debe redirigir a `https://natively.dev/reset-password`
   - Debe mostrar el formulario de nueva contraseña

4. **Ingresar nueva contraseña**:
   - Debe actualizar la contraseña
   - Debe mostrar mensaje de éxito
   - Debe redirigir al login

## 🐛 Debugging

### Verificar Logs de Supabase

1. **Ir a Logs**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/logs/explorer

2. **Buscar errores de email**:
   ```sql
   SELECT * FROM auth.audit_log_entries
   WHERE action = 'password_recovery'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

### Verificar en la Consola del Navegador

```javascript
// Verificar respuesta de resetPasswordForEmail
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://natively.dev/reset-password',
});

console.log('Reset password response:', { data, error });
```

### Errores Comunes

1. **"Email not sent"**:
   - Verificar configuración SMTP
   - Verificar rate limits
   - Verificar que el email existe en la base de datos

2. **"Invalid redirect URL"**:
   - Agregar URL a la lista de URLs permitidas
   - Verificar que la URL sea exacta (con/sin trailing slash)

3. **"User not found"**:
   - Verificar que el email esté registrado
   - Verificar que el usuario esté en `auth.users`

## 📧 Configuración Recomendada para Producción

### Usar SendGrid (Recomendado)

1. **Crear cuenta en SendGrid**:
   - URL: https://sendgrid.com

2. **Obtener API Key**:
   - Ir a Settings → API Keys
   - Crear nueva API Key con permisos de envío

3. **Configurar en Supabase**:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [TU_API_KEY_DE_SENDGRID]
   Sender Email: noreply@tudominio.com
   Sender Name: MXI Strategic
   ```

### Usar Gmail (Para Desarrollo)

1. **Habilitar "App Passwords"**:
   - Ir a Google Account → Security
   - Habilitar 2-Step Verification
   - Crear App Password

2. **Configurar en Supabase**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Password: [APP_PASSWORD_GENERADO]
   Sender Email: tu-email@gmail.com
   Sender Name: MXI Strategic
   ```

## ✅ Checklist de Verificación

- [ ] Plantilla de "Reset Password" configurada en Supabase
- [ ] URL de redirección agregada a la lista permitida
- [ ] Site URL configurada correctamente
- [ ] SMTP configurado (personalizado o por defecto)
- [ ] Rate limits verificados
- [ ] Página de reset password implementada (`/reset-password`)
- [ ] Código de `resetPasswordForEmail` correcto
- [ ] Probado el flujo completo
- [ ] Verificado que los emails llegan
- [ ] Verificado que el enlace funciona
- [ ] Verificado que se puede cambiar la contraseña

## 🆘 Si el Problema Persiste

1. **Verificar en Mailpit (Desarrollo Local)**:
   ```bash
   supabase status
   # Buscar la URL de Mailpit
   # Abrir en el navegador
   ```

2. **Contactar Soporte de Supabase**:
   - Si el problema persiste después de todas las verificaciones
   - Proporcionar logs y configuración

3. **Verificar Estado de Supabase**:
   - URL: https://status.supabase.com
   - Verificar si hay problemas conocidos

## 📝 Notas Adicionales

### Seguridad
- Los enlaces de reset expiran en 24 horas
- Solo se puede usar una vez
- El token es único y seguro

### UX
- Mostrar mensaje claro al usuario
- Indicar que revise spam
- Proporcionar opción de reenviar

### Monitoreo
- Registrar intentos de reset
- Monitorear tasa de éxito
- Alertar si hay muchos fallos

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
