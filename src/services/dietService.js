import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Servicio para manejar dietas y preferencias del usuario
 */
class DietService {
  constructor() {
    this.dietsCollection = 'Diets';
    this.usersCollection = 'Users';
  }

  /**
   * Obtener dieta del usuario
   */
  async getUserDiet(userId) {
    try {
      const dietRef = doc(db, this.dietsCollection, userId);
      const dietSnap = await getDoc(dietRef);
      
      if (dietSnap.exists()) {
        return {
          success: true,
          diet: { id: dietSnap.id, ...dietSnap.data() }
        };
      }
      
      return {
        success: true,
        diet: null
      };
    } catch (error) {
      console.error('Error al obtener dieta:', error);
      return {
        success: false,
        error: 'Error al cargar la dieta',
        diet: null
      };
    }
  }

  /**
   * Guardar o actualizar dieta del usuario
   */
  async saveDiet(userId, dietData) {
    try {
      const dietRef = doc(db, this.dietsCollection, userId);
      
      const diet = {
        userId,
        ...dietData,
        createdAt: dietData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(dietRef, diet, { merge: true });
      
      return {
        success: true,
        diet
      };
    } catch (error) {
      console.error('Error al guardar dieta:', error);
      return {
        success: false,
        error: 'Error al guardar la dieta'
      };
    }
  }

  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(userId, preferences) {
    try {
      const dietRef = doc(db, this.dietsCollection, userId);
      
      await updateDoc(dietRef, {
        preferences,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      return {
        success: false,
        error: 'Error al actualizar preferencias'
      };
    }
  }

  /**
   * Verificar si el usuario quiere ver el cuestionario
   */
  async getUserPreferences(userId) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          success: true,
          preferences: {
            showDietQuestionnaire: data.showDietQuestionnaire !== false, // Por defecto true
            neverShowAgain: data.neverShowDietQuestionnaire === true
          }
        };
      }
      
      return {
        success: true,
        preferences: {
          showDietQuestionnaire: true,
          neverShowAgain: false
        }
      };
    } catch (error) {
      console.error('Error al obtener preferencias de usuario:', error);
      return {
        success: false,
        error: 'Error al cargar preferencias',
        preferences: {
          showDietQuestionnaire: true,
          neverShowAgain: false
        }
      };
    }
  }

  /**
   * Marcar para no mostrar más el cuestionario
   */
  async setNeverShowAgain(userId) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      
      await setDoc(userRef, {
        neverShowDietQuestionnaire: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      return {
        success: false,
        error: 'Error al guardar preferencias'
      };
    }
  }

  /**
   * Saltar el cuestionario por ahora (se mostrará la próxima vez)
   */
  async skipQuestionnaire(userId) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      
      await setDoc(userRef, {
        showDietQuestionnaire: false,
        lastSkippedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar preferencias:', error);
      return {
        success: false,
        error: 'Error al guardar preferencias'
      };
    }
  }

  /**
   * Resetear preferencias de cuestionario (para testing)
   */
  async resetQuestionnairePreferences(userId) {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      
      await setDoc(userRef, {
        showDietQuestionnaire: true,
        neverShowDietQuestionnaire: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error al resetear preferencias:', error);
      return {
        success: false,
        error: 'Error al resetear preferencias'
      };
    }
  }
}

export default new DietService();
