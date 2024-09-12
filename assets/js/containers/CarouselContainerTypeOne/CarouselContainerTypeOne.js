import React, { useEffect } from "react";
import styles from './CarouselContainerTypeOne.module.css';
import Carousel from "./Carousel/Carousel";


export default function CarouselContainerTypeOne({data}) {
    const position = !data.position ? styles.right : styles.left;

    const [activePic, setActivePic] = React.useState(0);
    
    useEffect(() => {
        const activeButton = document.querySelector(`.${styles.button}.${styles.active}[data-type="${data.type}"]`);
        if (activeButton) {
            activeButton.classList.remove(styles.active);
        }

        const newActiveButton = document.querySelector(`.${styles.button}[data-button="${activePic}"][data-type="${data.type}"]`);
        newActiveButton.classList.add(styles.active);
    }, [activePic]);

    const handleClickButton = e => {
        const button = e.target;

        const newActivePic = button.getAttribute("data-button");
        setActivePic(newActivePic);
    }

    const handleClickPic = e => {
        const pic = e.target;
        
        const newActivePic = pic.parentElement.getAttribute("data-pic");
        setActivePic(newActivePic);
    }

    return (
        <>
            <div className={`${position} ${styles.carouselContainer}`}>
                <h3 className={styles.title}>{data.title}</h3>
                <Carousel 
                    data={data} 
                    styles={styles} 
                    activePic={activePic} 
                    handleClickPic={handleClickPic}/>
            </div>
            <div className={`${styles.buttonsContainer} ${position}` }>
                <div className={styles.buttons}>
                    { data.pics.map((pic, index) => {
                        return (
                            <button 
                                className={`${styles.button}`} 
                                data-button={index} 
                                key={index}
                                data-type={data.type}
                                onClick={handleClickButton}
                                ></button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}