import React from "react";
import styles from "./Second.module.css";
import { Link } from "react-router-dom";
import paths from "../../../config/paths";
import svg from '../../../../images/Home/second.svg'

export default function Second() {
    return (
        <section className={`${styles.section} typical-section`}>
            <div className={styles.textContainer}>
                <h2 className={styles.title}>On va où ?</h2>
                <form className={styles.form}>
                    <input className="input" placeholder="Autriche..."></input>
                    <button type="submit" className="button">Rechercher</button>
                </form>
                <Link to="" className={`${styles.surprise} link`}>Laisse toi surprendre...<div className={styles.icon}></div></Link>
            </div>
            <img src={svg} className={styles.svg}></img>
        </section>
    )
}