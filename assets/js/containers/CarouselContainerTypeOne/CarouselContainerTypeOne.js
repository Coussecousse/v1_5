import React from "react";
import styles from './CarouselContainerTypeOne.module.css';
import Carousel from "./Carousel/Carousel";


export default function CarouselContainerTypeOne({data}) {
    console.log(data);
    return (
        <div>
            <h3>{data.title}</h3>
            <Carousel data={data} />
        </div>
    )
}