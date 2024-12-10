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
        if (container.dataset.type === 'country') {
            if (window.innerWidth >= 768) {
                container.style.transform = `translateX(calc(-${activePic} * (var(--image-size) + 4.5rem)))`;
            } else {
                container.style.transform = `translateX(calc(50% - (${activePic} * (var(--image-size) + 4.5rem) + var(--image-size) / 2)))`;
            }
        } else {
            if (window.innerWidth >= 768) {
                container.style.transform = `translateX(calc(-100% + (${activePic} + 1) * var(--image-size) + (${activePic} + 2) * 4.5rem))`;
            } else {
                container.style.transform = `translateX(calc(-50% + (${activePic} * (var(--image-size) + 4.5rem) + var(--image-size) / 2)))`;
            }
        }
    }, [activePic]);

    return (
        <div className={styles.carousel}>
            <div className={styles.picsContainer} data-type={data.type}>
                { data.pics.map((pic, index) => {
                    return (
                        <div key={index} className={`${styles.picContainer}`} data-pic={index} data-type={data.type} >
                            <picture className={styles.pic}>
                                <source srcSet={pic.src.xlarge} media="(min-width: 1200px)" />
                                <source srcSet={pic.src.large} media="(min-width: 768px)" />
                                <source srcSet={pic.src.medium} media="(min-width: 320px)" />
                                <img src={pic.src.small} alt={pic.alt} className={styles.pic} onClick={handleClickPic} />
                            </picture>
                            <p className={styles.picTitle}>{pic.title}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
};