import React from "react";
import signStyles from '../Sign.module.css';
import img from '../../../../images/SignUp/main.svg';

export default function SignUp() {
    return (
        <section className={`first-section ${signStyles.section}`}>
            <div className={signStyles.container}>
                <div className={signStyles.textContainer}>
                    <h1 className={signStyles.title}>Rejoins nous !</h1>
                    <form className={signStyles.form}>
                        <div className={`input2_elementsContainer`}>
                            <label htmlFor="email">Email</label>
                            <div className={`input2_container`}>
                                <span className={`${signStyles.spanEmail} ${signStyles.span}`}></span>
                                <input type="email" name="email" id="email" placeholder="Entrez votre email" required></input>
                            </div>
                        </div>
                        <div className={`input2_elementsContainer`}>
                            <label htmlFor="pseudo">Pseudo</label>
                            <div className={`input2_container`}>
                                <span className={`${signStyles.spanUser} ${signStyles.span}`}></span>
                                <input type="text" name="pseudo" id="pseudo" placeholder="Entrez votre pseudo" required></input>
                            </div>
                        </div>
                        <div className={`input2_elementsContainer`}>
                            <label htmlFor="password">Mot de passe</label>
                            <div className={`input2_container`}>
                                <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                <input type="password" name="password" id="password" placeholder="Entrez votre mot de passe" required></input>
                            </div>
                        </div>
                        <input className="form-button" type="submit" value="S'inscrire" />
                    </form>
                </div>
                <img src={img} className={signStyles.img}></img>
            </div>
        </section>
    )
}