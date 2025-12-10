
# 🔄 Flujo del Sistema de Referidor Automático

## 📊 Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO SE REGISTRA                       │
│                                                              │
│  • Nombre, Email, Contraseña, etc.                          │
│  • ¿Tiene código de referido?                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  ¿Tiene Referido?     │
              │  (referred_by != NULL)│
              └───────┬───────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼ SÍ                        ▼ NO
┌───────────────────┐      ┌────────────────────────┐
│ Usar Referido     │      │ TRIGGER AUTOMÁTICO     │
│ del Código        │      │ Se Activa              │
└───────┬───────────┘      └────────┬───────────────┘
        │                           │
        │                           ▼
        │                  ┌────────────────────────┐
        │                  │ Buscar Super Admin     │
        │                  │ en admin_users         │
        │                  └────────┬───────────────┘
        │                           │
        │                           ▼
        │                  ┌────────────────────────┐
        │                  │ Asignar Admin como     │
        │                  │ referred_by            │
        │                  └────────┬───────────────┘
        │                           │
        └───────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  USUARIO INSERTADO EN BASE DE DATOS │
        │  con referred_by asignado           │
        └─────────────────┬───────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  TRIGGER: create_referral_entry()   │
        │  Se ejecuta DESPUÉS del INSERT      │
        └─────────────────┬───────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  Crear Entradas en Tabla referrals  │
        │                                      │
        │  • Nivel 1: Referidor directo       │
        │  • Nivel 2: Referidor del referidor │
        │  • Nivel 3: Referidor nivel 3       │
        └─────────────────┬───────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │  ✅ USUARIO REGISTRADO EXITOSAMENTE │
        │  con sistema de referidos completo  │
        └─────────────────────────────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario con Código de Referido

```
Usuario: Juan Pérez
Código de Referido: ABC123 (de María García)

Flujo:
1. Juan ingresa código ABC123
2. Sistema busca a María García
3. Juan.referred_by = María.id
4. Se crean entradas en referrals:
   - Nivel 1: María → Juan
   - Nivel 2: Referidor de María → Juan (si existe)
   - Nivel 3: Referidor nivel 3 → Juan (si existe)

Resultado: ✅ Juan queda vinculado a María
```

### Caso 2: Usuario SIN Código de Referido

```
Usuario: Pedro López
Código de Referido: (vacío)

Flujo:
1. Pedro NO ingresa código de referido
2. TRIGGER se activa automáticamente
3. Sistema busca al super_admin (Camilo)
4. Pedro.referred_by = Camilo.id
5. Se crean entradas en referrals:
   - Nivel 1: Camilo → Pedro
   - Nivel 2: Referidor de Camilo → Pedro (si existe)
   - Nivel 3: Referidor nivel 3 → Pedro (si existe)

Resultado: ✅ Pedro queda vinculado al Admin automáticamente
```

---

## 💰 Sistema de Comisiones

### Cuando un Usuario Compra MXI

```
Ejemplo: Pedro (referido del Admin) compra 100 MXI

┌─────────────────────────────────────────┐
│  Pedro compra 100 MXI                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Sistema calcula comisiones:            │
│                                          │
│  Nivel 1 (Admin): 5% = 5 MXI            │
│  Nivel 2: 2% = 2 MXI (si existe)        │
│  Nivel 3: 1% = 1 MXI (si existe)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Comisiones se acreditan:               │
│                                          │
│  • Admin recibe 5 MXI en comisiones     │
│  • Referidos nivel 2 y 3 (si existen)  │
└─────────────────────────────────────────┘
```

---

## 🔍 Verificación del Sistema

### Consulta SQL para Verificar Referidos del Admin

```sql
-- Ver todos los usuarios referidos directamente por el admin
SELECT 
  u.id,
  u.name,
  u.email,
  u.referred_by,
  u.created_at
FROM users u
WHERE u.referred_by = 'c084e1d6-9aec-49c9-9734-52e460f4f6c0'
ORDER BY u.created_at DESC;
```

### Consulta SQL para Verificar Entradas de Referidos

```sql
-- Ver todas las relaciones de referidos
SELECT 
  r.level,
  referrer.name as referrer_name,
  referred.name as referred_name,
  r.created_at
FROM referrals r
JOIN users referrer ON r.referrer_id = referrer.id
JOIN users referred ON r.referred_id = referred.id
WHERE r.referrer_id = 'c084e1d6-9aec-49c9-9734-52e460f4f6c0'
ORDER BY r.created_at DESC, r.level;
```

