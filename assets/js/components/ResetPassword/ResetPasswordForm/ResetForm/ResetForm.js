import React,{ useState, useEffect } from 'react';
import styles from '../../ResetPassword.module.css';
import formStyles from '../../../../containers/Form/Form.module.css';
import ResetPasswordImage from '../../ResetPasswordImage/ResetPasswordImage';
import Footer from '../../../../containers/Footer/Footer';
import axios from "axios";
import InputsPasswords from '../../../../containers/Form/InputsPasswords/InputsPasswords';

export default function ResetForm() {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null);

    useEffect(() => {
        axios.get('/api/reset-password/reset/csrf-token')
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

        const url = window.location.href;
        const segments = url.split('/').filter(segment => segment.length > 0);
        const lastThreeSegments = segments.slice(-3).join('/');
        const apiUrl = `/api/${lastThreeSegments}`;

        const form = e.target;
        const formData = new FormData(form);
        setLoading(true); 
        setFlashMessage(null);

        axios.post(apiUrl, formData)
        .then(response => {
            setFlashMessage({ type: 'success', message: 'Votre mot de passe a été réinitialisé.' });
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
                            <InputsPasswords errors={errors} />
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