import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProtectedRoutes from './components/ProtectedRoutes';
import { AuthProvider } from './contexts/AuthContext';
import Wishlists from './components/Wishlists';
import Wishlist from './components/Wishlist';
import Item from './components/Item';
import Friends from './components/Friends';
import Users from './components/Users';
import MainLayout from './components/MainLayout';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route element={<MainLayout />}>
                            <Route path="/home" element={<Home />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/user/:userId/wishlists" element={<Wishlists />}/>
                            <Route path="/user/:userId/friends" element={<Friends />}/>
                            <Route path="/wishlist/:id" element={<Wishlist />}/>
                            <Route path="/item/:id" element={<Item />}/>
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
