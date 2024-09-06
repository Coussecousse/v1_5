import React from "react";
import signStyles from '../Sign.module.css';
import styles from './SignIn.module.css';
import img from '../../../../images/SignIn/main.svg';
import Footer from "../../../containers/Footer/Footer";

export default function SignIn() {
    return (
        <>
            <section className={`first-section ${signStyles.section}`}>
                <div className={signStyles.container}>
                    <img src={img} className={`${signStyles.img} ${styles.img}`}></img>
                    <div className={`${signStyles.textContainer} ${styles.textContainer}`}>
                        <h1 className={signStyles.title}>Bon retour !</h1>
                        <form className={signStyles.form}>
                            <div className={`input2_elementsContainer`}>
                                <label htmlFor="email">Email</label>
                                <div className={`input2_container`}>
                                    <span className={`${signStyles.spanEmail} ${signStyles.span}`}></span>
                                    <input type="email" name="email" id="email" placeholder="Entrez votre email" required autoComplete="email"></input>
                                </div>
                            </div>
                            <div className={`input2_elementsContainer`}>
                                <label htmlFor="password">Mot de passe</label>
                                <div className={`input2_container`}>
                                    <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                    <input type="password" name="password" id="password" placeholder="Entrez votre mot de passe" required autoComplete="password"></input>
                                </div>
                            </div>
                            <input className="form-button" type="submit" value="Se connecter" />
                        </form>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    )
}