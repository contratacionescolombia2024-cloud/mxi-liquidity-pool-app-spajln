
# 🧪 Guía de Pruebas: Sistema de Registro Corregido

## Objetivo
Verificar que todas las correcciones del sistema de registro funcionan correctamente.

## Preparación
1. Tener la app abierta en la pantalla de registro
2. Tener acceso a un correo electrónico para verificación
3. Preparar diferentes combinaciones de datos de prueba

---

## Prueba 1: Email Inválido ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente EXCEPTO el email
3. En el campo de email, ingresar: `usuario@invalido` (sin .com o dominio completo)
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
⚠️ Correo Electrónico Inválido

El formato del correo electrónico no es válido.

Por favor verifica que:
- El correo tenga un formato válido (ejemplo@dominio.com)
- No contenga espacios
- Tenga un dominio válido
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE (sin llamar al servidor)
- El mensaje es claro y específico
- No se crea ningún usuario en la base de datos

---

## Prueba 2: Contraseña Corta ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente EXCEPTO la contraseña
3. En el campo de contraseña, ingresar: `12345` (5 caracteres)
4. En confirmar contraseña, ingresar: `12345`
5. Presionar "Crear Cuenta"

### Resultado Esperado:
```
⚠️ Contraseña Inválida

La contraseña no cumple con los requisitos de seguridad.

La contraseña debe:
- Tener al menos 6 caracteres
- Ser segura y difícil de adivinar

Por favor elige una contraseña más fuerte.
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje explica claramente el requisito
- No se crea ningún usuario

---

## Prueba 3: Nombre Incompleto ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente EXCEPTO el nombre
3. En el campo de nombre, ingresar solo: `Juan` (sin apellido)
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
⚠️ Nombre Incompleto

Por favor ingresa tu nombre completo.

Debes incluir:
- Tu nombre
- Tu apellido

Ejemplo: Juan Pérez
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje da un ejemplo claro
- No se crea ningún usuario

---

## Prueba 4: Número de Identificación Corto ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente EXCEPTO el ID
3. En el campo de ID, ingresar: `1234` (4 caracteres)
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
❌ Error

El número de identificación debe tener al menos 5 caracteres
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje es claro
- No se crea ningún usuario

---

## Prueba 5: Dirección Corta ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente EXCEPTO la dirección
3. En el campo de dirección, ingresar: `Calle 1` (menos de 10 caracteres)
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
❌ Error

Por favor ingresa una dirección completa (mínimo 10 caracteres)
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje especifica el requisito
- No se crea ningún usuario

---

## Prueba 6: Email Duplicado ❌

### Pasos:
1. Registrar un usuario con email: `test@ejemplo.com`
2. Intentar registrar OTRO usuario con el MISMO email: `test@ejemplo.com`
3. Presionar "Crear Cuenta"

### Resultado Esperado:
```
⚠️ Correo Ya Registrado

El correo electrónico test@ejemplo.com ya está registrado en el sistema.

Opciones:
- Intenta iniciar sesión si ya tienes una cuenta
- Usa otro correo electrónico
- Contacta a soporte si crees que esto es un error
```

### ✅ Criterio de Éxito:
- El mensaje aparece después de verificar en la base de datos
- El mensaje ofrece opciones claras
- No se crea un segundo usuario con el mismo email

---

## Prueba 7: Registro Exitoso ✅

### Pasos:
1. Ir a la pantalla de registro
2. Llenar TODOS los campos correctamente:
   - **Nombre:** Juan Pérez
   - **ID:** 123456789
   - **Dirección:** Calle 123 #45-67, Bogotá
   - **Email:** nuevo.usuario@ejemplo.com (que NO exista)
   - **Contraseña:** password123 (mínimo 6 caracteres)
   - **Confirmar Contraseña:** password123
3. Aceptar términos y condiciones
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
✅ ¡Registro Exitoso!

Tu cuenta ha sido creada exitosamente.

📧 Correo: nuevo.usuario@ejemplo.com

📬 IMPORTANTE: Hemos enviado un correo de verificación a tu bandeja de entrada.

Por favor:
- Revisa tu bandeja de entrada
- Revisa la carpeta de spam/correo no deseado
- Haz clic en el enlace de verificación

⚠️ Debes verificar tu correo antes de poder iniciar sesión.

Si no recibes el correo en 5 minutos, puedes solicitar un reenvío desde la pantalla de inicio de sesión.
```

### ✅ Criterio de Éxito:
- El mensaje de éxito aparece
- El usuario es redirigido a la pantalla de login
- Se crea el usuario en auth.users
- Se crea el perfil en la tabla users
- Se envía el email de verificación

