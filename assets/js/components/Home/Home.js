import React, {Component} from 'react';
import Main from './Main/Main';
import Second from './Second/Second';
import Third from './Third/Third';
import Join from '../../containers/Join/Join';
import Footer from '../../containers/Footer/Footer';
    
export default function Home() {
    return (
        <>
            <Main />
            <Second />
            <Third />
            <Join />
            <Footer />
        </>
    )
}
    