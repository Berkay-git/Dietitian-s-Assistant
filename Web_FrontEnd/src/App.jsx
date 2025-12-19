import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './Pages/LoginPage';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import AddClient from './Pages/AddClient';
import ClientDetails from './Pages/ClientDetails';
import EditClient from './Pages/EditClient';
import MealPlanner from './Pages/MealPlanner';
import ClientMeals from './Pages/ClientMeals';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-client" element={<AddClient />} />
        <Route path="/client-details" element={<ClientDetails />} />
        <Route path="/edit-client" element={<EditClient />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/client-meals" element={<ClientMeals />} />
      </Routes>
    </BrowserRouter>
  );
}