import React from 'react';
import img from '../../../../images/Reset/Reset.svg';
import styles from './ResetPasswordImage.module.css';

export default function ResetPasswordImage() {
    return (
        <img src={img} className={`${styles.img}`}></img>
    )
}