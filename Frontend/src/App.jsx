import { useState, useEffect, createContext, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Homepage from './Pages/Homepage';
import PostPage from './Pages/PostPage';
import Profile from './Pages/Profile';
import Login from './Pages/Login';
import Gallery from './Pages/Gallery';
import Favorites from './Pages/Favorites';
import NavBar from './Components/NavBar';
import EditProfile from './Pages/EditProfile';
import SignUp from './Pages/SignUp.jsx';
import ItemPage from './Pages/ItemPage';
import ProtectedRoute from './Components/ProtectedRoute';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EditPosts from './Pages/EditPosts.jsx'
import PendingPurchases from './Pages/PendingPurchases';
import Requests from './Pages/Requests';
import { ParallaxProvider } from 'react-scroll-parallax';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function App() {

  //const theme = createTheme(themeData.schemes.light);
  const [mode, setMode] = useState('light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        localStorage.setItem("mode", mode === 'light' ? 'dark' : 'light' )
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode],
  );

  useEffect(()=>{
    if( localStorage.getItem("mode")){
      setMode(localStorage.getItem("mode"))
    }
  },[]);

  //useEffect(() => localStorage.setItem("mode", mode), [mode]);

  const theme = useMemo(
    () => createTheme({
    palette: {
      mode,
      primary: {
        main: '#367765',
        light: '#5E9283',
        dark: '#255346',
      },
      secondary: {
        main: '#c84a5a',
        light: '#D36E7B',
        dark: '#8C333E',
      },
      error: {
        main: '#cc2b3c',
      },
    },
  }), [mode]);

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [profile, setProfile] = useState(localStorage.getItem('profile') || '');
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture') || '');

  localStorage.setItem('EditPageButton', 'false');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        const timeUntilExpiration = decodedToken.exp - currentTime;

        if (timeUntilExpiration <= 0) {
          handleLogout();
        } else {
          const timeoutId = setTimeout(handleLogout, timeUntilExpiration * 1000);
          return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount or token change
        }
      } catch (error) {
        handleLogout(); // In case of any error in decoding the token
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (profile, token, profilePicture, purchasedPosts) => {
    localStorage.setItem('token', token);
    localStorage.setItem('profile', profile);
    localStorage.setItem('profilePicture', profilePicture || ''); 
    localStorage.setItem('purchasedPosts', JSON.stringify(purchasedPosts) || []);
    setProfile(profile);
    setProfilePicture(profilePicture || '');
    // Dispatch custom event
    const event = new Event('localStorageUpdated');
    window.dispatchEvent(event);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setProfile('');
    setProfilePicture('');
    // Dispatch custom event
    const event = new Event('localStorageUpdated');
    window.dispatchEvent(event);
  };
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <ParallaxProvider>
        <BrowserRouter>
          <div style={{padding:5}}>
          <NavBar profile={profile} profilePicture={profilePicture} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
          <Routes>
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Profile /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Gallery /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Favorites /></ProtectedRoute>} />
            <Route path="/postpage" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PostPage /></ProtectedRoute>} />
            <Route path="/signup" element={<SignUp onSignup={handleLogin} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/editprofile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EditProfile /></ProtectedRoute>} />
            <Route path="/item/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ItemPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            <Route path="/edititem/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EditPosts /></ProtectedRoute>} /> 
            <Route path="/pending-purchases" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PendingPurchases /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Requests /></ProtectedRoute>} />  
          </Routes>
          </div>
        </BrowserRouter>
        </ParallaxProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
