
# Guía de Configuración SMTP para Verificación de Email en Supabase

## Resumen

Esta guía explica cómo conectar un proveedor SMTP personalizado para la verificación de correo electrónico en Supabase Auth.

## ¿Por qué necesitas un proveedor SMTP personalizado?

El servicio SMTP predeterminado de Supabase tiene limitaciones importantes:

- **Solo envía a direcciones autorizadas**: Solo puede enviar emails a miembros del equipo del proyecto
- **Límite de tasa muy bajo**: Solo 30 emails por hora
- **Sin garantía de SLA**: Servicio de mejor esfuerzo, no recomendado para producción
- **Solo para desarrollo**: Diseñado para pruebas y desarrollo, no para uso en producción

## Proveedores SMTP Recomendados

Puedes usar cualquier proveedor que soporte el protocolo SMTP. Algunos recomendados:

1. **Resend** - https://resend.com/docs/send-with-supabase-smtp
2. **AWS SES** - https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html
3. **SendGrid (Twilio)** - https://www.twilio.com/docs/sendgrid/for-developers/sending-email/getting-started-smtp
4. **Postmark** - https://postmarkapp.com/developer/user-guide/send-email-with-smtp
5. **Brevo** - https://help.brevo.com/hc/en-us/articles/7924908994450
6. **Mailgun**
7. **ZeptoMail** - https://www.zoho.com/zeptomail/help/smtp-home.html

## Pasos para Configurar SMTP

### Paso 1: Obtener Credenciales SMTP

Regístrate con un proveedor SMTP y obtén las siguientes credenciales:

- **Host SMTP**: Dirección del servidor (ej: `smtp.resend.com`)
- **Puerto SMTP**: Generalmente 587 (TLS) o 465 (SSL)
- **Usuario SMTP**: Tu nombre de usuario o clave API
- **Contraseña SMTP**: Tu contraseña o token de autenticación
- **Email "From"**: Dirección de correo del remitente (ej: `no-reply@tudominio.com`)

### Paso 2: Configurar en el Dashboard de Supabase

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Navega a **Authentication > Settings** (Autenticación > Configuración)
3. Desplázate hasta la sección **"Email"**
4. Habilita **"Enable Custom SMTP"** (Habilitar SMTP Personalizado)
5. Ingresa tus credenciales SMTP:
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - Sender Email
   - Sender Name (opcional)
6. Guarda los cambios

### Paso 3: Configurar vía Management API (Alternativa)

También puedes configurar SMTP usando la API de Supabase:

```bash
# Obtén tu token de acceso desde https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="tu-token-de-acceso"
export PROJECT_REF="tu-project-ref"

# Configurar SMTP personalizado
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_email_enabled": true,
    "mailer_secure_email_change_enabled": true,
    "mailer_autoconfirm": false,
    "smtp_admin_email": "no-reply@tudominio.com",
    "smtp_host": "smtp.tuproveedor.com",
    "smtp_port": 587,
    "smtp_user": "tu-usuario-smtp",
    "smtp_pass": "tu-contraseña-smtp",
    "smtp_sender_name": "Nombre de tu App"
  }'
```

### Paso 4: Ajustar Límites de Tasa

Después de configurar SMTP personalizado, el límite predeterminado es de 30 mensajes por hora. Para ajustarlo:

1. Ve a **Authentication > Rate Limits** en el Dashboard
2. Ajusta el límite de emails según tus necesidades
3. Guarda los cambios

## Configuración en tu Aplicación

Tu código de registro ya está configurado correctamente. Asegúrate de incluir el `emailRedirectTo`:

```typescript
await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    emailRedirectTo: 'https://natively.dev/email-confirmed'
  }
});
```

## Verificación de Configuración

Para verificar que tu SMTP está funcionando:

1. Intenta registrar un nuevo usuario
2. Revisa los logs en **Authentication > Logs** del Dashboard
3. Verifica que el email llegue a la bandeja de entrada del usuario
4. Si hay errores, revisa los logs para identificar el problema

## Mejores Prácticas

### 1. Configurar DKIM, DMARC y SPF

Trabaja con tu proveedor SMTP para configurar estos registros DNS. Esto mejorará significativamente la entregabilidad de tus emails.

### 2. Usar un Dominio Personalizado

Configura un dominio personalizado para tu proyecto Supabase para reducir la probabilidad de que tus emails sean marcados como spam.

### 3. Separar Emails de Autenticación y Marketing

- Usa dominios separados: `auth.tudominio.com` vs `marketing.tudominio.com`
- Usa direcciones "From" separadas
- Usa servicios SMTP diferentes si es posible

### 4. Protección contra Abuso

- Habilita **CAPTCHA** en la configuración de Auth
- Considera usar autenticación social (OAuth) cuando sea posible
- No deshabilites las confirmaciones de email bajo presión

### 5. Tener un Proveedor de Respaldo

Mantén un segundo proveedor SMTP configurado en caso de que el primario tenga problemas.

## Solución de Problemas

### Los emails no llegan

1. **Revisa los logs de Auth**: Ve a **Logs > Auth Logs** en el Dashboard
2. **Verifica las credenciales SMTP**: Asegúrate de que sean correctas
3. **Revisa los logs del proveedor SMTP**: La mayoría tienen dashboards con logs de entrega
4. **Verifica listas de supresión**: Algunos proveedores mantienen listas de emails bloqueados
5. **Revisa la carpeta de spam**: Los emails pueden estar siendo filtrados

### Error "Email address not authorized"

Esto significa que aún estás usando el SMTP predeterminado de Supabase. Asegúrate de haber habilitado y configurado correctamente el SMTP personalizado.

### Límite de tasa excedido

Si ves errores de límite de tasa:
1. Ve a **Authentication > Rate Limits**
2. Aumenta el límite de emails por hora
3. Considera implementar un sistema de cola si esperas picos de tráfico

## Ejemplo de Configuración con Resend

Resend es una excelente opción para emails transaccionales:

1. Regístrate en https://resend.com
2. Verifica tu dominio
3. Obtén tu API Key
4. Configura en Supabase:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `resend`
   - **SMTP Password**: Tu API Key de Resend
   - **Sender Email**: `no-reply@tudominio.com`

## Plantillas de Email

Puedes personalizar las plantillas de email en **Authentication > Email Templates**. Las plantillas soportan variables como:

- `{{ .ConfirmationURL }}` - URL de confirmación
- `{{ .Token }}` - Código OTP de 6 dígitos
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL de tu sitio
- `{{ .Email }}` - Email del usuario

## Recursos Adicionales

- [Documentación oficial de Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Guía de producción](https://supabase.com/docs/guides/platform/going-into-prod)
- [Límites de tasa de Auth](https://supabase.com/docs/guides/platform/going-into-prod#auth-rate-limits)

## Soporte

Si tienes problemas después de seguir esta guía:

1. Revisa los logs en el Dashboard de Supabase
2. Contacta al soporte de tu proveedor SMTP
3. Abre un ticket de soporte en https://supabase.com/dashboard/support/new

---

**Nota Importante**: El SMTP predeterminado de Supabase es SOLO para desarrollo. Debes configurar un proveedor SMTP personalizado antes de lanzar tu aplicación a producción.
