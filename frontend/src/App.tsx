import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProtectedRoutes from './components/ProtectedRoutes';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<ProtectedRoutes />}>
                        <Route path="/home" element={<Home />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
