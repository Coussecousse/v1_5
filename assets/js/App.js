import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/app.css';
import styles from './App.module.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './hoc/Layout/Layout';
import Home from './components/Home/Home';
import paths from './config/paths';
import Destinations from './components/Destination/Destinations';
import Community from './components/Community/Community';
import SignUp from './components/Sign/SignUp/SignUp';
import SignIn from './components/Sign/SignIn/SignIn';
import VerifyEmail from './components/VerifyEmail/VerifyEmail';
import Profile from './components/Profile/Profile';
import EmailForm from './components/ResetPassword/ResetPasswordForm/EmailForm/EmailForm';
import ResetForm from './components/ResetPassword/ResetPasswordForm/ResetForm/ResetForm'; 
import axios from 'axios';
import ChangeInformations from './components/Profile/ChangeInformations/ChangeInformations';
import Activities from './components/Activities/Activities';
import CreateActivity from './components/Activities/Create/CreateActivity';
import ActivityDetails from './components/Activities/Show/ActivityDetails';
import UpdateActivities from './components/Activities/Update/UpdateActivities';
import Roadtrips from './components/Roadtrips/Roadtrips';
import CreateRoadtrip from './components/Roadtrips/Create/CreateRoadtrip';
import RoadtripDetails from './components/Roadtrips/Show/RoadtripDetails';
import UpdateRoadtrip from './components/Roadtrips/Update/UpdateRoadtrip';
import ProfileRoadtrips from './components/ProfileRoadtrips/ProfileRoadtrips';
import Logout from './components/Logout/Logout';
import Rules from './components/Rules/Rules';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch the user's authentication status
  useEffect(() => {
    axios.get('/api/check-auth')
      .then(response => {
        setIsAuthenticated(response.data.isAuthenticated);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error checking authentication status', error);
        setLoading(false);
      });
  }, []);

  // ProtectedRoute Component for route guarding
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className={styles.loaderContainer}><span className={`loader ${styles.loader}`}></span></div>; // Or use a spinner component
    }
    
    if (!isAuthenticated) {
      return <Navigate to={paths.SIGNIN} />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <div className="App">
        {loading ? (
          <div className={`${styles.loaderContainer} loader-container`}>
            <span className={`loader ${styles.loader}`}></span>
            <span className="loader-text">On arrive !</span>
          </div>
        ) : (
          <Layout isAuthenticated={isAuthenticated}>
            <Routes>
              <Route path={paths.HOME} element={<Home />} />
              <Route path={paths.DESTINATIONS} element={<Destinations />} />
              <Route path={paths.COMMUNITY} element={<Community />} />
              <Route path={paths.SIGNUP} element={<SignUp />} />
              <Route path={paths.SIGNIN} element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
              <Route path={paths.VERIFY_EMAIL} element={<VerifyEmail />} />
              <Route path={paths.RESET_PASSWORD} element={<EmailForm isAuthenticated={isAuthenticated} />} />
              <Route path={paths.RESET_PASSWORD_RESET} element={<ResetForm />} />

              {/* Protected route for authenticated users */}
              <Route
                path={paths.PROFILE_SEARCH}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.PROFILE}
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.PROFILE_CHANGE_INFORMATIONS}
                element={
                  <ProtectedRoute>
                    <ChangeInformations />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.PROFILE_ROADTRIPS}
                element={
                  <ProtectedRoute>
                    <ProfileRoadtrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.PROFILE_ACTIVITIES}
                element={
                  <ProtectedRoute>
                    <ProfileRoadtrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.ACTIVITIES}
                element={
                  <ProtectedRoute>
                    <Activities />
                  </ProtectedRoute>
                }
              />
              <Route
                path={paths.CREATE_ACTIVITY}
                element={
                  <ProtectedRoute>
                    <CreateActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${paths.DETAILS_ACTIVITY}`}
                element={
                  <ProtectedRoute>
                    <ActivityDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${paths.UPDATE_ACTIVITY}`}
                element={
                  <ProtectedRoute>
                    <UpdateActivities />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${paths.ROADTRIPS}`}
                element={
                  <ProtectedRoute>
                    <Roadtrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${paths.CREATE_ROADTRIP}`}
                element={
                  <ProtectedRoute>
                    <CreateRoadtrip />
                  </ProtectedRoute>
                }
              />

              <Route
                path={`${paths.DETAILS_ROADTRIP}`}
                element={
                  <ProtectedRoute>
                    <RoadtripDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path={`${paths.UPDATE_ROADTRIP}`}
                element={
                  <ProtectedRoute>
                    <UpdateRoadtrip />
                  </ProtectedRoute>
                }
              />

              <Route
                path={`${paths.LOGOUT}`}
                element={
                  <ProtectedRoute>
                    <Logout setLoading={setLoading} />
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes to Home */}
              <Route path="*" element={<Navigate to={paths.HOME} />} />
            </Routes>
            <Route path={paths.RULES} element={<Rules />} />
          </Layout>
        )}
      </div>
    </BrowserRouter>
  );
}

root.render(<App />);
