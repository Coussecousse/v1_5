import React, { useState, useRef, useEffect } from "react";
import signStyles from '../Sign.module.css';
import img from '../../../../images/SignUp/main.svg';
import Footer from '../../../containers/Footer/Footer';
import axios from "axios";

export default function SignUp() {
    const [errors, setErrors] = useState([]);
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        axios.get('/api/csrf-token')
            .then(response => {
                setCsrfToken(response.data.csrfToken);
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
            });
    }, []);
    const flashRef = useRef(null);

    const handleSubmit = e => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form); 

        axios.post('api/sign-up', formData)
            .then(response => {
                flashRef.current.innerHTML = `<div class="flash flash-success">Un email de vérification vous a été envoyé.</div>`;
            })
            .catch(error => {
                setErrors(error.response.data.errors || [])
            })
    } 

    return (
        <>
            <section className={`first-section ${signStyles.section}`}>
                <div className={signStyles.container}>
                    <div className={signStyles.textContainer}>
                        <h1 className={signStyles.title}>Rejoins nous !</h1>
                        <div className={`formFlash`} ref={flashRef}></div>
                        <form className={signStyles.form} onSubmit={handleSubmit}>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="email">Email<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanEmail} ${signStyles.span}`}></span>
                                        <input type="email" name="email" id="email" placeholder="Entrez votre email" required autoComplete="email"></input>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="username">Nom d'utilisateur<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanUser} ${signStyles.span}`}></span>
                                        <input type="text" name="username" id="username" placeholder="Entrez votre nom d'utilisateur" required></input>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="password">Mot de passe<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                        <input type="password" name="password" id="password" placeholder="Entrez votre mot de passe" required autoComplete="password"></input>
                                    </div>
                                </div>
                                <small className="input2_info">Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule et un chiffre.</small>
                            </div>
                            <div>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="confirmPassword">Confirmer le mot de passe<span className={`input2_requiredSpan`}>*</span></label>
                                    <div className={`input2_container`}>
                                        <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                        <input type="password" name="confirmPassword" id="confirmPassword" placeholder="Confirmez le mot de passe" required></input>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <input className={`input2_checkbox`} type="checkbox" name="agreeTerms" id="agreeTerms"></input>
                                <label htmlFor="agreeTerms">Vous acceptez les conditions d'utilisations.</label>
                            </div>
                            <input type="hidden" name="_token" value={csrfToken} />
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