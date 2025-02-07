import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useSpeechRecognition } from 'react-speech-kit';
import styles from '../css/Alprompt.module.css';
import jsonData from "../data/defaultObj.json"


// == toast popup ==
function Toast({ message, onClose }) {
    return (
        <div className={styles.toast}>
            <span>{message}</span>
        </div>
    );
}

// == Alprompt==
function Alprompt() {
    // const location = useLocation();
    const navigate = useNavigate();
    const defaultObj = jsonData;
    // const data = location.state;
    // // console.log(data);
    // const [baseObj, setObj] = useState(null);
    const [userInputValue, setUserInputValue] = useState("");
    const checkBoxData = {
        "nature": useRef(null),
        "history": useRef(null),
        "leisure": useRef(null),
        "shopping": useRef(null)
    };
    const [showToast, setShowToast] = useState(false);

    // === 문자열 뽑기 함수 ===
    const keywordExtractor = (defaultObj) => {
        const data = {
            "region": {},
            "category": {}
        };

        // ==inputBox::value 받아오기==
        // const userInputElement = document.getElementById("userInput");
        // const userInput = userInputElement ? userInputElement.value : ""; // 요소가 없는 경우 빈 문자열 반환

        // ==checkBoxes::checked 상태 확인 ==
        const checkBoxes = {
            "nature": ["자연", "A01", false],
            "history": ["역사", "A02", false],
            "leisure": ["레저", "A03", false],
            "shopping": ["쇼핑", "A04", false]
        };


        for (let key in checkBoxData) {
            if (checkBoxData[key].current && checkBoxData[key].current.checked) {
                checkBoxes[key][2] = true;
            }
        }

        // ===일치하는 문자 뽑기===
        for (let title in defaultObj) {
            for (let key in defaultObj[title]) {
                const matches = userInputValue.match(key);
                if (matches) {
                    // console.log(matches[0]);
                    if (title === "region") {
                        data[title][matches[0]] = defaultObj[title][key];
                    } else if (title === "category") {
                        data[title][matches[0]] = defaultObj[title][key];
                    }
                }
            }
        }

        //  == 11.08 유진추가 변수 ==
        let dataTextChecked = '';

        for (let key in checkBoxes) {
            if (checkBoxes[key][2] === true) {
                dataTextChecked += ` #${checkBoxes[key][0]} `;
                const keyValue = checkBoxes[key][0];
                if (!data["category"][keyValue]) {
                    data["category"][keyValue] = checkBoxes[key][1];
                }
            }
        }
        // ==예외처리==
        if (Object.keys(data["region"]).length === 0 && Object.keys(data["category"]).length !== 0) {
            data["region"]["강원"] = "0";
        }
        // return console.log(data);
        return { data, dataTextChecked };
    };//

    const handleError = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // 3초 후 자동 사라짐
    };

    const handleSearch = () => {
        const { data: extractedData, dataTextChecked } = keywordExtractor(defaultObj); // 구조 분해 할당으로 받음
        // setObj(extractedData);
        // 일치하는 데이터가 있는 경우에만 AIplanner로 이동
        if (Object.keys(extractedData.region).length > 0 || Object.keys(extractedData.category).length > 0) {
            // AIplanner(extractedData);
            const division = (dataTextChecked) ? " 🏷️ " : "";
            const message = userInputValue + division + dataTextChecked;
            navigate("/aiplanner", { state: { data: extractedData, message: message } });
        } else {
            console.log("일치하는 데이터가 없습니다.");
            handleError();
            return;
        }
        stop();
    };

    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result) => {
            setUserInputValue(result);
        }
    });

    const micStyle = {
        color: "#ff8f5a",
        backgroundColor: "transparent"
    }
    const onMicClick = () => {
        try {
            if (listening === false) {
                listen({ lang: "ko-KR" });
            } else {
                stop();
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className={styles.alpromptContainer}>
            <section className={styles.content}>
                <h1 className={styles.AITitle}>강원도 여행을 떠나요!</h1>
                <p className={styles.AIsubText}>자연 속 강원도로 떠나 특별한 순간을 누려보세요.</p>
                <article className={styles.searchBar}>
                    <input
                        type="text"
                        autoComplete="off"
                        placeholder="춘천의 관광명소를 알려줘! (지역명 입력 필수)"
                        className={styles.searchInput}
                        id="userInput"
                        value={userInputValue}
                        onChange={(e) => {
                            const promptValue = e.target.value;
                            setUserInputValue(promptValue);
                        }}
                        onKeyDown={e => { e.key === "Enter" && handleSearch() }}
                    />
                    <button className={styles.micButton} onClick={e => { onMicClick() }} style={listening ? micStyle : null}>
                        {listening ? <i className="xi-equalizer-thin"></i> : <i className="xi-microphone"></i>}
                    </button>
                    <button className={styles.searchBtn} onClick={e => handleSearch()}>
                        <span>&#x27A4;</span>
                    </button>
                </article>
                <p className={styles.tagRecommend}>태그를 추가해보세요!</p>
                <article className={styles.tags}>
                    {/* <input type="checkbox" id="trip" className={styles.checkbox} ref={checkBoxData.leisure} />
                    <label htmlFor="trip" className={styles.tagBtn}>여행</label> */}
                    
                    <input type="checkbox" id="leisure" className={styles.checkbox} ref={checkBoxData.leisure} />
                    <label htmlFor="leisure" className={styles.tagBtn}>레저</label>

                    <input type="checkbox" id="history" className={styles.checkbox} ref={checkBoxData.history} />
                    <label htmlFor="history" className={styles.tagBtn}>역사</label>

                    <input type="checkbox" id="nature" className={styles.checkbox} ref={checkBoxData.nature} />
                    <label htmlFor="nature" className={styles.tagBtn}>자연</label>

                    <input type="checkbox" id="shopping" className={styles.checkbox} ref={checkBoxData.shopping} />
                    <label htmlFor="shopping" className={styles.tagBtn}>쇼핑</label>
                </article>
            </section>
            {/* ==Toast== */}
            {showToast && <Toast message="❌ 입력이 올바르지 않습니다!" />}
        </div>
    );
}

export default Alprompt;
