import React, { useEffect, useState } from 'react';
import styles from './Info.module.css';
import yes from '../../../images/Info/yes.svg';
import bad from '../../../images/Info/bad.svg';
import Footer from '../Footer/Footer';

export default function Info({ message, goodOrBad }) {

    const [wait, setWait] = useState(true);

    useEffect(() => {
        if (message !== '') setWait(false);
        return;
    }, [message])

    return (
        <>
            <section className={`first-section ${styles.section}`}>
                {wait ? 
                <>
                <div className={styles.wait}>
                    <span className={styles.loader}></span>
                    <span className={styles.waitText}>Chargement...</span>
                </div>
                </> 
                :
                    <>
                        <div className={styles.textMessage}>
                            <div>{goodOrBad ? 
                                <span className={`${styles.goodIcon} ${styles.icon}`}></span>
                                :
                                <span className={`${styles.badIcon} ${styles.icon}`}></span>
                                }
                                <h1>{message}</h1>
                            </div>
                        </div>
                        <div className={styles.img}>
                            {goodOrBad ? 
                            <img src={yes}></img> :
                            <img src={bad}></img>}
                        </div>
                    </>
                }
            </section>
            <Footer />
        </>
    )
}