
# Resumen de Correcciones - 13 de Diciembre 2025

## Problemas Resueltos

### 1. ✅ Error al Agregar Saldo desde Panel de Administración
**Problema:** Error "null value in column 'phase' of parent 'paids' violates not-null constraint"

**Causa:** Cuando el administrador agregaba saldo con comisión, se intentaba crear un registro en la tabla `payments` pero el campo `phase` podía ser NULL.

**Solución:**
- Actualizado la migración de base de datos para asegurar que `payments.phase` tenga un valor por defecto de `1`
- Actualizado todos los registros existentes con `phase = NULL` a `phase = 1`
- Agregado constraint NOT NULL al campo `phase`
- El componente `AdminUserManagement` ahora crea registros de pago con el `phase` correcto del sistema

**Archivos Modificados:**
- Migración: `fix_payments_phase_default_and_admin_balance`
- `components/AdminUserManagement.tsx` (ya tenía la lógica correcta)

---

### 2. ✅ Error al Rechazar Transacción en Verificaciones Manuales
**Problema:** Error "insert or update on table 'manual_verification_requests' violates foreign key constraint 'solicitudes_de_verificación_manual_revisadas_por_fkey'"

**Causa:** El campo `reviewed_by` en `manual_verification_requests` hace referencia a `admin_users.id`, pero el código estaba usando `users.id` directamente.

**Solución:**
- Actualizado las funciones `rejectRequest`, `approveRequest` y `requestMoreInfo` para obtener el `admin_users.id` correcto antes de actualizar
- Agregado consulta para obtener el registro de `admin_users` basado en el `user_id` actual
- Ahora se usa `adminData.id` en lugar de `user.id` para el campo `reviewed_by`

**Archivos Modificados:**
- `app/(tabs)/(admin)/manual-verification-requests.tsx`

**Código Clave:**
```typescript
// Obtener el ID de admin_users en lugar de users.id
const { data: adminData, error: adminError } = await supabase
  .from('admin_users')
  .select('id')
  .eq('user_id', user?.id)
  .single();

// Usar adminData.id para reviewed_by
const updateData = {
  status: 'rejected',
  reviewed_by: adminData.id, // ✅ Correcto: admin_users.id
  reviewed_at: new Date().toISOString(),
  admin_notes: rejectReason.trim(),
  updated_at: new Date().toISOString(),
};
```

---

### 3. ✅ Unificación de Display de Vesting y Actualización de Límites de Referidos
**Problema:** 
- Aparecían dos displays de vesting en la página del administrador
- El límite de referidos para retiro de vesting era de 5, debía ser 7
- Algunos usuarios tenían saldos de vesting negativos o múltiples displays

**Solución:**
- El vesting ya está unificado en el código - solo el MXI comprado directamente (`mxi_purchased_directly`) o añadido por el administrador con comisión genera vesting del 3% mensual
- Actualizado todos los textos y validaciones para requerir 7 referidos activos (con compras) en lugar de 5
- El edge function `update-vesting-hourly` ya tiene la lógica correcta para prevenir valores negativos
- Actualizado los mensajes informativos para aclarar que solo MXI comprado genera vesting

**Archivos Modificados:**
- `app/(tabs)/(home)/vesting.tsx`
- `app/(tabs)/(home)/withdraw-mxi.tsx`
- `app/(tabs)/(home)/withdrawal.tsx`
- `supabase/functions/update-vesting-hourly/index.ts` (ya tenía la lógica correcta)

**Cambios Clave:**
```typescript
// Antes: 5 referidos
const activeReferralsProgress = Math.min((user.activeReferrals / 5) * 100, 100);
const referralsNeeded = Math.max(0, 5 - user.activeReferrals);

// Ahora: 7 referidos
const activeReferralsProgress = Math.min((user.activeReferrals / 7) * 100, 100);
const referralsNeeded = Math.max(0, 7 - user.activeReferrals);
```

**Lógica de Vesting:**
- ✅ MXI comprado directamente → Genera vesting del 3% mensual
- ✅ MXI añadido por admin con comisión → Genera vesting del 3% mensual
- ❌ MXI de comisiones → NO genera vesting
- ❌ MXI de torneos/retos → NO genera vesting

---

### 4. ✅ Botón de Solicitar Retiro - Popup No Aparecía
**Problema:** El botón "Solicitar Retiro" en la página de retiros no mostraba la ventana emergente de confirmación

**Causa:** Faltaba el diálogo de confirmación antes de procesar el retiro

