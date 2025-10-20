import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import Recipes from './pages/Recipes';
import Disposal from './pages/Disposal';
import ChallengeWelcome from './pages/ChallengeWelcome';

const AppContent = () => {
  const { user, challengeCompleted, completeChallenge } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showCongrats, setShowCongrats] = useState(false);

  // Si el challenge no está completado, mostrar pantalla de challenge
  if (!challengeCompleted) {
    return (
      <ChallengeWelcome 
        onComplete={(data) => {
          completeChallenge(data);
          setShowCongrats(true);
        }} 
      />
    );
  }

  // Modal de felicitaciones después de completar el challenge
  if (showCongrats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Felicitaciones!
            </h2>
            <p className="text-gray-600 mb-6">
              Has completado exitosamente el Challenge de Cocina Creativa. 
              Ahora puedes explorar todas las funcionalidades de FreshKeeper.
            </p>
          </div>
          <button
            onClick={() => setShowCongrats(false)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
          >
            Explorar la Aplicación 🚀
          </button>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar login
  if (!user) {
    return <Login />;
  }

  // Renderizar página actual
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-product':
        return <AddProduct />;
      case 'my-products':
        return <MyProducts />;
      case 'recipes':
        return <Recipes />;
      case 'disposal':
        return <Disposal />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
