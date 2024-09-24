import React,{ useState, useEffect } from 'react';
import styles from '../../ResetPassword.module.css';
import formStyles from '../../../../containers/Form/Form.module.css'
import signStyles from '../../../Sign/Sign.module.css';
import ResetPasswordImage from '../../ResetPasswordImage/ResetPasswordImage';
import axios from "axios";

export default function EmailForm({ isAuthenticated }) {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null);
    const [email, setEmail] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // CSRF token first
                const csrfResponse = await axios.get('/api/reset-password/csrf-token');
                setCsrfToken(csrfResponse.data.csrfToken);
    
                // User profile
                if (isAuthenticated) {
                    const userResponse = await axios.get('/api/profile');
                    setEmail(userResponse.data.user.email);
                }
    
                setLoading(false);  
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);  
            }
        };
    
        fetchData(); 
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        setLoading(true); 
        setFlashMessage(null); 

        if (email) {
            formData.append('email', email);
        }

        // Post the form data to the sign-up API
        axios.post('api/reset-password', formData)
        .then(response => {
            setFlashMessage({ type: 'success', message: 'Un email pour réinitialiser votre mot de passe vous a été envoyé.' });
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
                    <h1 className={`${formStyles.title} typical-title`}>Réinitialiser son mot de passe</h1>

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
                                            value={email ?? ''}
                                            disabled={email ? true : false}
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
        </>


    )
}