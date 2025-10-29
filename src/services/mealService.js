import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Servicio para manejar comidas/recetas en Firestore
 */
class MealService {
  constructor() {
    this.collectionName = 'Meals';
  }

  /**
   * Guardar una comida/receta generada
   */
  async saveMeal(userId, mealData) {
    try {
      const meal = {
        userId,
        products: mealData.products,           // Array de productos usados
        servings: mealData.servings,           // Cantidad de personas
        recipeName: mealData.recipeName,       // Nombre de la receta
        recipeContent: mealData.recipeContent, // Contenido completo de la receta
        ingredients: mealData.ingredients || [],
        instructions: mealData.instructions || [],
        createdAt: new Date().toISOString(),
        notificationSent: false,               // Para tracking de notificaciones
        notificationDate: this.calculateNotificationDate() // 2-3 días después
      };

      const docRef = await addDoc(collection(db, this.collectionName), meal);
      
      return {
        success: true,
        mealId: docRef.id,
        meal: { ...meal, id: docRef.id }
      };
    } catch (error) {
      console.error('Error al guardar comida:', error);
      return {
        success: false,
        error: 'Error al guardar la receta'
      };
    }
  }

  /**
   * Calcular fecha de notificación (2-3 días después de crear la comida)
   */
  calculateNotificationDate() {
    const notificationDate = new Date();
    // Random entre 2 y 3 días
    const daysToAdd = Math.floor(Math.random() * 2) + 2; // 2 o 3 días
    notificationDate.setDate(notificationDate.getDate() + daysToAdd);
    return notificationDate.toISOString();
  }

  /**
   * Obtener todas las comidas de un usuario
   */
  async getUserMeals(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const meals = [];
      
      querySnapshot.forEach((doc) => {
        meals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        meals
      };
    } catch (error) {
      console.error('Error al obtener comidas:', error);
      return {
        success: false,
        error: 'Error al cargar las comidas',
        meals: []
      };
    }
  }

  /**
   * Obtener comidas que necesitan notificación
   */
  async getMealsNeedingNotification() {
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, this.collectionName),
        where('notificationSent', '==', false),
        where('notificationDate', '<=', now)
      );
      
      const querySnapshot = await getDocs(q);
      const meals = [];
      
      querySnapshot.forEach((doc) => {
        meals.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        meals
      };
    } catch (error) {
      console.error('Error al obtener comidas para notificación:', error);
      return {
        success: false,
        error: 'Error al cargar las comidas',
        meals: []
      };
    }
  }

  /**
   * Eliminar una comida
   */
  async deleteMeal(mealId) {
    try {
      await deleteDoc(doc(db, this.collectionName, mealId));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar comida:', error);
      return {
        success: false,
        error: 'Error al eliminar la comida'
      };
    }
  }

  /**
   * Marcar notificación como enviada
   */
  async markNotificationSent(mealId) {
    try {
      const mealRef = doc(db, this.collectionName, mealId);
      await updateDoc(mealRef, {
        notificationSent: true
      });
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      return {
        success: false,
        error: 'Error al actualizar el estado'
      };
    }
  }
}

export default new MealService();
