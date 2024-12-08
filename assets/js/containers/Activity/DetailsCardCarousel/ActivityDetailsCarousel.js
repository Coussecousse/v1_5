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
        <>
        
            <div className={styles.container}>
                {opinion.pics.length > 0 && (
                    <div className={styles.picsContainer}>
                        <div className={styles.carouselImgWrapper} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                            {opinion.pics.map((pic, index) => (
                                <picture className={styles.bigImg} key={index}>
                                    <source 
                                        srcSet={`/uploads/activity_pics/small/${pic}`} 
                                        media="(min-width: 1200px)" 
                                    />
                                    <source 
                                        srcSet={`/uploads/activity_pics/medium/${pic}`} 
                                        media="(min-width: 990px)" 
                                    />
                                    <source 
                                        srcSet={`/uploads/activity_pics/large/${pic}`} 
                                        media="(min-width: 768px)" 
                                    />
                                    <img 
                                        src={`/uploads/activity_pics/extraLarge/${pic}`} 
                                        alt="Image de l'activité" 
                                    />
                                </picture>
                            ))}
                        </div>
                        <div className={styles.smallContainer}>
                            {opinion.pics.length > 1 && (
                                <button onClick={prevSlide} disabled={currentIndex === 0} aria-label="Precedent" className={styles.button}>❮</button>
                            )}
                            <div className={styles.smallPicContainer}>
                                {opinion.pics.map((pic, index) => (
                                    <picture className={styles.minPic} key={index}>
                                        <source 
                                            srcSet={`/uploads/activity_pics/extraLarge/${pic}`} 
                                            media="(min-width: 1200px)"
                                        />
                                        <source
                                            srcSet={`/uploads/activity_pics/large/${pic}`}
                                            media="(min-width: 990px)"
                                        />
                                        <source
                                            srcSet={`/uploads/activity_pics/medium/${pic}`}
                                            media="(min-width: 768px)"
                                        /> 
                                        <img
                                            src={`/uploads/activity_pics/small/${pic}`}
                                            alt={`Image ${index + 1}`}
                                            className={`${currentIndex === index ? styles.active : '' } ${styles.minPic}`}
                                            onClick={() => setCurrentIndex(index)}
                                        />
                                    </picture>
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
                        <Link className={styles.profilePic} style={{ backgroundImage: `url(/uploads/profile_pics/small/${opinion.user.profile_pic})` }}
                        ></Link>
                        <p className={styles.text}>{opinion.description}</p>
                    </div>
                    <div className={styles.iconsContainer}>
                        <p aria-label="Type"><span className={`${styles.icon} ${styles.type}`}></span>{activity.type}</p>
                        <p aria-label="Country"><span className={`${styles.icon} ${styles.country}`}></span>{activity.country}</p>
                    </div>
                </div>
            </div>
        </>
    )
}