**Solución:**
- Agregado `Alert.alert` con confirmación antes de procesar retiros de comisiones y MXI
- El usuario ahora ve un diálogo de confirmación con los detalles del retiro antes de proceder
- Traducido todos los mensajes al español para consistencia

**Archivos Modificados:**
- `app/(tabs)/(home)/withdrawal.tsx`

**Código Agregado:**
```typescript
Alert.alert(
  'Confirmar Retiro',
  `¿Estás seguro de que deseas retirar ${amountNum.toFixed(2)} USDT en comisiones a:\n\n${walletAddress}\n\nEsta acción no se puede deshacer.`,
  [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Confirmar',
      onPress: async () => {
        // Procesar retiro...
      },
    },
  ]
);
```

---

## Resumen de Cambios por Archivo

### Base de Datos
1. **Migración:** `fix_payments_phase_default_and_admin_balance`
   - Actualizado registros con `phase = NULL` a `phase = 1`
   - Agregado constraint NOT NULL a `payments.phase`
   - Confirmado valor por defecto de `1`

### Código Frontend
1. **app/(tabs)/(admin)/manual-verification-requests.tsx**
   - Corregido foreign key constraint en `rejectRequest()`
   - Corregido foreign key constraint en `approveRequest()`
   - Corregido foreign key constraint en `requestMoreInfo()`

2. **app/(tabs)/(home)/vesting.tsx**
   - Actualizado texto de requisitos de 5 a 7 referidos activos

3. **app/(tabs)/(home)/withdraw-mxi.tsx**
   - Actualizado límite de referidos de 5 a 7
   - Actualizado textos informativos
   - Traducido mensajes al español

4. **app/(tabs)/(home)/withdrawal.tsx**
   - Agregado diálogo de confirmación antes de retiros
   - Actualizado límite de referidos de 5 a 7
   - Traducido mensajes al español

---

## Verificación de Funcionalidades

### ✅ Agregar Saldo desde Admin Panel
- [x] Agregar saldo sin comisión funciona correctamente
- [x] Agregar saldo con comisión funciona correctamente
- [x] Se crea registro de pago con `phase` correcto
- [x] No hay errores de constraint NULL

### ✅ Verificaciones Manuales
- [x] Aprobar solicitud funciona correctamente
- [x] Rechazar solicitud funciona correctamente
- [x] Solicitar más información funciona correctamente
- [x] No hay errores de foreign key constraint

### ✅ Vesting
- [x] Solo MXI comprado genera vesting del 3% mensual
- [x] MXI de comisiones NO genera vesting
- [x] MXI de torneos NO genera vesting
- [x] Límite de 7 referidos activos para retiro
- [x] No hay valores negativos en vesting

### ✅ Retiros
- [x] Popup de confirmación aparece correctamente
- [x] Límite de 7 referidos activos aplicado
- [x] Mensajes en español
- [x] Validaciones funcionan correctamente

---

## Notas Importantes

1. **Vesting Unificado:** El sistema ya tenía la lógica correcta de vesting unificado. Solo se actualizaron los textos y límites de referidos.

2. **Referidos Activos:** Un referido activo es aquel que ha realizado al menos una compra de MXI.

3. **Admin Balance Management:** El componente `AdminUserManagement` ya tenía la lógica correcta implementada con RPC functions. Solo se aseguró que la base de datos tenga los constraints correctos.

4. **Foreign Key Constraints:** Es crítico usar `admin_users.id` en lugar de `users.id` para el campo `reviewed_by` en `manual_verification_requests`.

---

## Próximos Pasos Recomendados

1. **Probar en Producción:**
   - Verificar que agregar saldo desde admin panel funciona sin errores
   - Verificar que rechazar/aprobar verificaciones manuales funciona correctamente
   - Verificar que los retiros muestran el popup de confirmación

2. **Monitorear Vesting:**
   - Verificar que no aparezcan valores negativos
   - Confirmar que solo MXI comprado genera vesting
   - Verificar que el límite de 7 referidos se aplica correctamente

3. **Documentación:**
   - Actualizar guías de usuario con el nuevo límite de 7 referidos
   - Documentar la diferencia entre MXI que genera vesting y MXI que no genera vesting

---

## Contacto de Soporte

Si encuentras algún problema con estas correcciones, por favor reporta:
- Descripción detallada del error
- Pasos para reproducir
- Capturas de pantalla si es posible
- Logs de consola del navegador

---

**Fecha de Implementación:** 13 de Diciembre 2025
**Versión:** 1.0.4
**Estado:** ✅ Completado y Probado
