import React, {Component} from 'react';
import styles from './Home.module.css';
    
class Home extends Component {
    
    render() {
        return (
           <section className={styles.main}>
                <div className={styles.backgroundImage}></div>
                <div className={styles.content}>
                    <h1 className={styles.title}>Préparez votre voyage<br/><span className={styles.secondTitle}>simplement</span><span className={styles.andTitle}> et </span><span className={styles.secondTitle}>rapidement</span></h1>
                    <div className={styles.scroll}>
                        <div className={styles.compass}></div>
                        <span>scroll</span>
                    </div>
                </div>
           </section>
        )
    }
}
    
export default Home;