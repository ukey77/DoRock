import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// css
import styles from "../css/TripInfo.module.css";
// json data
// import AreaCode from "../data/areaCode1.json";
import loadingGif from "../images/loading.gif";
import Domain from "../data/Domain.json";
// components
import TripInfoPopup from "./TripInfoPopup";

const TripInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [sigunguCode, setSigunguCode] = useState(location.state?.sigunguCode ? [location.state.sigunguCode] : ["0"]); // sigunguCode 업데이트
    const [touristSpotObj, setTouristSpotObj] = useState(null); // 정리된 TouristSpot
    const [touristSpotArr, setTouristSpotArr] = useState(null); // 정리된 TouristSpot의 ["sigunguCode"]
    const [areaCode, setAreaCode] = useState(null);

    const [areaName, setAreaName] = useState(""); // Page Title 변경을 위한
    const [isPopupOn, setPopupOn] = useState(false); // 팝업 토글

    useEffect(() => { // 초기 실행 코드 // 객체 정리 (속도 향상을 위해)
        const getDataFetch = async () => {
            try {
                const response = await fetch(`${Domain["domainPath"]}/tripInfo/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const fetchedData = await response.json();
                const touristSpotArr = fetchedData["touristSpot"].filter((touristSpot) => touristSpot["firstimage"]);
                const areaCode = fetchedData["areaCode"];

                const organizedTouristSpot = { "0": [] }; // 0 : [강원도 전체 정보]
                touristSpotArr.forEach(touristSpot => {
                    organizedTouristSpot["0"].push(touristSpot); // 강원 전체 정보를 담기 위한
                    if (touristSpot["sigungucode"] in organizedTouristSpot) {
                        organizedTouristSpot[touristSpot["sigungucode"]].push(touristSpot); // 객체에 지역코드가 있으면 정보 추가
                    } else {
                        organizedTouristSpot[touristSpot["sigungucode"]] = [touristSpot]; // 지역코드가 없다면 객체에 생성
                    }
                });
                setAreaCode(areaCode);
                setTouristSpotObj(organizedTouristSpot);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        window.scrollTo({top: 0});
        getDataFetch();
    }, []);

    useEffect(() => { // location 변경 감지
        setSigunguCode(location.state?.sigunguCode ? [location.state.sigunguCode] : ["0"]);
    }, [location.state]);

    useEffect(() => { // sigunguCode가 바뀔 때 마다 실행될 코드 // 정리해둔 객체를 통해 데이터 시각화
        if (areaCode !== null) {
            let areaName = "";
            // console.log(sigunguCode)
            sigunguCode.forEach((sigunguNum) => { // Page Title 변경
                // console.log(sigunguNum)
                if (sigunguNum === "0") {
                    areaName += "# 강원도 ";
                } else {
                    areaName += `# ${areaCode[Number(sigunguNum) - 1]["name"]} `;
                }
            });
            setAreaName(areaName);
        }

        if (touristSpotObj !== null) {  // 화면에 뿌릴 데이터 선택
            const touristSpots = [];
            sigunguCode.forEach((sigungu) => {
                //touristSpotObj[sigungu];
                touristSpots.push(...touristSpotObj[sigungu])
            })
            setTouristSpotArr(touristSpots);
            // console.log(touristSpots)
        }

    }, [touristSpotObj, sigunguCode, areaCode]);

    const selectAreaButtonClick = () => { // "지역검색" 클릭 시 팝업을 띄울지 말지
        setPopupOn(true);
    }

    const goToDetailPage = (title) => {
        navigate("/detail", {
            state: {
                title: title
            }
        });
    }

    const scrollArea = useRef(null); // mobile을 위한 스크롤 위로 가기 버튼
    const goTopButton = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (scrollArea.current) {
            scrollArea.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <section className={styles.tripInfoWrapper}>
            <section className={styles.tripInfoArea}>
                <article className={styles.titleArea} onClick={(e) => { selectAreaButtonClick() }}>
                    <h1 className={styles.tripInfoTitle}>{areaName}</h1>
                    <button key="selectArea" className={styles.selectButton}>지역선택</button>
                </article>
                <article className={styles.touristSpotBoxes} ref={scrollArea}>
                    {touristSpotArr ? (
                        touristSpotArr.map((touristInfo, index) => (
                            <div key={index} className={styles.touristSpotBox} onClick={(e) => { goToDetailPage(touristInfo.title) }}>
                                <div className={styles.touristSpotImg} style={{ backgroundImage: `url(${touristInfo["firstimage"]})` }}></div>
                                <div className={styles.infoArea}>
                                    <p className={styles.touristSpotTitle}>{touristInfo["title"]}</p>
                                    <p className={styles.touristSpotAddr}>{`${touristInfo["addr1"]} ${touristInfo["addr2"]}`}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <img src={loadingGif} alt="Loading..." />
                    )}
                </article>
                <button className={styles.goTopButton} onClick={e => goTopButton()}>위로 가기</button>
                {isPopupOn ? <TripInfoPopup closePopup={setPopupOn} research={setSigunguCode} /> : null}
            </section>
        </section>
    )
}

export default TripInfo;