import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "../css/TripInfo_Detail.module.css"

import Domain from "../data/Domain.json";
import loadingGif from "../images/loading.gif";
import noImage from "../images/noImage.png";

// ===========START================
/*  2024.11.11 map api 추가  */
import { GoogleMap, MarkerF, useLoadScript, InfoBox } from '@react-google-maps/api';
import Api from '../data/Api.json';

import Chatroom from '../pages/Chatroom'
import YoutubeVideo from "./YoutubeVideo";
/* END 2024.11.11 map api 추가 */
// ===========END================


const Detail = () => {
    // ===========START================
    /*  2024.11.11 map api 추가  */
    let mapCenterRef = useRef(null)
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: Api["googleMap"]
    });


    /* END 2024.11.11 map api 추가 */
    // ===========END================

    const location = useLocation();
    const navigate = useNavigate();
    const [title, setTitle] = useState(location.state?.title);
    const [touristSpotData, setTouristSpotData] = useState(null);


    useEffect(() => {
        // console.log(title);
        const getDataFetch = async () => {
            try {
                const response = await fetch(`${Domain["domainPath"]}/detail/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "title": title })
                });
                const fetchedData = await response.json();
                // console.log(fetchedData)
                mapCenterRef.current = { lat: Number(fetchedData["mapy"]), lng: Number(fetchedData["mapx"]) }
                // console.log(mapCenterRef)

                setTouristSpotData(fetchedData);
            } catch (err) {
                console.log(err);
            }
        }
        getDataFetch();
    }, []);

    const goToBack = () => {
        navigate(-1);
    }

    // ===========START================
    /*  2024.11.11 map api 추가  */

    if (!isLoaded) { return <img src={loadingGif} alt="Map Loading..."></img> }
    if (loadError) { return <p>맵을 불러오는 중 오류가 발생했습니다.</p> }

    /* END 2024.11.11 map api 추가 */
    // ===========END================

    return (
        <div className={styles.wrapper}>
            <button onClick={e => { goToBack() }} className={styles.previousBtn}><i className="xi-angle-left"></i></button>
            <div className={styles.titleBox}>
                <h2>상세보기<i className="xi-angle-right"></i> {title}</h2>
            </div>
            {touristSpotData !== null ?
                <>
                    <section className={styles.detailWrapper}>
                        {/* ====== */}
                        <article className={styles.boxes}>
                            {touristSpotData["image_path"] === "" ?
                                <div className={styles.noImage} style={{ backgroundImage: `url(${noImage})` }}></div>
                                : <div className={styles.image} style={{ backgroundImage: `url(${touristSpotData["image_path"]})` }}></div>
                            }
                            {/* <div className={styles.image} style={{ backgroundImage: touristSpotData["image_path"] === "" ? `url(${noImage})` :  `url(${touristSpotData["image_path"]})` } }></div> */}
                        </article>
                        {/* ======= */}
                        <article className={styles.commentBox}>
                            <div className={styles.infoArea}>
                                <p className={styles.title}>{title}</p>
                                <p className={styles.address}>{`${touristSpotData["addr1"]} ${touristSpotData["addr2"]}`}</p>
                            </div>
                            <p className={styles.gptComment}>{touristSpotData["recommendation"]}</p>
                        </article>
                    </section>

                    <Chatroom title={title}></Chatroom>

                    {/* <section className={styles.aiArea}>
                    </section> */}
                    <section className={styles.mapArea}>
                        <GoogleMap
                            mapContainerClassName={styles.mapComponent}
                            center={mapCenterRef.current}
                            zoom={11}
                        >
                            <MarkerF
                                key={touristSpotData["title"]}
                                position={{ lat: Number(touristSpotData["mapy"]), lng: Number(touristSpotData["mapx"]) }}
                            >

                            </MarkerF>
                        </GoogleMap>
                    </section>
                    <YoutubeVideo title={title}></YoutubeVideo>
                </> : <img src={loadingGif} alt="Loading..." />}
        </div>
    );
}

export default Detail;