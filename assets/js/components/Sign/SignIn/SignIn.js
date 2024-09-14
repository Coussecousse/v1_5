import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import signStyles from '../Sign.module.css';
import styles from './SignIn.module.css';
import img from '../../../../images/SignIn/main.svg';
import Footer from "../../../containers/Footer/Footer";
import paths from "../../../config/paths";
import axios from 'axios';

export default function SignIn({ setIsAuthenticated }) {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null); // State for flash messages
    const navigate = useNavigate();

    // Fetch CSRF token when component mounts
    useEffect(() => {
        axios.get('/api/sign-in/csrf-token')
            .then(response => {
                setCsrfToken(response.data.csrfToken);
                setLoading(false); // Stop loader when CSRF token is received
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
                setLoading(false); // Stop loader on error
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        setLoading(true); // Start loader during submission
        setFlashMessage(null); // Clear any previous flash messages

        // Post the form data to the sign-in API
        axios.post('/api/sign-in', formData)
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Connexion réussie !' });
                setErrors({});
                
                // Update authentication state and navigate to profile after successful login
                setIsAuthenticated(true);
                setTimeout(() => {
                    navigate(paths.PROFILE);
                }, 250);
            })
            .catch(error => {
                setFlashMessage({ type: 'error', message: 'Erreur lors de la connexion.' });
                setErrors(error.response.data.errors || {});
            })
            .finally(() => {
                setLoading(false); // Stop loader after the request finishes
            });
    }

    return (
        <>
            <section className={`first-section ${signStyles.section}`}>
                <div className={signStyles.container}>
                    <img src={img} className={`${signStyles.img} ${styles.img}`} alt="Sign in" />
                    <div className={`${signStyles.textContainer} ${styles.textContainer}`}>
                        <h1 className={`${signStyles.title} typical-title`}>Bon retour !</h1>

                        {/* Display the flash message */}
                        {flashMessage && (
                            <div className={`flash flash-${flashMessage.type}`}>
                                {flashMessage.message}
                            </div>
                        )}

                        {loading ? (
                            <div className={`${signStyles.loaderContainer} loader-container`}>
                                <span className={`loader ${signStyles.loader}`}></span>
                                <span className="loader-text">Chargement...</span>
                            </div>
                        ) : (
                            <>
                            <form className={signStyles.form} onSubmit={handleSubmit}>
                                <div className={`input2_elementsContainer`}>
                                    <label htmlFor="email">Email<span className={`input2_requiredSpan`}>*</span></label>
                                    <div>
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
                                    </div>
                                    {errors.email && <small className={`smallFormError`}>{errors.email}</small>}
                                    </div>
                                <div>
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
                                    </div>
                                    <Link to={paths.RESET_PASSWORD} className={`${signStyles.link} link`}>Mot de passe oublié ?</Link>
                                    {errors.password && <small className={`smallFormError`}>{errors.password}</small>}
                                </div>
                                <div className="checkbox2Container">
                                    <input className={`input2_checkbox`} type="checkbox" name="remember_me" id="remember_me" />
                                    <label htmlFor="remember_me">Me garder connecté</label>
                                    {errors.agreeTerms && <small className={`smallFormError`}>{errors.agreeTerms}</small>}
                                </div>
                                <input type="hidden" name="_token" value={csrfToken} />
                                <small className={`input2_required`}>* Requis</small>
                                <input className="form-button" type="submit" value="Se connecter" />
                            </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
}
