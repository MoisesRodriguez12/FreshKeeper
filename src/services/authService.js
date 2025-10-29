import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Servicio de autenticación con Firebase
 */
class AuthService {
  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  /**
   * Iniciar sesión con email y contraseña
   */
  async loginWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: this.formatUser(userCredential.user)
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * Registrar nuevo usuario con email y contraseña
   */
  async registerWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: this.formatUser(userCredential.user)
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * Iniciar sesión con Google
   */
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      return {
        success: true,
        user: this.formatUser(result.user)
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error)
      };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión'
      };
    }
  }

  /**
   * Formatear datos del usuario
   */
  formatUser(firebaseUser) {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified
    };
  }

  /**
   * Manejar errores de autenticación
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Ya existe una cuenta con este correo',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/popup-closed-by-user': 'Ventana cerrada por el usuario',
      'auth/cancelled-popup-request': 'Autenticación cancelada',
      'auth/popup-blocked': 'Popup bloqueado por el navegador',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método'
    };

    return errorMessages[error.code] || `Error: ${error.message}`;
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Observar cambios en el estado de autenticación
   */
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
}

export default new AuthService();
