import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

/**
 * Servicio para manejar productos en Firestore
 */
class ProductService {
  constructor() {
    this.collectionName = 'Products';
  }

  /**
   * Detectar categoría automáticamente según el nombre del producto
   */
  detectCategory(productName) {
    const name = productName.toLowerCase();
    
    const categories = {
      'Frutas': ['manzana', 'pera', 'plátano', 'banana', 'naranja', 'mandarina', 'uva', 'fresa', 'fresas', 'sandía', 'melón', 'piña', 'mango', 'papaya', 'kiwi', 'durazno', 'melocotón', 'ciruela', 'cereza', 'frambuesa', 'mora', 'arándano', 'limón', 'lima', 'pomelo', 'toronja', 'coco', 'aguacate', 'palta'],
      'Verduras': ['lechuga', 'tomate', 'pepino', 'zanahoria', 'cebolla', 'papa', 'patata', 'brócoli', 'coliflor', 'espinaca', 'acelga', 'apio', 'pimiento', 'calabaza', 'calabacín', 'berenjena', 'rábano', 'remolacha', 'col', 'repollo', 'espárrago', 'alcachofa', 'champiñón', 'seta', 'hongo', 'puerro', 'nabo', 'jengibre'],
      'Lácteos': ['leche', 'queso', 'yogur', 'yogurt', 'mantequilla', 'crema', 'nata', 'ricotta', 'mozzarella', 'parmesano', 'cheddar', 'cottage', 'kéfir', 'suero'],
      'Carnes': ['pollo', 'res', 'vaca', 'ternera', 'cerdo', 'puerco', 'jamón', 'tocino', 'bacon', 'salchicha', 'chorizo', 'carne', 'bistec', 'filete', 'costilla', 'chuleta', 'hamburguesa', 'albóndiga', 'cordero', 'pavo', 'pato'],
      'Pescados': ['pescado', 'salmón', 'atún', 'trucha', 'bacalao', 'merluza', 'sardina', 'anchoa', 'caballa', 'dorada', 'lubina', 'lenguado', 'rape', 'calamar', 'pulpo', 'camarón', 'gamba', 'langostino', 'mejillón', 'almeja', 'ostra', 'marisco'],
      'Panadería': ['pan', 'barra', 'baguette', 'integral', 'bollo', 'croissant', 'bizcocho', 'pastel', 'tarta', 'galleta', 'cookie', 'donut', 'rosca', 'bagel', 'panecillo', 'magdalena', 'muffin'],
      'Conservas': ['lata', 'conserva', 'enlatado', 'atún enlatado', 'sardinas', 'maíz', 'guisantes', 'frijoles', 'alubias', 'garbanzos', 'lentejas'],
      'Congelados': ['congelado', 'helado', 'hielo', 'frozen'],
      'Bebidas': ['agua', 'refresco', 'soda', 'jugo', 'zumo', 'té', 'café', 'cerveza', 'vino', 'licor', 'bebida', 'gaseosa', 'cola'],
      'Snacks': ['papas', 'patatas fritas', 'chips', 'galletas', 'chocolate', 'caramelo', 'dulce', 'palomitas', 'maní', 'cacahuate', 'nuez', 'almendra', 'snack', 'barrita']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Otros';
  }

  /**
   * Calcular fecha de caducidad automática según la categoría
   */
  calculateExpiryDate(category) {
    const today = new Date();
    const expiryDays = {
      'Carnes': 3,        // Carnes frescas: 3 días
      'Pescados': 2,      // Pescado fresco: 2 días
      'Lácteos': 7,       // Lácteos: 7 días
      'Verduras': 5,      // Verduras frescas: 5 días
      'Frutas': 7,        // Frutas: 7 días
      'Panadería': 3,     // Pan fresco: 3 días
      'Congelados': 90,   // Congelados: 3 meses
      'Conservas': 365,   // Conservas: 1 año
      'Bebidas': 180,     // Bebidas: 6 meses
      'Snacks': 60,       // Snacks: 2 meses
      'Otros': 30         // Otros: 1 mes
    };

    const daysToAdd = expiryDays[category] || 30;
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + daysToAdd);
    
    // Formato YYYY-MM-DD para input type="date"
    return expiryDate.toISOString().split('T')[0];
  }

  /**
   * Agregar un producto a Firestore
   */
  async addProduct(userId, productData, imageFile = null) {
    try {
      // Subir imagen a Storage si existe
      let photoURL = null;
      let photoPath = null;
      
      if (imageFile) {
        const uploadResult = await this.uploadImageToStorage(imageFile, userId);
        if (uploadResult.success) {
          photoURL = uploadResult.url;
          photoPath = uploadResult.path;
        }
      }
      
      // Detectar categoría automáticamente
      const category = this.detectCategory(productData.name);
      
      // Si no hay fecha de caducidad, calcularla automáticamente
      const expiryDate = productData.expiryDate || this.calculateExpiryDate(category);
      
      const product = {
        name: productData.name,
        category,
        expiryDate,
        photo: photoURL,
        photoPath: photoPath, // Guardar path para poder eliminar después
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, this.collectionName), product);
      
      return {
        success: true,
        productId: docRef.id,
        product: { ...product, id: docRef.id }
      };
    } catch (error) {
      console.error('Error al agregar producto:', error);
      return {
        success: false,
        error: 'Error al guardar el producto'
      };
    }
  }

  /**
   * Obtener productos de un usuario
   */
  async getUserProducts(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const products = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        products
      };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return {
        success: false,
        error: 'Error al cargar los productos',
        products: []
      };
    }
  }

  /**
   * Eliminar un producto y su imagen
   */
  async deleteProduct(productId, product) {
    try {
      // Eliminar imagen de Storage si existe
      if (product && product.photoPath) {
        await this.deleteImageFromStorage(product.photoPath);
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, this.collectionName, productId));
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return {
        success: false,
        error: 'Error al eliminar el producto'
      };
    }
  }

  /**
   * Subir imagen a Firebase Storage
   */
  async uploadImageToStorage(file, userId) {
    try {
      // Generar nombre único para la imagen
      const timestamp = Date.now();
      const fileName = `${userId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `images/${fileName}`);
      
      // Subir archivo
      await uploadBytes(storageRef, file);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        success: true,
        url: downloadURL,
        path: `images/${fileName}`
      };
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return {
        success: false,
        error: 'Error al subir la imagen'
      };
    }
  }

  /**
   * Eliminar imagen de Firebase Storage
   */
  async deleteImageFromStorage(imagePath) {
    try {
      if (!imagePath) return { success: true };
      
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      // No fallar si la imagen no existe
      return { success: true };
    }
  }
}

export default new ProductService();
