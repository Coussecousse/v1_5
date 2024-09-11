import React,{ useState, useEffect } from 'react';
import Info from '../../containers/Info/Info';
import axios from "axios";

export default function VerifyEmail() {
    const [newsStatus, setNewsStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryObject = Object.fromEntries(params);

        axios.get('/api/verify-email', { params: queryObject })
            .then(response => {
                setNewsStatus(true);
            })
            .catch(error => {
                setNewsStatus(false);
                const errorMessage = error.response?.data?.message || 'An error occurred';
                setErrorMessage(errorMessage);
            });
    }, []);
    

    return (
        <Info message={newsStatus ? 'Votre email a été vérifié avec succès !' : errorMessage} goodOrBad={newsStatus} />
    )
}