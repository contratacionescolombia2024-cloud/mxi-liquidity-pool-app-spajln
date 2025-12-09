
# Guía de Eliminación de Cuentas de Usuario - Panel de Administración

## 📋 Resumen

Se ha implementado una nueva funcionalidad en el panel de administración que permite a los administradores eliminar cuentas de usuario de forma permanente, incluyendo todos los datos asociados.

## ✨ Características Implementadas

### 1. **Pantalla de Eliminación de Cuentas**
- **Ubicación**: Panel de Administración → "Eliminar Cuentas"
- **Ruta**: `app/(tabs)/(admin)/user-deletion.tsx`

### 2. **Funcionalidades Principales**

#### Búsqueda de Usuarios
- Búsqueda en tiempo real por:
  - Nombre
  - Email
  - Número de identificación
  - Código de referido
- Filtrado instantáneo mientras escribes

#### Visualización de Usuarios
- Lista completa de usuarios con información clave:
  - Avatar con estado (activo/bloqueado)
  - Nombre y email
  - Balance MXI y USDT contribuido
  - Número de referidos activos
  - Fecha de registro
  - Estado de la cuenta

#### Detalles del Usuario
- Modal con información completa:
  - **Información Personal**: Nombre, email, ID, dirección, código de referido
  - **Información Financiera**: Balance MXI, USDT contribuido, referidos activos
  - **Estado de la Cuenta**: Estado actual y fecha de registro

#### Eliminación Segura
- **Confirmación doble**: Diálogo de confirmación antes de eliminar
- **Advertencias claras**: Mensajes sobre la irreversibilidad de la acción
- **Zona de peligro**: Sección claramente marcada con advertencias visuales

### 3. **Función de Base de Datos**

Se creó la función `delete_user_account` que:

```sql
delete_user_account(p_user_id UUID, p_admin_id UUID)
```

**Elimina automáticamente**:
- ✅ Referidos (como referidor y como referido)
- ✅ Comisiones
- ✅ Contribuciones
- ✅ Retiros
- ✅ Mensajes
- ✅ Pagos
- ✅ Solicitudes de verificación manual
- ✅ Programación de retiro de MXI
- ✅ Tickets de lotería
- ✅ Historial de desafíos
- ✅ Datos de vesting por hora
- ✅ Historial de balance MXI
- ✅ Niveles de embajador
- ✅ Retiros de bonos de embajador
- ✅ Verificaciones KYC
- ✅ Historial de transacciones
- ✅ Participantes de juegos
- ✅ Resultados de juegos
- ✅ Usuario de la tabla `users`
- ✅ Usuario de `auth.users` (autenticación)

**Seguridad**:
- Verifica que el usuario que ejecuta la acción sea un administrador
- Registra el email del usuario eliminado
- Maneja errores de forma segura

## 🎨 Interfaz de Usuario

### Pantalla Principal
- **Banner de advertencia**: Mensaje claro sobre la irreversibilidad
- **Barra de búsqueda**: Con icono de lupa y botón para limpiar
- **Lista de usuarios**: Cards con información resumida
- **Indicadores visuales**: Badges de estado (Activo/Bloqueado)

### Modal de Detalles
- **Secciones organizadas**: Información personal, financiera y estado
- **Zona de peligro**: Claramente separada con color rojo
- **Botón de eliminación**: Con icono de basura y texto descriptivo
- **Indicador de carga**: Mientras se procesa la eliminación

## 🔒 Seguridad

### Verificaciones
1. **Autenticación**: Solo administradores pueden acceder
2. **Confirmación**: Diálogo de confirmación con detalles del usuario
3. **Validación**: Verificación en base de datos antes de eliminar
4. **Logging**: Registro del email del usuario eliminado

### Advertencias
- Banner permanente en la parte superior
- Mensaje en la zona de peligro
- Diálogo de confirmación detallado
- Texto claro sobre la irreversibilidad

## 📱 Uso

### Para Administradores

1. **Acceder a la función**:
   - Ir al Panel de Administración
   - Seleccionar "Eliminar Cuentas"

2. **Buscar usuario**:
   - Usar la barra de búsqueda
   - Escribir nombre, email, ID o código de referido
   - Los resultados se filtran automáticamente

3. **Ver detalles**:
   - Tocar en el card del usuario
   - Revisar toda la información
   - Verificar que es el usuario correcto

4. **Eliminar cuenta**:
   - Scroll hasta la "Zona de Peligro"
   - Tocar "Eliminar Cuenta Permanentemente"
   - Leer el mensaje de confirmación
   - Confirmar la eliminación
   - Esperar a que se complete el proceso

5. **Confirmación**:
   - Mensaje de éxito
   - Actualización automática de la lista
   - Cierre del modal

## ⚠️ Advertencias Importantes

### Para Administradores
- ❌ **NO SE PUEDE DESHACER**: La eliminación es permanente
- ❌ **TODOS LOS DATOS**: Se eliminan todos los datos del usuario
- ❌ **REFERIDOS**: Los referidos del usuario perderán la conexión
- ❌ **TRANSACCIONES**: Todo el historial se elimina
- ⚠️ **VERIFICAR SIEMPRE**: Asegurarse de seleccionar el usuario correcto

### Casos de Uso Apropiados
- ✅ Solicitud del usuario para eliminar su cuenta (GDPR)
- ✅ Cuentas fraudulentas confirmadas
- ✅ Cuentas duplicadas
- ✅ Cuentas de prueba que ya no se necesitan

### Casos de Uso NO Apropiados
- ❌ Suspender temporalmente una cuenta (usar bloqueo en su lugar)
- ❌ Resolver disputas (investigar primero)
- ❌ Eliminar por error (no hay forma de recuperar)

## 🔧 Mantenimiento

### Logs
La función registra:
- Email del usuario eliminado
- ID del administrador que ejecutó la acción
- Timestamp de la eliminación

### Monitoreo
Revisar regularmente:
- Número de eliminaciones por administrador
- Patrones de eliminación
- Errores en el proceso

## 📊 Estadísticas

Después de eliminar un usuario:
- El contador de usuarios totales se actualiza
- Las estadísticas de MXI y USDT se recalculan
- Los referidos activos de otros usuarios se actualizan

## 🆘 Soporte

Si hay problemas:
1. Verificar que el administrador tiene permisos
2. Revisar los logs de la base de datos
3. Verificar que no hay restricciones de foreign key
4. Contactar al equipo de desarrollo si persiste el error

## 📝 Notas Técnicas

### Dependencias
- Función RPC: `delete_user_account`
- Permisos: Solo administradores autenticados
- Cascading deletes: Configurado en la base de datos

### Performance
- La eliminación puede tardar varios segundos
- Se muestra un indicador de carga
- La operación es atómica (todo o nada)

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