---

## Prueba 8: Contraseñas No Coinciden ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente
3. En contraseña, ingresar: `password123`
4. En confirmar contraseña, ingresar: `password456` (diferente)
5. Presionar "Crear Cuenta"

### Resultado Esperado:
```
❌ Error

Las contraseñas no coinciden
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje es claro
- No se crea ningún usuario

---

## Prueba 9: Términos No Aceptados ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente
3. NO marcar la casilla de términos y condiciones
4. Presionar "Crear Cuenta"

### Resultado Esperado:
```
⚠️ Términos y Condiciones Requeridos

Debes aceptar los términos y condiciones para continuar
```

### ✅ Criterio de Éxito:
- El mensaje aparece INMEDIATAMENTE
- El mensaje es claro
- No se crea ningún usuario

---

## Prueba 10: Múltiples Intentos Rápidos ❌

### Pasos:
1. Ir a la pantalla de registro
2. Llenar todos los campos correctamente con emails diferentes
3. Presionar "Crear Cuenta" repetidamente (más de 30 veces en una hora)

### Resultado Esperado (después de ~30 intentos):
```
⏱️ Demasiados Intentos

Has realizado demasiados intentos de registro.

Por favor espera 5-10 minutos e intenta de nuevo.

Esto es una medida de seguridad para proteger el sistema.
```

### ✅ Criterio de Éxito:
- El rate limiting funciona
- El mensaje explica la razón
- El usuario sabe cuánto tiempo esperar

---

## Checklist de Verificación

Marcar cada prueba después de completarla:

- [ ] Prueba 1: Email Inválido
- [ ] Prueba 2: Contraseña Corta
- [ ] Prueba 3: Nombre Incompleto
- [ ] Prueba 4: ID Corto
- [ ] Prueba 5: Dirección Corta
- [ ] Prueba 6: Email Duplicado
- [ ] Prueba 7: Registro Exitoso
- [ ] Prueba 8: Contraseñas No Coinciden
- [ ] Prueba 9: Términos No Aceptados
- [ ] Prueba 10: Rate Limiting

---

## Verificación en Base de Datos

Después de un registro exitoso, verificar en Supabase:

### 1. Usuario en Auth
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'nuevo.usuario@ejemplo.com';
```

**Debe mostrar:**
- ✅ ID del usuario
- ✅ Email correcto
- ✅ email_confirmed_at = NULL (hasta que verifique)
- ✅ created_at con timestamp reciente

### 2. Perfil en Users
```sql
SELECT id, name, email, id_number, address, referral_code, email_verified
FROM users 
WHERE email = 'nuevo.usuario@ejemplo.com';
```

**Debe mostrar:**
- ✅ Mismo ID que en auth.users
- ✅ Nombre completo
- ✅ Email correcto
- ✅ ID number correcto
- ✅ Dirección correcta
- ✅ Código de referido generado (formato: MXI######)
- ✅ email_verified = false

### 3. Logs de Creación
```sql
SELECT event_type, success, error_message, created_at
FROM user_creation_logs 
WHERE user_id = 'ID-DEL-USUARIO'
ORDER BY created_at DESC;
```

**Debe mostrar:**
- ✅ event_type = 'trigger_started'
- ✅ event_type = 'profile_created'
- ✅ success = true
- ✅ Sin error_message

---

## Problemas Comunes y Soluciones

### Problema: "No se pudo crear el perfil"
**Solución:** 
1. Verificar que el trigger `on_auth_user_created` está activo
2. Verificar logs en `user_creation_logs`
3. Ejecutar manualmente: `SELECT create_missing_user_profile('USER_ID')`

### Problema: Email de verificación no llega
**Solución:**
1. Revisar carpeta de spam
2. Verificar configuración SMTP en Supabase
3. Reenviar email desde pantalla de login

### Problema: Rate limiting muy agresivo
**Solución:**
1. Verificar configuración en Supabase Dashboard
2. Ajustar límites si es necesario
3. Esperar el tiempo indicado

---

## Reporte de Resultados

Después de completar todas las pruebas, documentar:

1. **Pruebas Exitosas:** ___/10
2. **Pruebas Fallidas:** ___/10
3. **Problemas Encontrados:** 
   - _______________________
   - _______________________
4. **Observaciones:**
   - _______________________
   - _______________________

---

## Conclusión

Si todas las pruebas pasan:
✅ **El sistema de registro está funcionando correctamente**

Si alguna prueba falla:
❌ **Revisar logs y documentar el problema específico**

**Fecha de Prueba:** _______________
**Probado por:** _______________
**Resultado General:** ✅ APROBADO / ❌ REQUIERE CORRECCIÓN
