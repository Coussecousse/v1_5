import React, { useEffect } from "react";
// import styles from "./Carousel.module.css";

export default function Carousel({data, styles, activePic, handleClickPic}) {

    useEffect(() => {
        const active = document.querySelector(`.${styles.picContainer}.${styles.active}`);
        if (active) {
            active.classList.remove(styles.active);
        }

        const newActivePic = document.querySelector(`.${styles.picContainer}[data-pic="${activePic}"][data-type="${data.type}"]`);
        newActivePic.classList.add(styles.active);

        const container = document.querySelector(`.${styles.picsContainer}[data-type="${data.type}"]`);
        // console.log(container);
        if (container.dataset.type === 'country') {
            container.style.transform = `translateX(calc((-400px * ${activePic}) + (-4.5rem * ${activePic}))`;
        } else {
            console.log('coucou');
            console.log(container);
            container.style.transform = `translateX(calc((-100% + 400px * (${activePic} + 1)) + (4.5rem * (${activePic} + 1) + 4.5rem / 2 + 1.3rem)`;
        }
    }, [activePic]);

    return (
        <div className={styles.carousel}>
            <div className={styles.picsContainer} data-type={data.type}>
                { data.pics.map((pic, index) => {
                    return (
                        <div key={index} className={`${styles.picContainer}`} data-pic={index} data-type={data.type} >
                            <img 
                                src={pic.src} 
                                alt={pic.alt} 
                                className={styles.pic}
                                onClick={handleClickPic} />
                            <p className={styles.picTitle}>{pic.title}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};