import suisse from "../../images/Home/carousel/country/suisse.jpg";
import austria from "../../images/Home/carousel/country/austria.jpg";
import england from "../../images/Home/carousel/country/england.jpg";
import germany from "../../images/Home/carousel/country/germany.jpg";
import italia from "../../images/Home/carousel/country/italia.jpg";
import portugal from "../../images/Home/carousel/country/portugal.jpg";

import restaurant from "../../images/Home/carousel/activity/restaurant.jpg";
import attraction from "../../images/Home/carousel/activity/attraction.jpg";
import hiking from "../../images/Home/carousel/activity/hiking.jpg";
import museum from "../../images/Home/carousel/activity/museum.jpg";
import unusual from "../../images/Home/carousel/activity/unusual.jpg";
import view from "../../images/Home/carousel/activity/view.jpg";

export const carouselData = [
    {
        type: "country",
        title : "Des voyages",
        pics : [
            {
                src : suisse,
                alt : "Suisse",
                title : "Suisse"
            },
            {
                src : austria,
                alt : "Austria",
                title : "Autriche"
            },
            {
                src : england,
                alt : "Suisse",
                title : "Suisse"
            },
            {
                src : germany,
                alt : "Germany",
                title : "Allemagne"
            },
            {
                src : italia,
                alt : "Italia",
                title : "Italie"
            },
            {
                src : portugal,
                alt : "Portugal",
                title : "Portugal"
            },
        ],
        position : 0
    },
    {
        type: "activity",
        title : "Des activités",
        pics : [
            {
                src : restaurant,
                alt : "Restaurant",
                title : "Restaurant"
            },
            {
                src : attraction,
                alt : "Attraction",
                title : "Attraction"
            },
            {
                src : hiking,
                alt : "Randonnée",
                title : "Randonnée"
            },
            {
                src : museum,
                alt : "Musée",
                title : "Musée"
            },
            {
                src : unusual,
                alt : "Insolite",
                title : "Insolite"
            },
            {
                src : view,
                alt : "Vue",
                title : "Point de vue"
            }
        ],
        position : 1
    },
]
