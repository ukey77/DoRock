import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import areaCode1 from '../data/areaCode1.json';
import searchKeyword1 from '../data/searchKeyword1.json';

import styles from '../css/Home_SigunguClicker.module.css';
import loadingGif from './loading.gif';

const TripInfoPage = () => {
    const areaCode = areaCode1.response.body.items.item;
    const searchKeyword = searchKeyword1.response.body.items.item;
    const navigate = useNavigate();

    // CDN 이미지 경로 설정
    const images = [];
    searchKeyword.forEach((v) => {
        if (v.firstimage !== "") {
            images.push(v.firstimage);
        }
    });
    // 전체 로딩 상태 관리
    const [allImagesLoaded, setAllImagesLoaded] = useState(false);

    // 모든 이미지 로딩을 기다리는 useEffect
    useEffect(() => {
        const imagePromises = images.map((src, index) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    //console.log(`이미지 ${index} 로드 완료:`, src);
                    resolve(true);
                };
                img.onerror = () => {
                    //console.log(`이미지 ${index} 로드 실패:`, src);
                    resolve(true);
                };
            });
        });

        Promise.all(imagePromises).then(() => {
            //console.log("모든 이미지가 로드되었습니다.");
            setAllImagesLoaded(true);
        });
    }, [images]);

    // 모든 이미지가 로딩되기 전에는 로딩 GIF를 표시
    if (!allImagesLoaded) {
        //console.log("이미지가 아직 로딩 중입니다...");
        return (
            <div className={styles.main}>
                <section className={styles.title_section}>
                    <h1>강원도 추천 여행지</h1>
                </section>
                <div className={styles.loadingContainer}>
                    <img src={loadingGif} alt="Loading..." />
                </div>
            </div>
        );
    }

    const htmlTemplate = areaCode.map((value, index) => (
        <div key={value.code} className={styles.card} 
            onClick={() => navigate(`/tripInfo`, { 
                state: { sigunguCode: value.code }
            })}>
            <article className={styles.imageContainer}>
                <img
                    src={images[index]}
                    alt={value.name}
                    className={styles.image}
                />
                <h3 className={styles.title}>{value.name}</h3>
            </article>
        </div>
    ));

    //console.log("모든 이미지가 로딩되었으며, 본 페이지를 표시합니다.");

    return (
        <div className={styles.main}>
            <section className={styles.title_section}>
                <h1>강원도 지역별 핫스팟 탐색</h1>
                <div className={styles.triangle_down}></div>
            </section>
            
            <section className={styles.img_section}>
                {htmlTemplate}
            </section>
        </div>
    );
};

export default TripInfoPage;