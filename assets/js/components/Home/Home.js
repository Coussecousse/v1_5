import React, {Component} from 'react';
import styles from './Home.module.css';
import Main from './Main/Main';
import Second from './Second/Second';
    
class Home extends Component {
    
    render() {
        return (
        <>
            <Main />
            <Second />
        </>
        )
    }
}
    
export default Home;