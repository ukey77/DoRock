import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../css/Navigator.module.css";

function Navigator() {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate("/");
    }

    return (
        <>
            <div className={styles.portfolioMessage}>
                <p className={styles.portfolioText}>본 페이지는 <b>비상업적인 포트폴리오 목적</b>으로 제작되었습니다. <span className={styles.portfolioTeam}>-Team Dyno-</span>
                </p>
            </div>
            <div className={styles.navigator}>
                <section className={styles.logoArea} onClick={e => goToHome()}></section>
                <nav className={styles.navBar}>
                    <ul className={styles.menuElement}>
                        <li><Link to="/" className={styles.linkStyle}>홈</Link> </li>
                        <li><Link to="/tripInfo" className={styles.linkStyle}>여행정보</Link></li>
                        <li><Link to="/aiPrompt" className={styles.linkStyle}>AI여행</Link></li>
                    </ul>
                </nav>
                <section className={styles.buttonArea}></section>
            </div>
        </>
    )
}

export default Navigator;