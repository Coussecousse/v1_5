import React, { useState } from "react";
import styles from './ActivityDetailsCarousel.module.css';
import { Link } from "react-router-dom";

export default function ActivityDetailsCarousel({activity, opinion}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // -- Carousel functions --
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex < opinion.pics.length - 1 ? prevIndex + 1 : prevIndex
        );
    };
    
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };
    
    return (
        <div className={styles.container}>
            {opinion.pics.length > 0 && (
                <div className={styles.picsContainer}>
                    <div className={styles.carouselImgWrapper} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {opinion.pics.map((pic, index) => (
                            <img 
                                key={index} 
                                src={`/uploads/activity_pics/${pic}`} 
                                alt={`Picture ${index + 1}`}
                                className={styles.bigImg}/>
                        ))}
                    </div>
                    <div className={styles.smallContainer}>
                        {opinion.pics.length > 1 && (
                            <button onClick={prevSlide} disabled={currentIndex === 0} aria-label="Precedent" className={styles.button}>❮</button>
                        )}
                        <div className={styles.smallPicContainer}>
                            {opinion.pics.map((pic, index) => (
                                <img key={index} 
                                    src={`/uploads/activity_pics/${pic}`} 
                                    alt={`Picture ${index + 1}`} 
                                    className={`${currentIndex === index ? styles.active : '' } ${styles.minPic}`} 
                                    onClick={() => setCurrentIndex(index)}/>
                            ))}
                        </div>
                        {opinion.pics.length > 1 && (
                            <button onClick={nextSlide} disabled={currentIndex === opinion.pics.length - 1} aria-label="Precedent" className={styles.button}>❯</button>
                        )}
                    </div>
                </div>
            )}
            <div className={styles.textContainer}>
                <div className={styles.descriptionContainer}>
                    <Link className={styles.profilePic} style={{ backgroundImage: `url(/uploads/profile_pics/${opinion.user.profile_pic})` }}
                    ></Link>
                    <p className={styles.text}>{opinion.description}</p>
                </div>
                <div className={styles.iconsContainer}>
                    <p aria-label="Type"><span className={`${styles.icon} ${styles.type}`}></span>{activity.type}</p>
                    <p aria-label="Country"><span className={`${styles.icon} ${styles.country}`}></span>{activity.country}</p>
                </div>
            </div>
        </div>
    )
}