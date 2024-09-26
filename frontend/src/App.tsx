import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProtectedRoutes from './components/ProtectedRoutes';
import { AuthProvider } from './contexts/AuthContext';
import Wishlists from './components/Wishlists';
import Wishlist from './components/Wishlist';
import Item from './components/Item';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/wishlists" element={<Wishlists />}/>
                        <Route path="/wishlist/:id" element={<Wishlist />}/>
                        <Route path="/item/:id" element={<Item />}/>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
