
# Solución al Problema de Correos de Recuperación de Contraseña

## 🔍 Diagnóstico

Según los logs de Supabase, **los correos SÍ se están enviando**:

```
"mail_type":"recovery"
"msg":"mail.send"
"mail_to":"mxistrategic@gmail.com"
```

## ✅ El Problema NO es el Código

El código de la aplicación está funcionando correctamente. Los correos se están enviando desde Supabase.

## 🎯 Posibles Causas

### 1. Los correos están llegando a SPAM

**Solución**:
- Revisar la carpeta de SPAM/Correo no deseado
- Marcar los correos de `noreply@mail.app.supabase.io` como "No es spam"
- Agregar el remitente a la lista de contactos

### 2. SMTP por Defecto de Supabase (Limitado)

El SMTP integrado de Supabase tiene limitaciones:
- **Límite**: 30 emails por hora
- **Confiabilidad**: Best-effort (no garantizado)
- **Deliverability**: Puede ser marcado como spam

**Solución**: Configurar SMTP personalizado (ver abajo)

### 3. Rate Limiting

Los logs muestran:
```
"error":"429: For security purposes, you can only request this after 40 seconds."
```

**Solución**:
- Esperar 40 segundos entre solicitudes
- Informar al usuario sobre el límite de tiempo

## 🔧 Soluciones Recomendadas

### Solución 1: Verificar Carpeta de Spam

1. **Revisar SPAM**:
   - Abrir Gmail/Outlook/etc.
   - Ir a la carpeta de Spam
   - Buscar correos de `noreply@mail.app.supabase.io`

2. **Marcar como seguro**:
   - Seleccionar el correo
   - Marcar como "No es spam"
   - Mover a la bandeja de entrada

### Solución 2: Configurar SMTP Personalizado (RECOMENDADO)

#### Opción A: SendGrid (Recomendado para Producción)

1. **Crear cuenta en SendGrid**:
   - Ir a: https://sendgrid.com
   - Crear cuenta gratuita (100 emails/día gratis)

2. **Obtener API Key**:
   - Settings → API Keys
   - Create API Key
   - Copiar la API Key

3. **Configurar en Supabase**:
   - Ir a: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/settings/auth
   - Scroll hasta "SMTP Settings"
   - Configurar:
     ```
     SMTP Host: smtp.sendgrid.net
     SMTP Port: 587
     SMTP User: apikey
     SMTP Password: [TU_API_KEY_DE_SENDGRID]
     Sender Email: noreply@tudominio.com
     Sender Name: MXI Strategic
     ```

#### Opción B: Gmail (Para Desarrollo/Pruebas)

1. **Habilitar App Password**:
   - Ir a: https://myaccount.google.com/security
   - Habilitar "2-Step Verification"
   - Ir a "App passwords"
   - Generar contraseña para "Mail"

2. **Configurar en Supabase**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: tu-email@gmail.com
   SMTP Password: [APP_PASSWORD_GENERADO]
   Sender Email: tu-email@gmail.com
   Sender Name: MXI Strategic
   ```

#### Opción C: Resend (Moderno y Fácil)

1. **Crear cuenta en Resend**:
   - Ir a: https://resend.com
   - Crear cuenta (3,000 emails/mes gratis)

2. **Obtener API Key**:
   - Dashboard → API Keys
   - Create API Key

3. **Configurar en Supabase**:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [TU_API_KEY_DE_RESEND]
   Sender Email: noreply@tudominio.com
   Sender Name: MXI Strategic
   ```

### Solución 3: Verificar Configuración de URLs en Supabase

1. **Ir a URL Configuration**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/url-configuration

2. **Verificar Site URL**:
   - Debe ser: `https://natively.dev`

3. **Agregar Redirect URLs**:
   - Agregar: `https://natively.dev/reset-password`
   - Agregar: `https://natively.dev/*` (wildcard)
   - Agregar: `http://localhost:*` (para desarrollo)

### Solución 4: Personalizar Plantilla de Email

1. **Ir a Email Templates**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn/auth/templates

2. **Editar "Reset Password" template**:

```html
<h2>Restablecer Contraseña - MXI Strategic</h2>

<p>Hola,</p>

<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta MXI Strategic.</p>

<p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #FFD700; 
            color: #000; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            display: inline-block;">
    Restablecer Contraseña
  </a>
</p>

<p>O copia y pega este enlace en tu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .ConfirmationURL }}</p>

<p><strong>⚠️ Importante:</strong></p>
<ul>
  <li>Este enlace expirará en 24 horas</li>
  <li>Solo se puede usar una vez</li>
  <li>Si no solicitaste este cambio, ignora este correo</li>
</ul>

<p>Saludos,<br>
Equipo MXI Strategic</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-size: 12px; color: #999;">
  Este es un correo automático, por favor no respondas a este mensaje.
  Si tienes problemas, contacta a soporte en la aplicación.
</p>
```

