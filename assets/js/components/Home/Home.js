import React, {Component} from 'react';
import styles from './Home.module.css';
import Main from './Main/Main';
import Second from './Second/Second';
import Third from './Third/Third';
import Join from '../../containers/Join/Join';
    
export default function Home() {
    return (
        <>
            <Main />
            <Second />
            <Third />
            <Join />
        </>
    )
}
    