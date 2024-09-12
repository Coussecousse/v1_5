import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import signStyles from '../Sign.module.css';
import styles from './SignIn.module.css';
import img from '../../../../images/SignIn/main.svg';
import Footer from "../../../containers/Footer/Footer";
import paths from "../../../config/paths";
import axios from 'axios';

export default function SignIn({ setIsAuthenticated }) {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const flashRef = useRef(null);
    const navigate = useNavigate(); 

    // Fetch CSRF token when component mounts
    useEffect(() => {
        axios.get('/api/sign-in/csrf-token')
            .then(response => {
                setCsrfToken(response.data.csrfToken);
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        flashRef.current.innerHTML = `<span clasNames="${signStyles.loader} loader"></span>`;

        // Post the form data to the sign-in API
        axios.post('/api/sign-in', formData)
        .then(response => {
            flashRef.current.innerHTML = `<div class="flash flash-success">Connexion réussie !</div>`;
            setErrors({});

            // Redirect to profile page after successful sign-in
            setIsAuthenticated(true);
            setTimeout(() => {
                navigate(paths.PROFILE);
            }, 250);
        })
        .catch(error => {
            flashRef.current.innerHTML = `<div class="flash flash-error">Erreur lors de la connexion.</div>`;
            setErrors(error.response.data.errors || {});
        });
    }

    return (
        <>
            <section className={`first-section ${signStyles.section}`}>
                <div className={signStyles.container}>
                    <img src={img} className={`${signStyles.img} ${styles.img}`} alt="Sign in"></img>
                    <div className={`${signStyles.textContainer} ${styles.textContainer}`}>
                        <h1 className={signStyles.title}>Bon retour !</h1>
                        <div className={`formFlash`} ref={flashRef}></div>
                        <form className={signStyles.form} onSubmit={handleSubmit}>
                            <div className={`input2_elementsContainer`}>
                                <label htmlFor="email">Email<span className={`input2_requiredSpan`}>*</span></label>
                                <div className={`input2_container`}>
                                    <span className={`${signStyles.spanEmail} ${signStyles.span}`}></span>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        placeholder="Entrez votre email" 
                                        required 
                                        autoComplete="email"
                                        className={errors.email ? `inputError` : ''}
                                    />
                                </div>
                                {errors.email && <small className={`smallFormError`}>{errors.email}</small>}
                            </div>
                            <div className={`input2_elementsContainer`}>
                                <label htmlFor="password">Mot de passe<span className={`input2_requiredSpan`}>*</span></label>
                                <div className={`input2_container`}>
                                    <span className={`${signStyles.spanPassword} ${signStyles.span}`}></span>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        id="password" 
                                        placeholder="Entrez votre mot de passe" 
                                        required 
                                        autoComplete="password"
                                        className={errors.password ? `inputError` : ''}
                                    />
                                </div>
                                {errors.password && <small className={`smallFormError`}>{errors.password}</small>}
                            </div>
                            <div>
                                <input className={`input2_checkbox`} type="checkbox" name="remember_me" id="remember_me" />
                                <label htmlFor="remember_me">Me garder connecté</label>
                                {errors.agreeTerms && <small className={`smallFormError`}>{errors.agreeTerms}</small>}
                            </div>
                            <input type="hidden" name="_token" value={csrfToken} />
                            <small className={`input2_required`}>* Requis</small>
                            <input className="form-button" type="submit" value="Se connecter" />
                        </form>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
