import React from "react";

export default function HamburgerButton({hamburgerClickHandler, styles}) {

    return (
        <div className={styles.hamburgerContainer}>
            <div id="hamburger" className={styles.hamburger} onClick={hamburgerClickHandler}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    )
}