import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import Recipes from './pages/Recipes';
import Disposal from './pages/Disposal';
import Gallery from './pages/Gallery';

const AppContent = () => {
  const { user } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

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
      case 'gallery':
        return <Gallery />;
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
