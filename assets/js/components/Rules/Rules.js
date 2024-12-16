import React from "react";
import styles from './Rules.module.css';

export default function Rules() {
    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title`}>Règles du RoadtripClub</h1>
            <p>Les règles du site sont les suivantes :</p>
            <ul className={styles.rulesList}>
                <ol>
                    <h2>1. Informations Authentiques</h2>
                    <p>Veuillez entrer des informations véridiques lorsque vous partagez des road trips, activités ou avis. Des informations fausses ou trompeuses peuvent nuire à la communauté.</p>
                </ol>
                <ol>
                    <h2>2. Pseudos Respectueux</h2>
                    <p>Utilisez un pseudo approprié et respectueux. Les pseudos insultants, offensants ou provocateurs ne sont pas autorisés.</p>
                </ol>
                <ol>
                    <h2>3. Contenu Visuel Adapté</h2>
                    <p>Lorsque vous ajoutez des photos, assurez-vous qu'elles respectent les valeurs de la communauté :</p>
                    <ul>
                        <li>Pas de contenu choquant, violent ou inapproprié.</li>
                        <li>Pas de contenu protégé par des droits d'auteur sans autorisation.</li>
                    </ul>
                </ol>
                <ol>
                    <h2>4. Respect et Bienveillance</h2>
                    <p>Le site repose sur un esprit d'échange et de convivialité. Soyez respectueux et bienveillant dans vos interactions avec les autres membres.</p>
                </ol>
                <ol>
                    <h2>5. Signalement de Contenu Inapproprié</h2>
                    <p>Si vous rencontrez un contenu qui ne respecte pas ces règles, veuillez le signaler aux administrateurs pour une modération rapide.</p>
                </ol>
                <ol>
                    <h2>6. Participation Active</h2>
                    <p>RoadtripClub est une communauté participative. Partagez vos expériences, conseils et road trips pour inspirer d'autres voyageurs !</p>
                </ol>
                <ol>
                    <h2>Merci de Faire Partie de RoadtripClub !</h2>
                    <p>En respectant ces règles, vous contribuez à maintenir une communauté accueillante et inspirante pour tous les amoureux de road trips.</p>
                </ol>
            </ul>
        </section>
    )
}