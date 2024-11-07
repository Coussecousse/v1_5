import React, { useState, useEffect } from "react";
import signStyles from '../Sign.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import img from '../../../../images/SignUp/main.svg';
import axios from "axios";
import InputsPasswords from "../../../containers/Form/InputsPasswords/InputsPasswords";

export default function SignUp() {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true); 
    const [flashMessage, setFlashMessage] = useState(null); 
    
    useEffect(() => {
        axios.get('/api/sign-up/csrf-token')
            .then(response => {
                setCsrfToken(response.data.csrfToken);
                setLoading(false); 
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
                setLoading(false);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        setLoading(true); 
        setFlashMessage(null); 

        
        axios.post('api/sign-up', formData)
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Un email de vérification vous a été envoyé.' });
                setErrors({});
            })
            .catch(error => {
                setFlashMessage({ type: 'error', message: 'Une erreur est survenue.' });
                setErrors(error.response.data.errors || {}); 
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <section className={`first-section ${formStyles.section}`}>
                <div className={formStyles.container}>
                    <div className={formStyles.textContainer}>
                        <h1 className={`${formStyles.title} typical-title`}>Rejoins nous !</h1>
                        
                        {flashMessage && (
                            <div className={`flash flash-${flashMessage.type}`}>
                                {flashMessage.message}
                            </div>
                        )}

                        {loading ? (
                            <div className={`${formStyles.loaderContainer} loader-container`}>
                                <span className={`loader ${formStyles.loader}`}></span>
                                <span className="loader-text">Chargement...</span>
                            </div>
                        ) : (
                            <form className={formStyles.form} onSubmit={handleSubmit}>
                                <div>
                                    <div className={`input2_elementsContainer ${signStyles.input}`}>
                                        <label htmlFor="email">Email<span className={`input2_requiredSpan`}>*</span></label>
                                        <div className={`input2_container`}>
                                            <span className={`${formStyles.spanEmail} ${formStyles.span}`}></span>
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
                                    <div className={`input2_elementsContainer ${signStyles.input}`}>
                                        <label htmlFor="username">Nom d'utilisateur<span className={`input2_requiredSpan`}>*</span></label>
                                        <div className={`input2_container`}>
                                            <span className={`${formStyles.spanUser} ${formStyles.span}`}></span>
                                            <input 
                                                type="text" 
                                                name="username" 
                                                id="username" 
                                                placeholder="Entrez votre nom d'utilisateur" 
                                                required 
                                                className={errors.username ? `inputError` : ''}
                                            />
                                        </div>
                                    </div>
                                    {errors.username && <small className={`smallFormError`}>{errors.username}</small>}
                                </div>
                                <InputsPasswords errors={errors} styles={signStyles} />
                                <div>
                                    <input className={`input2_checkbox`} type="checkbox" name="agreeTerms" id="agreeTerms" />
                                    <label htmlFor="agreeTerms">Vous acceptez les conditions d'utilisations.</label>
                                    {errors.agreeTerms && <small className={`smallFormError`}>{errors.agreeTerms}</small>}
                                </div>
                                <input type="hidden" name="_token" value={csrfToken} />
                                <small className={`input2_required`}>* Requis</small>
                                <input className="form-button" type="submit" value="S'inscrire" />
                            </form>
                        )}
                    </div>
                    <img src={img} className={formStyles.img} alt="Sign up" />
                </div>
            </section>
        </>
    );
}
