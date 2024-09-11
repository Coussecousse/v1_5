import React from 'react';
import styles from './Info.module.css';

export default function Info({ message, goodOrBad }) {


    return (
        <section className={`first-section typical-section ${styles.section}`}>
            <div>
                <h1>{message}</h1>
            </div>
            <div>

            </div>
        </section>
    )
}