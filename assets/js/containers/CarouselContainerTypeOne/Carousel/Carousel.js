import React from "react";
import styles from "./Carousel.module.css";

export default function Carousel({data, key}) {
    return (
        <div key={key}>
            <div className={styles.carouselContainer}>
                { data.pics.map((pic, index) => {
                    return (
                        <div key={index}>
                            <img src={pic.src} alt={pic.alt} />
                            <p>{pic.title}</p>
                        </div>
                    )
                })}
                <div className={styles.buttons}>
                { data.pics.map((pic, index) => {
                    <button className={styles.button} data-id={index} key={key}></button>
                })}
                </div>
            </div>
        </div>
    )
};