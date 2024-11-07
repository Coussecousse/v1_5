import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../containers/Footer/Footer';

export default function Layout({ children, isAuthenticated }) {
    return (
        <>
            <Header isAuthenticated={isAuthenticated} />
            <main>
                {children}
            </main>
            <Footer isAuthenticated={isAuthenticated}></Footer>
        </>
    );
}
