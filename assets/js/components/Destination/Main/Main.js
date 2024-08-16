import React, { useEffect, useState } from "react";
import styles from "./Main.module.css"
import DestinationsSection from "../../../containers/DestinationsSection/DestinationsSection";
import { data } from '../../../config/DestinationsData';

export default function Main() {

    const [currentCountry, setCurrentCountry] = useState(0);

    const handleClick = e =>{
        const button = e.target;
        const section = button.dataset.section;

        setCurrentCountry(section);
    }

    useEffect(() => {
        const activeButton = document.querySelector(`.yellow-link.active`);
        if (activeButton) {
            activeButton.classList.remove('active');
        }

        const newActiveButton = document.querySelector(`.yellow-link[data-section="${currentCountry}"]`);
        newActiveButton.style.display = 'flex';
        newActiveButton.classList.add('active');
    }, [currentCountry]);

    return (
        <section className={`first-section ${styles.section}`}>
            <div className={styles.background}></div>
            <div className={styles.strip}></div>
            
            <div className={`${styles.textContainer} typical-section`}>
                <ul className={styles.titlesCountry}>
                    {data.map((data, index) => {
                        return (
                            <li onClick={handleClick} key={index} data-section={index} className="yellow-link">{data.title}</li>
                        )
                    })}
                </ul>
                {
                    data.map((data, index) => {
                        return (
                            <DestinationsSection currentCountry={currentCountry} data={data} key={index} index={index} />
                        )
                    })
                }
            </div>
        </section>
    )
}