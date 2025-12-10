
import { showAlert } from './confirmDialog';

/**
 * Show success notification after successful registration
 */
export const showRegistrationSuccess = (email: string, onDismiss?: () => void) => {
  showAlert(
    '✅ ¡Registro Exitoso!',
    `Tu cuenta ha sido creada exitosamente.\n\n` +
    `📧 Correo: ${email}\n\n` +
    `📬 IMPORTANTE: Hemos enviado un correo de verificación a tu bandeja de entrada.\n\n` +
    `Por favor:\n` +
    `- Revisa tu bandeja de entrada\n` +
    `- Revisa la carpeta de spam/correo no deseado\n` +
    `- Haz clic en el enlace de verificación\n\n` +
    `⚠️ Debes verificar tu correo antes de poder iniciar sesión.\n\n` +
    `Si no recibes el correo en 5 minutos, puedes solicitar un reenvío desde la pantalla de inicio de sesión.`,
    onDismiss,
    'success'
  );
};

/**
 * Show error notification with specific guidance
 */
export const showRegistrationError = (error: string, email?: string) => {
  let title = '❌ Error en el Registro';
  let message = error;
  
  // Customize message based on error type
  if (error.includes('ya está registrado') || error.includes('already registered')) {
    title = '⚠️ Correo Ya Registrado';
    message = `El correo electrónico ${email || 'proporcionado'} ya está registrado en el sistema.\n\n` +
              `Opciones:\n` +
              `- Intenta iniciar sesión si ya tienes una cuenta\n` +
              `- Usa otro correo electrónico\n` +
              `- Contacta a soporte si crees que esto es un error`;
  } else if (error.includes('identificación') || error.includes('ID number')) {
    title = '⚠️ Identificación Ya Registrada';
    message = `El número de identificación ya está registrado.\n\n` +
              `Solo se permite una cuenta por persona.\n\n` +
              `Si crees que esto es un error, contacta a soporte.`;
  } else if (error.includes('referido') || error.includes('referral')) {
    title = '⚠️ Código de Referido Inválido';
    message = `El código de referido ingresado no es válido.\n\n` +
              `Opciones:\n` +
              `- Verifica el código con quien te refirió\n` +
              `- Déjalo en blanco si no tienes código\n` +
              `- Contacta a soporte si necesitas ayuda`;
  } else if (error.includes('rate limit') || error.includes('429') || error.includes('Demasiados intentos')) {
    title = '⏱️ Demasiados Intentos';
    message = `Has realizado demasiados intentos de registro.\n\n` +
              `Por favor espera 5-10 minutos e intenta de nuevo.\n\n` +
              `Esto es una medida de seguridad para proteger el sistema.`;
  } else if (error.includes('formato') && error.includes('correo')) {
    title = '⚠️ Correo Electrónico Inválido';
    message = `El formato del correo electrónico no es válido.\n\n` +
              `Por favor verifica que:\n` +
              `- El correo tenga un formato válido (ejemplo@dominio.com)\n` +
              `- No contenga espacios\n` +
              `- Tenga un dominio válido`;
  } else if (error.includes('contraseña') && (error.includes('débil') || error.includes('corta') || error.includes('6 caracteres'))) {
    title = '⚠️ Contraseña Inválida';
    message = `La contraseña no cumple con los requisitos de seguridad.\n\n` +
              `La contraseña debe:\n` +
              `- Tener al menos 6 caracteres\n` +
              `- Ser segura y difícil de adivinar\n\n` +
              `Por favor elige una contraseña más fuerte.`;
  } else if (error.includes('nombre completo')) {
    title = '⚠️ Nombre Incompleto';
    message = `Por favor ingresa tu nombre completo.\n\n` +
              `Debes incluir:\n` +
              `- Tu nombre\n` +
              `- Tu apellido\n\n` +
              `Ejemplo: Juan Pérez`;
  } else if (error.includes('perfil') || error.includes('profile') || error.includes('crear')) {
    title = '⚠️ Error al Crear Perfil';
    message = `Hubo un problema al crear tu perfil de usuario.\n\n` +
              `📧 Correo: ${email || 'No proporcionado'}\n` +
              `🕐 Hora: ${new Date().toLocaleString('es-ES')}\n\n` +
              `Por favor:\n` +
              `1. Espera 2-3 minutos\n` +
              `2. Intenta iniciar sesión con tu correo y contraseña\n` +
              `3. Si no puedes iniciar sesión, contacta a soporte\n\n` +
              `Nuestro equipo resolverá el problema lo antes posible.`;
  }
  
  showAlert(title, message, undefined, 'error');
};

/**
 * Show email verification reminder
 */
export const showEmailVerificationReminder = (email: string, onResend?: () => void) => {
  showAlert(
    '📧 Verificación de Correo Requerida',
    `Para iniciar sesión, primero debes verificar tu correo electrónico.\n\n` +
    `📬 Correo: ${email}\n\n` +
    `Pasos:\n` +
    `1. Revisa tu bandeja de entrada\n` +
    `2. Busca el correo de MXI Liquidity Pool\n` +
    `3. Haz clic en el enlace de verificación\n\n` +
    `⚠️ No olvides revisar la carpeta de spam.\n\n` +
    `¿No recibiste el correo?`,
    onResend,
    'warning'
  );
};

/**
 * Show password reset success notification
 */
export const showPasswordResetSuccess = (email: string) => {
  showAlert(
    '✅ Correo de Recuperación Enviado',
    `Se ha enviado un correo electrónico a:\n\n` +
    `📧 ${email}\n\n` +
    `El correo contiene un enlace para restablecer tu contraseña.\n\n` +
    `Pasos:\n` +
    `1. Revisa tu bandeja de entrada\n` +
    `2. Haz clic en el enlace del correo\n` +
    `3. Crea tu nueva contraseña\n\n` +
    `⚠️ El enlace expirará en 24 horas.\n\n` +
    `Si no recibes el correo en 5 minutos, revisa la carpeta de spam.`,
    undefined,
    'success'
  );
};

/**
 * Show password reset error notification
 */
export const showPasswordResetError = (error: string) => {
  let message = error;
  
  if (error.includes('rate limit') || error.includes('429')) {
    message = `Has solicitado demasiados correos de recuperación.\n\n` +
              `Por favor espera 5-10 minutos e intenta de nuevo.`;
  }
  
  showAlert(
    '❌ Error al Enviar Correo',
    message,
    undefined,
    'error'
  );
};

/**
 * Show email resend success notification
 */
export const showEmailResendSuccess = () => {
  showAlert(
    '✅ Correo Reenviado',
    `Se ha reenviado el correo de verificación.\n\n` +
    `Por favor revisa tu bandeja de entrada y carpeta de spam.\n\n` +
    `Si no lo recibes en 5 minutos, contacta a soporte.`,
    undefined,
    'success'
  );
};

/**
 * Show email resend error notification
 */
export const showEmailResendError = (error: string) => {
  let message = error;
  
  if (error.includes('rate limit') || error.includes('429')) {
    message = `Has solicitado demasiados correos de verificación.\n\n` +
              `Por favor espera 5-10 minutos e intenta de nuevo.`;
  }
  
  showAlert(
    '❌ Error al Reenviar Correo',
    message,
    undefined,
    'error'
  );
};
