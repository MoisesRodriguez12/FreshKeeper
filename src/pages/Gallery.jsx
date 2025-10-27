import { useState } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { RefreshCw, Eye, ImageIcon } from 'lucide-react';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'Comentarios'),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setGalleryItems(items);
    } catch (error) {
      console.error('Error cargando galería:', error);
      alert('Error al cargar la galería. Verifica que Firestore esté habilitado y las reglas de seguridad permitan lectura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-3 sm:mb-4">
            <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Galería de Creaciones 🎨
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Descubre las deliciosas recetas que otros usuarios han cocinado
          </p>
          <button
            onClick={loadGallery}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:scale-95 transition-all font-medium disabled:opacity-50 text-sm sm:text-base shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : galleryItems.length === 0 ? 'Cargar Creaciones' : 'Actualizar'}
          </button>
        </div>

        {/* Grid de galería */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl active:scale-[0.98] transition-all"
              >
                {/* Imagen o video */}
                <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100">
                  {item.fileType === 'image' ? (
                    <img
                      src={item.fileUrl}
                      alt={item.recipeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.fileUrl}
                      controls
                      className="w-full h-full object-cover bg-black"
                    />
                  )}
                </div>

                {/* Información */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                    {item.recipeName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                    Por: <span className="font-medium text-purple-600">{item.userName || 'Anónimo'}</span>
                  </p>
                  
                  {/* Comentario del usuario */}
                  {item.userComment && (
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs sm:text-sm text-gray-700 italic line-clamp-3">
                        "{item.userComment}"
                      </p>
                    </div>
                  )}
                  
                  {/* Ingredientes */}
                  <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                    {item.ingredients?.slice(0, 3).map((ing, i) => (
                      <span
                        key={i}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs"
                      >
                        {ing}
                      </span>
                    ))}
                    {item.ingredients?.length > 3 && (
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] sm:text-xs">
                        +{item.ingredients.length - 3} más
                      </span>
                    )}
                  </div>

                  {/* Fecha */}
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-3 sm:mb-4">
                <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Aún no hay creaciones en la galería
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Haz clic en "Cargar Creaciones" para ver las recetas de otros usuarios
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Gallery;
