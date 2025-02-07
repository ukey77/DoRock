import React, { useEffect, useState, useRef } from "react";
import styles from "../css/AIplanner.module.css";
import mobileStyles from "../css/mobile_AIplanner.module.css";

import loadingGif from "../images/loading.gif";
import { useLocation } from 'react-router-dom'
import { GoogleMap, MarkerF, useLoadScript, InfoBox } from '@react-google-maps/api';

import alterImage from "../images/alter_image.png";
import { useMediaQuery } from "react-responsive"

import Domain from "../data/Domain.json";
import Api from '../data/Api.json';
import { useNavigate } from "react-router-dom";

const AIplanner = () => {
    const location = useLocation();
    const data = location.state.data;
    const message = location.state.message;
    const navigate = useNavigate();

    const [responseData, setResponseData] = useState(null);
    const [recommendationComment, setRecommendationComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredMarker, setHoveredMarker] = useState(null); // 마우스를 올린 마커 ID 저장

    //구글 맵 초기화면(강원도) 설정을 위한
    let mapCenterRef = useRef(null)
    //////////    END   2024.11.07 모바일 화면을 위한 코드       //////////
    const isPc = useMediaQuery({
        query: "(min-width:500px)"
    });

    const [toggleList, setToggleList] = useState("map");
    //////////    END   2024.11.07 모바일 화면을 위한 코드       //////////

    useEffect(() => {
        const url = `${Domain["domainPath"]}/aiPlanner/`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error("네트워크 응답이 정상적이지 않다.");
            }
            return response.json();
        }).then(responseData => {
            // console.log('서버 응답', responseData);
            setResponseData(responseData["places"]); // 관광지 정보
            // 2024.11.08 START 마커 평균값 설정을 위한 코드 추가 
            let latTotal = 0;
            let longTotal = 0;
            responseData["places"].forEach( (v)=>{
                latTotal += Number(v.mapy);
                longTotal += Number(v.mapx);
            } )
            let latAverage = latTotal /  responseData["places"].length;
            let longAverage = longTotal /  responseData["places"].length;
            mapCenterRef.current = { lat:latAverage, lng: longAverage }
            // 2024.11.08 END 마커 평균값 설정을 위한 코드 추가  
            setRecommendationComment(responseData["recommendation"]); // chatGPT 대답
            setIsLoading(false);
        }).catch(error => {
            console.log('에러 발생', error);
            setIsLoading(false);
        });
    }, [])

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: Api["googleMap"]
    });

    if (isLoading || !isLoaded) {
        return <img src={loadingGif} alt="Loading..." />;
    }

    if (loadError) return <p>맵을 불러오는 중 오류가 발생했습니다.</p>

    return (
        /////////////////////////////////////////////////////////////
        isPc ? // PC 화면                         width:500px 이상이면 
            /////////////////////////////////////////////////////////////
            <div className={styles.mainContainer}>
                <main className={styles.main}>
                    <section className={styles.leftPanel}>
                        <article className={styles.gptChat}>
                            <h2>GPT에게 보낸 메시지</h2>
                            <section className={styles.gptBody}>
                                <article className={styles.gptChatRight}>
                                    <article className={styles.myChatArea}>
                                        <div className={styles.myChatIcon}></div>
                                        <div className={styles.myChatCont}>
                                            <p className={styles.myChatTxt}>
                                                {message}
                                            </p>
                                        </div>
                                        <div className={styles.tailIcon}></div>
                                    </article>
                                </article>
                                <article className={styles.gptChatLeft}>
                                    <article className={styles.gptChatArea}>
                                        <div className={styles.gptChatIcon}></div>
                                        <div className={styles.gptChatCont}>
                                            <p className={styles.gptChatTxt}>
                                                {recommendationComment}
                                            </p>
                                        </div>
                                        <div className={styles.gpttailIcon}></div>
                                    </article>
                                </article>
                            </section>
                        </article>
                        <article className={styles.itinerary}>
                            <article className={styles.titleBox}>
                                <h2>추천 리스트</h2>
                            </article>
                            <section className={styles.locationList}>
                                {
                                    responseData === null ?
                                        <p>죄송합니다. 관광지를 찾을 수 없습니다. -Team Dyno-</p> :
                                        responseData.map(
                                            (v) => {
                                                return (<article key={v.contentid} className={styles.locationCard} onClick={ ()=>{
                                                    navigate( "/detail", {state: {title : v.title}} )
                                                } }>
                                                    <img src={v.firstimage === "" ? alterImage : v.firstimage} alt={v.title} className={styles.locationImage} />
                                                    <div className={styles.locationInfo}>
                                                        <h3 className={styles.locationTitle}>{v.title}</h3>
                                                        <p className={styles.locationAddress}>{v.addr1}</p>
                                                    </div>
                                                </article>)
                                            }
                                        )
                                }
                            </section>
                        </article>
                    </section>
                    <section className={styles.rightPanel}>
                        <article className={styles.map}>
                            <GoogleMap
                                mapContainerClassName={styles.mapComponent}
                                center={  mapCenterRef.current== null ? { lat: 37.8228, lng: 128.1555 }: mapCenterRef.current}
                                zoom={9}
                            >
                                {
                                    responseData !== null && responseData.map((marker) => (
                                        <MarkerF
                                            key={marker.contentid}
                                            position={{ lat: Number(marker.mapy), lng: Number(marker.mapx) }}
                                            onMouseOver={() => {
                                                setHoveredMarker(marker.contentid)
                                            }} // 마커에 마우스를 올리면 해당 ID로 설정
                                            onMouseOut={() => setHoveredMarker(null)} // 마우스를 떼면 초기화
                                        >
                                            {hoveredMarker === marker.contentid && (
                                                <InfoBox
                                                    options={{ closeBoxURL: "", enableEventPropagation: true, disableAutoPan: true }} // 닫기 버튼 제거, 이벤트 전달
                                                >
                                                    <article key={marker.contentid} className={styles.locationCard}>
                                                        <img src={marker.firstimage === "" ? alterImage : marker.firstimage} alt={marker.title} className={styles.locationImage} />
                                                        <div className={styles.locationInfo}>
                                                            <h3 className={styles.locationTitle}>{marker.title}</h3>
                                                            <p className={styles.locationAddress}>{marker.addr1}</p>
                                                        </div>
                                                    </article>
                                                </InfoBox>
                                            )}
                                        </MarkerF>
                                    ))
                                }
                            </GoogleMap>
                        </article>
                    </section>
                </main>
            </div>
            /////////////////////////////////////////////////////////////
            : // 모바일 화면                         width:499px 이하이면 
            /////////////////////////////////////////////////////////////
            <>
                <div className={mobileStyles.mainContainer}>
                    <div className={mobileStyles.gptChat}>
                        <h2>GPT에게 보낸 메시지</h2>
                        <section className={mobileStyles.gptBody}>
                            <article className={mobileStyles.gptChatRight}>
                                <article className={mobileStyles.myChatArea}>
                                    <div className={mobileStyles.myChatIcon}></div>
                                    <div className={mobileStyles.myChatCont}>
                                        <p className={mobileStyles.myChatTxt}>
                                            {message}
                                        </p>
                                    </div>
                                    <div className={mobileStyles.tailIcon}></div>
                                </article>
                            </article>
                            <article className={mobileStyles.gptChatLeft}>
                                <article className={mobileStyles.gptChatArea}>
                                    <div className={mobileStyles.gptChatIcon}></div>
                                    <div className={mobileStyles.gptChatCont}>
                                        <p className={mobileStyles.gptChatTxt}>
                                            {recommendationComment}
                                        </p>
                                    </div>
                                    <div className={mobileStyles.gpttailIcon}></div>
                                </article>
                            </article>
                        </section>
                    </div>
                    <div className={mobileStyles.buttonArea} >
                        <button className = {toggleList === "map" ? mobileStyles.buttonClicked: ""} onClick={() => {
                            setToggleList("map");
                        }}>지도</button> | 
                        <button className = {toggleList === "list" ? mobileStyles.buttonClicked: ""}onClick={() => {
                            setToggleList("list");
                        }}>추천리스트</button>
                    </div>
                    {toggleList === "map" && <div className={mobileStyles.map}>
                        <GoogleMap
                            mapContainerClassName={mobileStyles.mapComponent}
                            center={  mapCenterRef.current== null ? { lat: 37.8228, lng: 128.1555 }: mapCenterRef.current}
                            zoom={9}
                        >
                            {
                                responseData !== null && responseData.map((marker) => (
                                    <MarkerF
                                        key={marker.contentid}
                                        position={{ lat: Number(marker.mapy), lng: Number(marker.mapx) }}
                                        onClick={() => setHoveredMarker(marker.contentid)}
                                    // onMouseOver={() => setHoveredMarker(marker.contentid)} // 마커에 마우스를 올리면 해당 ID로 설정
                                    // onMouseOut={() => setHoveredMarker(null)} // 마우스를 떼면 초기화
                                    >
                                        {hoveredMarker === marker.contentid && (
                                            <InfoBox
                                                options={{ closeBoxURL: "", enableEventPropagation: true, disableAutoPan: true }} // 닫기 버튼 제거, 이벤트 전달
                                            >
                                                <article key={marker.contentid} className={mobileStyles.locationCard}
                                                    onClick={() => setHoveredMarker(null)}
                                                >
                                                    <img src={marker.firstimage === "" ? alterImage : marker.firstimage} alt={marker.title} className={mobileStyles.locationImage} />
                                                    <div className={mobileStyles.locationInfo}>
                                                        <h3 className={mobileStyles.locationTitle}>{marker.title}</h3>
                                                        <p className={mobileStyles.locationAddress}>{marker.addr1}</p>
                                                    </div>
                                                </article>
                                            </InfoBox>
                                        )}
                                    </MarkerF>
                                ))
                            }
                        </GoogleMap>
                    </div>}

                    {toggleList === "list" && <div className={mobileStyles.itinerary}>
                        <article className={mobileStyles.titleBox}>
                            <h2>추천 리스트</h2>
                        </article>
                        <section className={mobileStyles.locationList}>
                            {
                                responseData === null ?
                                    <p>죄송합니다. 관광지를 찾을 수 없습니다. -Team Dyno-</p> :
                                    responseData.map(
                                        (v) => {
                                            return (<article key={v.contentid} className={mobileStyles.locationCard} onClick={ ()=>{
                                                navigate( "/detail", {state: {title : v.title}} )
                                            } }>
                                                <img src={v.firstimage === "" ? alterImage : v.firstimage} alt={v.title} className={mobileStyles.locationImage} />
                                                <div className={mobileStyles.locationInfo}>
                                                    <h3 className={mobileStyles.locationTitle}>{v.title}</h3>
                                                    <p className={mobileStyles.locationAddress}>{v.addr1}</p>
                                                </div>
                                            </article>)
                                        }
                                    )
                            }
                        </section>
                    </div>
                    }
                </div>
            </>);

}
export default AIplanner;