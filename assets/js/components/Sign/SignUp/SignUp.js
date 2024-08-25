import React from "react";
import signStyles from '../Sign.module.css';
import img from '../../../../images/SignUp/main.svg';
import Footer from '../../../containers/Footer/Footer';

export default function SignUp() {
    return (
        <>
            <section className={`first-section ${signStyles.section}`}>
                <div className={signStyles.container}>
                    <div className={signStyles.textContainer}>
                        <h1 className={signStyles.title}>Rejoins nous !</h1>
                        <form className={signStyles.form}>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="email">Email<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanEmail} ${signStyles.span}`}></span>
                                        <input type="email" name="email" id="email" placeholder="Entrez votre email" required></input>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="pseudo">Pseudo<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanUser} ${signStyles.span}`}></span>
                                        <input type="text" name="pseudo" id="pseudo" placeholder="Entrez votre pseudo" required></input>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="password">Mot de passe<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                        <input type="password" name="password" id="password" placeholder="Entrez votre mot de passe" required></input>
                                    </div>
                                </div>
                                <small className="input2_info">Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule et un chiffre.</small>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="confirm-password">Confirmer le mot de passe<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                        <input type="confirm-password" name="confirm-password" id="confirm-password" placeholder="Confirmez le mot de passe" required></input>
                                    </div>
                                </div>
                            </div>
                            <small className={`input2_required`}>* Requis</small>
                            <input className="form-button" type="submit" value="S'inscrire" />
                        </form>
                    </div>
                    <img src={img} className={signStyles.img}></img>
                </div>
            </section>
            <Footer />
        </>
    )
}