import React from "react";
import formStyles from "../Form.module.css";

export default function InputsPasswords({errors, styles}) {
  return (
    <>
      <div>
        <div className={`input2_elementsContainer ${styles.input}`}>
          <label htmlFor='password'>
            Mot de passe<span className={`input2_requiredSpan`}>*</span>
          </label>
          <div className={`input2_container`}>
            <span
              className={`${formStyles.spanPassword} ${formStyles.span}`}
            ></span>
            <input
              type='password'
              name='password'
              id='password'
              placeholder='Entrez votre mot de passe'
              required
              autoComplete='password'
              className={errors.password ? `inputError` : ""}
            />
          </div>
        </div>
        {errors.password && (
          <small className={`smallFormError`}>{errors.password}</small>
        )}
        <small className='input2_info'>
          Le mot de passe doit contenir au moins 8 caractères, une minuscule,
          une majuscule et un chiffre.
        </small>
      </div>
      <div>
        <div className={`input2_elementsContainer ${styles.input}`}>
          <label htmlFor='confirmPassword'>
            Confirmer le mot de passe
            <span className={`input2_requiredSpan`}>*</span>
          </label>
          <div className={`input2_container ${styles.input}`}>
            <span
              className={`${formStyles.spanPassword} ${formStyles.span}`}
            ></span>
            <input
              type='password'
              name='confirmPassword'
              id='confirmPassword'
              placeholder='Confirmez le mot de passe'
              required
              className={errors.confirmPassword ? `inputError` : ""}
            />
          </div>
        </div>
          {errors.confirmPassword && (
            <small className={`smallFormError`}>{errors.confirmPassword}</small>
          )}
      </div>
    </>
  );
}
