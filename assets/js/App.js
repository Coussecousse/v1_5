    
import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/app.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './hoc/Layout/Layout'
import Home from './components/Home/Home';
import paths from './config/paths';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
    <BrowserRouter>
        <div className="App">
          <Layout>
            <Routes>
              <Route path={paths.HOME} element={<Home></Home>}></Route>
            </Routes>
          </Layout>
        </div>
    </BrowserRouter>
  // </React.StrictMode> 
);
