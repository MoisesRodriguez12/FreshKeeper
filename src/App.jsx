import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import Recipes from './pages/Recipes';
import Disposal from './pages/Disposal';
import Gallery from './pages/Gallery';
import MyMeals from './pages/MyMeals';
import Profile from './pages/Profile';

const AppContent = () => {
  const { user, authLoading } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
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
      case 'my-meals':
        return <MyMeals />;
      case 'gallery':
        return <Gallery />;
      case 'disposal':
        return <Disposal />;
      case 'profile':
        return <Profile />;
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
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