---

## 📊 Estadísticas del Admin

### Dashboard del Administrador

El administrador puede ver:

1. **Total de Referidos Directos (Nivel 1)**
   - Usuarios que se registraron sin código de referido
   - Usuarios que usaron el código del admin

2. **Comisiones Totales**
   - De usuarios sin referido (automáticos)
   - De usuarios con código del admin

3. **Árbol de Referidos**
   - Nivel 1: Referidos directos
   - Nivel 2: Referidos de sus referidos
   - Nivel 3: Referidos nivel 3

---

## ⚙️ Configuración Técnica

### Función del Trigger

```sql
CREATE OR REPLACE FUNCTION auto_assign_admin_referrer()
RETURNS TRIGGER AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar el super admin
  SELECT u.id INTO admin_user_id
  FROM users u
  JOIN admin_users au ON u.id = au.user_id
  WHERE au.role = 'super_admin'
  LIMIT 1;

  -- Si no hay referido, asignar el admin
  IF NEW.referred_by IS NULL AND admin_user_id IS NOT NULL THEN
    NEW.referred_by := admin_user_id;
    RAISE NOTICE 'Auto-assigned admin as referrer';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Activación del Trigger

```sql
CREATE TRIGGER trigger_auto_assign_admin_referrer
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_referrer();
```

---

## 🎯 Ventajas del Sistema

### Para el Administrador
- ✅ Recibe comisiones de usuarios sin referidor
- ✅ Aumenta su red de referidos automáticamente
- ✅ No pierde oportunidades de comisión
- ✅ Sistema completamente automático

### Para el Sistema
- ✅ Todos los usuarios tienen un referidor
- ✅ No hay usuarios "huérfanos"
- ✅ Sistema de comisiones funciona para todos
- ✅ Integridad de datos garantizada

### Para los Usuarios
- ✅ Pueden registrarse sin código de referido
- ✅ Siguen recibiendo beneficios del sistema
- ✅ Proceso de registro más simple
- ✅ No se pierden en el sistema

---

## 🔧 Mantenimiento

### Si necesitas cambiar el Admin por defecto:

```sql
-- Opción 1: Cambiar el rol de super_admin
UPDATE admin_users 
SET role = 'admin' 
WHERE user_id = 'OLD_ADMIN_ID';

UPDATE admin_users 
SET role = 'super_admin' 
WHERE user_id = 'NEW_ADMIN_ID';

-- El trigger usará automáticamente el nuevo super_admin
```

### Si necesitas desactivar el trigger:

```sql
-- Desactivar (no recomendado)
DROP TRIGGER IF EXISTS trigger_auto_assign_admin_referrer ON users;

-- Reactivar
CREATE TRIGGER trigger_auto_assign_admin_referrer
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_admin_referrer();
```

---

## 📈 Métricas de Éxito

### Indicadores a Monitorear

1. **Usuarios sin Referido Original**
   - Cuántos usuarios se registran sin código
   - Porcentaje del total de registros

2. **Comisiones del Admin**
   - Total de comisiones de usuarios automáticos
   - Comparación con comisiones de referidos manuales

3. **Crecimiento de Red**
   - Velocidad de crecimiento de referidos del admin
   - Niveles 2 y 3 generados automáticamente

---

## ✅ Checklist de Funcionamiento

- [x] Trigger instalado y activo
- [x] Función de asignación funcionando
- [x] Función de creación de referidos funcionando
- [x] Admin identificado correctamente
- [x] Entradas en referrals se crean automáticamente
- [x] Sistema de comisiones funciona correctamente
- [x] No hay usuarios sin referidor

---

## 🎉 Conclusión

El sistema de referidor automático garantiza que:

1. ✅ Ningún usuario queda sin referidor
2. ✅ El administrador recibe comisiones de usuarios sin código
3. ✅ El sistema de referidos funciona para el 100% de usuarios
4. ✅ El proceso es completamente automático y transparente

**Estado**: ✅ ACTIVO Y FUNCIONANDO  
**Fecha de Implementación**: Enero 2025  
**Versión**: 1.0.3
