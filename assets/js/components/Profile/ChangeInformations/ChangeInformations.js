import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChangeInformations.module.css';
import profileStyles from '../Profile.module.css';  
import formStyles from '../../../containers/Form/Form.module.css';
import paths from '../../../config/paths';
import axios from 'axios';

export default function ChangeInformations() {
    const [errors, setErrors] = useState({});
    const [csrfToken, setCsrfToken] = useState();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // CSRF token first
                const csrfResponse = await axios.get('/api/profile/change-informations/csrf');
                setCsrfToken(csrfResponse.data.csrfToken);
    
                // User profile
                const userResponse = await axios.get('/api/profile');
                setUser(userResponse.data.user);
    
                setLoading(false);  
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);  
            }
        };
    
        fetchData(); 
    }, []);
    
    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "profile_pic") {
            setUser(prevUser => ({ ...prevUser, [name]: files[0] }));  // For file input, handle the uploaded file
        } else {
            setUser(prevUser => ({ ...prevUser, [name]: value }));  // For text inputs
        }
    };

    const handleSubmit = e => {
        e.preventDefault();

        const form = e.target;
        const data = new FormData(form);

        if (form.email.value === '') {
            data.append('email', user.email);
        }
        if (form.username.value === '') {
            data.append('username', user.username);
        }

        setLoading(true);
        setFlashMessage(null);

        axios.post('/api/profile/change-informations', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response => {
            setFlashMessage({ type: 'success', message: 'Le profil a été mit à jour.' });
            setErrors({});

            // Redirect to the profile page
            setTimeout(() => {
                navigate(paths.PROFILE);
            }, 250);
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
        <section className={`first-section ${profileStyles.section}`}>
            <h1 className={`typical-title ${profileStyles.title}`}>Modifier mes informations</h1>
            <div className={profileStyles.container}>
                {loading ? (                            
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${styles.loader}`}></span>
                        <span className={`loader-text ${profileStyles.loaderText}`}>Chargement...</span>
                    </div>)
                : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {flashMessage && (
                            <div className={`flash flash-${flashMessage.type} ${profileStyles.flash}`}>
                                {flashMessage.message}
                            </div>
                        )}
                        <div>
                            <div className={`${styles.input} input2_elementsContainer`}>
                                <label htmlFor="profile_pic">Photo de profil :</label>
                                <div className={`input2_container`}>
                                    <input 
                                    type="file" 
                                    id="profile_pic" 
                                    name="profile_pic" 
                                    accept="image/png, image/jpeg, image/jpg" 
                                    onChange={handleInputChange} />
                                </div>
                            </div>
                            {errors.profile_pic && <small className={`smallFormError ${profileStyles.error}`}>{errors.profile_pic}</small>}
                        </div>
                        <div>
                            <div className={`${styles.input} input2_elementsContainer`}>
                                <label htmlFor="username">Nom d'utilisateur</label>
                                <div className={`input2_container`}>
                                    <span className={`${formStyles.spanUser} ${formStyles.span} ${styles.spanIcon}`}></span>
                                    <input 
                                        type="text" 
                                        id="username" 
                                        name="username" 
                                        autoComplete="username" 
                                        value={user.username}
                                        onChange={handleInputChange} />
                                </div>
                            </div>
                            {errors.username && <small className={`smallFormError ${profileStyles.error}`}>{errors.username}</small>}
                        </div>
                        <div>
                            <div className={`${styles.input} input2_elementsContainer`}>
                                <label htmlFor="email">Email</label>
                                <div className={`input2_container`}>
                                    <span className={`${formStyles.spanEmail} ${formStyles.span} ${styles.spanIcon}`}></span>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email" 
                                        autoComplete="email" 
                                        value={user.email} 
                                        onChange={handleInputChange} />
                                </div>
                            </div>
                            {errors.email && <small className={`smallFormError ${profileStyles.error}`}>{errors.email}</small>}
                        </div>
                        <span className={profileStyles.spanDiviser}></span>
                        <p>Indiquez votre mot de passe pour modifier :</p>
                        <div>
                            <div className={`${styles.input} input2_elementsContainer`}>
                                <label htmlFor="password">Mot de passe</label>
                                <div className={`input2_container`}>
                                    <span className={`${formStyles.spanPassword} ${formStyles.span} ${styles.spanIcon}`}></span>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        autoComplete="password"
                                        placeholder="Mot de passe"
                                        required/>
                                </div>
                            </div>
                            {errors.password && <small className={`smallFormError ${profileStyles.error}`}>{errors.password}</small>}
                        </div>
                        <input type="hidden" name="_token" value={csrfToken} />
                        <button type="submit" className={`small-button ${profileStyles.button}`} >Modifier</button>
                    </form>
                )}
            </div>
        </section>
    )
}