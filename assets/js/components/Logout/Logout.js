import React, { useEffect } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";

export default function Logout({setLoading}) {
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get('/api/logout')
            .then(response => {
                window.location.reload();
            })
            .catch(error => {
                console.error('Logout failed', error);
            });
    }, []);
    
    return (
        <></>
    )
}