## 🧪 Cómo Probar

### Prueba 1: Verificar que el correo llega

1. Solicitar reset de contraseña
2. Esperar 1-2 minutos
3. Revisar bandeja de entrada
4. Revisar carpeta de spam
5. Verificar que el correo llegó

### Prueba 2: Verificar que el enlace funciona

1. Hacer clic en el enlace del correo
2. Debe redirigir a: `https://natively.dev/reset-password`
3. Debe mostrar el formulario de nueva contraseña
4. Ingresar nueva contraseña
5. Confirmar que se actualiza correctamente

### Prueba 3: Verificar rate limiting

1. Solicitar reset de contraseña
2. Intentar solicitar de nuevo inmediatamente
3. Debe mostrar error de "esperar 40 segundos"
4. Esperar 40 segundos
5. Intentar de nuevo - debe funcionar

## 📊 Monitoreo

### Ver Logs de Supabase

```sql
-- Ver intentos de reset de contraseña
SELECT 
  created_at,
  email,
  raw_user_meta_data->>'action' as action
FROM auth.users
WHERE email = 'usuario@ejemplo.com'
ORDER BY created_at DESC;
```

### Ver Emails Enviados

En los logs de Supabase (Auth):
- Buscar: `"mail_type":"recovery"`
- Verificar: `"msg":"mail.send"`
- Confirmar: Email del destinatario

## ⚠️ Advertencias para Usuarios

### Mensaje Mejorado en la App

Cuando el usuario solicita reset de contraseña, mostrar:

```
✅ Correo de recuperación enviado

Por favor revisa tu bandeja de entrada y también la carpeta de SPAM.

El correo viene de: noreply@mail.app.supabase.io

Si no recibes el correo en 5 minutos:
1. Revisa la carpeta de spam
2. Verifica que el email sea correcto
3. Espera 40 segundos e intenta de nuevo
4. Contacta a soporte si el problema persiste
```

## 🔒 Seguridad

### Rate Limits Actuales

- **40 segundos** entre solicitudes del mismo usuario
- **30 emails/hora** con SMTP integrado de Supabase
- **24 horas** de validez del enlace

### Recomendaciones

1. ✅ Mantener rate limits para prevenir abuso
2. ✅ Usar SMTP personalizado para mejor deliverability
3. ✅ Personalizar plantilla de email para mejor UX
4. ✅ Monitorear logs regularmente

## 📞 Soporte al Usuario

### Si el usuario reporta que no recibe el correo:

1. **Verificar en logs**:
   - Confirmar que el correo se envió
   - Ver timestamp del envío

2. **Instrucciones al usuario**:
   - Revisar spam
   - Verificar email correcto
   - Esperar 5 minutos
   - Intentar de nuevo después de 40 segundos

3. **Alternativa manual**:
   - El administrador puede resetear la contraseña manualmente
   - O crear una nueva cuenta si es necesario

## ✅ Checklist de Implementación

- [x] Código de reset password implementado
- [x] Página de reset password creada
- [x] Logs verificados - emails se están enviando
- [ ] Configurar SMTP personalizado (RECOMENDADO)
- [ ] Personalizar plantilla de email
- [ ] Agregar URLs de redirección en Supabase
- [ ] Probar flujo completo
- [ ] Capacitar a usuarios sobre revisar spam

## 🎯 Acción Inmediata Requerida

### Para el Administrador del Proyecto:

1. **Ir al Dashboard de Supabase**:
   - URL: https://supabase.com/dashboard/project/aeyfnjuatbtcauiumbhn

2. **Configurar SMTP Personalizado**:
   - Settings → Auth → SMTP Settings
   - Usar SendGrid, Gmail o Resend
   - Probar envío de correo

3. **Verificar URLs de Redirección**:
   - Auth → URL Configuration
   - Agregar: `https://natively.dev/reset-password`
   - Agregar: `https://natively.dev/*`

4. **Personalizar Plantilla**:
   - Auth → Email Templates
   - Editar "Reset Password"
   - Usar la plantilla proporcionada arriba

5. **Probar**:
   - Solicitar reset desde la app
   - Verificar que el correo llega
   - Verificar que el enlace funciona
   - Confirmar que se puede cambiar la contraseña

## 📝 Notas Finales

- ✅ **Los correos SÍ se están enviando** (confirmado en logs)
- ⚠️ **Probablemente están en SPAM** (SMTP por defecto de Supabase)
- 🔧 **Solución**: Configurar SMTP personalizado
- 📧 **Alternativa**: Instruir a usuarios a revisar spam

---

**Última actualización**: Enero 2025
**Estado**: ✅ Diagnóstico Completo | 🔧 Configuración Pendiente
