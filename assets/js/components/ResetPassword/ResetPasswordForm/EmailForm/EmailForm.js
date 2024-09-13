import React,{ useState, useEffect } from 'react';
import styles from '../../ResetPassword.module.css';
import formStyles from '../../../../containers/Form/Form.module.css'
import ResetPasswordImage from '../../ResetPasswordImage/ResetPasswordImage';
import Footer from '../../../../containers/Footer/Footer';
import axios from "axios";

export default function EmailForm() {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null);

    useEffect(() => {
        axios.get('/api/reset-password/csrf-token')
            .then(response => {
                setCsrfToken(response.data.csrfToken);
                setLoading(false); // Stop the loader when the CSRF token is received
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
                setLoading(false); // Stop the loader in case of an error
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        setLoading(true); // Show the loader while submitting
        setFlashMessage(null); // Clear any existing flash messages

        // Post the form data to the sign-up API
        axios.post('api/reset-password', formData)
        .then(response => {
            setFlashMessage({ type: 'success', message: 'Un email pour réinitialiser votre mot de passe vous a été envoyé.' });
            setErrors({});
        })
        .catch(error => {
            setFlashMessage({ type: 'error', message: 'Une erreur est survenue.' });
            setErrors(error.response.data.errors || {}); // Set the errors if they exist
        })
        .finally(() => {
            setLoading(false); // Stop the loader after the request finishes
        });
    }

    return (
        <>
            <section className={`first-section ${styles.section}`}>
                <ResetPasswordImage />
                <div className={`${styles.formContainer}`}>
                    <h1 className={formStyles.title}>Réinitialiser son mot de passe</h1>

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
                        <form className={formStyles.form} onSubmit={handleSubmit} >
                            <div>
                                <div className={`input2_elementsContainer`}>
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
                            <input type="hidden" name="_token" value={csrfToken} />
                            <input className="form-button" type="submit" value="Réinitialiser" />
                        </form>
                    )}
                </div>
            </section>
            <Footer />
        </>


    )
}