import React from "react";
import styles from "./Main.module.css"
import DestinationsSection from "../../../containers/DestinationsSection/DestinationsSection";
import { data } from '../../../config/DestinationsData';

export default function Main() {
    return (
        <section className={`first-section ${styles.section}`}>
            <div className={styles.background}></div>
            <div className={styles.strip}></div>
            
            <div className={styles.textContainer}>
                <ul className={styles.titlesCountry}>
                    {data.map((data, index) => {
                        return (
                            <li key={index} data-section={index} className="yellow-link">{data.title}</li>
                        )
                    })}
                </ul>
                {
                    data.map((data, index) => {
                        return (
                            <DestinationsSection data={data} key={index} index={index} />
                        )
                    })
                }
            </div>
        </section>
    )
}