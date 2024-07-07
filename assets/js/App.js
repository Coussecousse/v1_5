    
import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/app.css';
import { BrowserRouter } from 'react-router-dom';
import Layout from './hoc/Layout/Layout'
import Home from './components/Home/Home';



const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // <React.StrictMode>
    <BrowserRouter>
        <div className="App">
            <Layout>
                <Home />
            </Layout>
        </div>
    </BrowserRouter>
  // </React.StrictMode> 
);
