import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

class UserService {
  constructor() {
    this.collectionName = 'Users';
  }

  /**
   * Obtener perfil completo del usuario
   */
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return {
          success: true,
          profile: { id: userSnap.id, ...userSnap.data() }
        };
      } else {
        // Si no existe, crear perfil básico
        const defaultProfile = {
          userId: userId,
          displayName: '',
          photoURL: '',
          photoPath: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(userRef, defaultProfile);
        
        return {
          success: true,
          profile: { id: userId, ...defaultProfile }
        };
      }
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar nombre del usuario
   */
  async updateDisplayName(userId, displayName) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      
      await updateDoc(userRef, {
        displayName: displayName,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Nombre actualizado correctamente'
      };
    } catch (error) {
      console.error('Error actualizando nombre:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Subir foto de perfil a Storage
   */
  async uploadProfilePhoto(file, userId) {
    try {
      const timestamp = Date.now();
      const fileName = `profile_${userId}_${timestamp}`;
      const storageRef = ref(storage, `profiles/${fileName}`);

      // Subir archivo
      await uploadBytes(storageRef, file);

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      return {
        success: true,
        url: downloadURL,
        path: `profiles/${fileName}`
      };
    } catch (error) {
      console.error('Error subiendo foto de perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar foto de perfil de Storage
   */
  async deleteProfilePhoto(photoPath) {
    try {
      if (!photoPath) return { success: true };

      const storageRef = ref(storage, photoPath);
      await deleteObject(storageRef);

      return {
        success: true,
        message: 'Foto eliminada correctamente'
      };
    } catch (error) {
      console.error('Error eliminando foto de perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar foto de perfil
   */
  async updateProfilePhoto(userId, photoFile, oldPhotoPath = null) {
    try {
      // Eliminar foto anterior si existe
      if (oldPhotoPath) {
        await this.deleteProfilePhoto(oldPhotoPath);
      }

      // Subir nueva foto
      const uploadResult = await this.uploadProfilePhoto(photoFile, userId);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Actualizar documento del usuario
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        photoURL: uploadResult.url,
        photoPath: uploadResult.path,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        photoURL: uploadResult.url,
        photoPath: uploadResult.path,
        message: 'Foto de perfil actualizada correctamente'
      };
    } catch (error) {
      console.error('Error actualizando foto de perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar foto de perfil del usuario
   */
  async removeProfilePhoto(userId, photoPath) {
    try {
      // Eliminar de Storage
      if (photoPath) {
        await this.deleteProfilePhoto(photoPath);
      }

      // Actualizar documento
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        photoURL: '',
        photoPath: '',
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Foto de perfil eliminada correctamente'
      };
    } catch (error) {
      console.error('Error eliminando foto de perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar preferencias de dieta del usuario
   */
  async updateDietPreferences(userId, preferences) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      
      await updateDoc(userRef, {
        dietPreferences: preferences,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Preferencias de dieta actualizadas correctamente'
      };
    } catch (error) {
      console.error('Error actualizando preferencias de dieta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar perfil completo
   */
  async updateProfile(userId, profileData) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      
      const updateData = {
        ...profileData,
        updatedAt: new Date().toISOString()
      };

      await setDoc(userRef, updateData, { merge: true });

      return {
        success: true,
        message: 'Perfil actualizado correctamente'
      };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new UserService();
