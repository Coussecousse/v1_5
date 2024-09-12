import React from 'react';
import Header from '../../components/Header/Header';

export default function Layout({ children, isAuthenticated }) {
    return (
        <>
            <Header isAuthenticated={isAuthenticated} />
            <main>
                {children}
            </main>
        </>
    );
}
