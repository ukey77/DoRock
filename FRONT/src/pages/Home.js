import React, { useState, useEffect } from 'react';
import styles from '../css/Home.module.css';
import HomeMapClicker from "./Home_MapClicker";
import HomeSigunguClicker from "./Home_SigunguClicker";
import { useNavigate } from 'react-router-dom';

// == [11.07] 추가 ==
import { useMediaQuery } from 'react-responsive';
// ==================

// 이미지
import slideImg_1 from '../images/home_slide_image/home_slide_1.jpg';
import slideImg_2 from '../images/home_slide_image/home_slide_2.jpg';
import slideImg_3 from '../images/home_slide_image/home_slide_3.jpg';
import slideImg_4 from '../images/home_slide_image/home_slide_4.jpg';
import slideImg_5 from '../images/home_slide_image/home_slide_5.jpg';
import slideImg_6 from '../images/home_slide_image/home_slide_6.jpg';
// JSON
import defaultObj from '../data/defaultObj.json'
import weatherStatus from '../data/weatherStatus.json'
import Api from '../data/Api.json';
import { useSpeechRecognition } from 'react-speech-kit';

// == Home ==
function Home() {
    /* 2024.11.07 유진 추가부분 */
    const isSmallScreen = useMediaQuery({ maxWidth: 767 });
    return (
        <>
            <div className={styles.wrap}>
                <section className={styles.timeWeatherBar}>
                    <TimeSection />
                    <WeatherSection />
                </section>
                <MainContent />
            </div>
            {!isSmallScreen && <HomeMapClicker />}
            <HomeSigunguClicker />
        </>
    );
}

/* 2024.11.04 동현 추가부분 */
// == toast popup ==
function Toast({ message, onClose }) {
    return (
        <div className={styles.toast}>
            <span>{message}</span>
        </div>
    );
}

/* END 2024.11.04 동현 추가부분 */

// == TimeSection ==
function TimeSection() {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    useEffect(() => {

        // 시간 업데이트
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);
    return (
        <>
            <article className={styles.timeBox}>
                <p className={styles.timeTitle}>대한민국</p>
                <p className={styles.time}>{time}</p>
            </article>
        </>
    );
}

// ^Start 2024.11.12 유진 추가 부분 =====
// ===WeekWeather===
function WeekWeather(props) {
    const [weekWeather, setWeekWeather] = useState(null);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [domElement, setDomElement] = useState(null);
    const [today, setToday] = useState(null);

    //weatherStatus
    useEffect(() => {
        const API_KEY = Api["openWeatherMap"];
        const [lat, lon] = [38.206, 128.591];
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        //&lang=kr
        const fetchWeekWeather = () => {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Week_Weather: 네트워크 응답에 문제가 있습니다.")
                    }
                    return response.json();
                })
                .then(data => {
                    setWeekWeather(data["list"]);
                    // console.log(data["list"]);
                })
                .catch(error => {
                    setError(error.message);
                    console.log("fetchWeekWeather", error);
                })
        }
        fetchWeekWeather();
        const setWeatherInterval = setInterval(fetchWeekWeather, 21600000);

        return () => {
            clearInterval(setWeatherInterval);
        };
    }, []);

    useEffect(() => {
        if (weekWeather) {
            const dataObj = {}
            const date = new Date();
            const today = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-");
            setToday(today);
            weekWeather.forEach((wetherObj) => {
                const day = wetherObj["dt_txt"].split(" ");
                if (!(day[0] in dataObj) && (day[0] !== today) && (day[1] === "15:00:00")) {
                    dataObj[day[0]] = wetherObj;
                }
            });
            // console.log(dataObj);
            setWeatherData(dataObj);
        }
    }, [weekWeather]);


    useEffect(() => {
        if (weatherData) {
            const result = [];
            for (let key in weatherData) {
                // 내일,모레 text변경_유진수정(11/14)
                const today = new Date();
                const tomorrow = [today.getFullYear(), today.getMonth() + 1, today.getDate() + 1].join("-");
                const dayAftertomorrow = [today.getFullYear(), today.getMonth() + 1, today.getDate() + 2].join("-");

                let dayText = '';
                switch (key) {
                    case tomorrow:
                        dayText = "내일"
                        break;
                    case dayAftertomorrow:
                        dayText = "모레"
                        break;
                    default:
                        dayText = key;
                        break;
                }

                const jsx = (
                    <article className={styles.forecastItem}>
                        <p className={styles.forecastDate}>{dayText}</p>
                        <p className={styles.forecastCondition}>{weatherStatus[weatherData[key]["weather"][0]["id"]]["korean"]}</p>
                        <img
                            className={styles.forecastIcon}
                            src={`https://openweathermap.org/img/wn/${weatherData[key]["weather"][0]["icon"]}@2x.png`}
                            alt="날씨 아이콘"
                        />
                        <p className={styles.forecastTemperature}>{(weatherData[key]["main"]["temp"]).toFixed(1)}°C</p>
                    </article>
                );
                result.push(jsx);
            }
            setDomElement(result);
        }
    }, [weatherData]);
    return (
        <>
            <section className={styles.forecastContainer}>
                <article className={styles.currentWeather}>
                    <img
                        className={styles.todayIcon}
                        src={props["currentWeather"].iconSrc}
                        alt="날씨 아이콘"
                    />
                    <p className={styles.todayCondition}>{props["currentWeather"].condition}</p>
                    {/* <p className={styles.todayTime}>{today}</p> */}
                    <p className={styles.todayTime}>Today</p>
                    <p className={styles.todayTemperatureLarge}>{props["currentWeather"].temperatureLarge}°C</p>
                    <p className={styles.location}>{props["currentWeather"].location}</p>
                </article>
                <section className={styles.forecast}>
                    {/* ==== */}
                    {domElement}
                    {/* ==== */}
                </section>
            </section>
        </>
    )
}
//$End 2024.11.12 유진 추가 부분 =====

// == WeatherSection ==
function WeatherSection() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);
    const [isDisplay, setDisplay] = useState(null);
    useEffect(() => {
        const API_KEY = Api["openWeatherMap"];
        const [lat, lon] = [38.206, 128.591];
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        const fetchWeather = () => {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Day_Weather네트워크 응답에 문제가 있습니다.");
                    }
                    return response.json();
                })
                .then(data => {
                    setWeather(data);
                    // console.log("current",data);
                })
                .catch(error => {
                    setError(error.message);
                    console.log(error)
                });
        };

        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 3600000); // 1시간

        return () => {
            clearInterval(weatherInterval);
        };
    }, []);

    useEffect(() => {
        if (weather) {
            const currentStatus = {
                condition: weatherStatus[weather["weather"][0]["id"]]["korean"],
                temperatureLarge: weather["main"]["temp"].toFixed(1),
                location: "강원도 속초",
                iconSrc: `https://openweathermap.org/img/wn/${weather["weather"][0]["icon"]}@2x.png`
            };
            setCurrentWeather(currentStatus);
        }
    }, [weather])

    useEffect(() => {
        if (isDisplay) {
            // isDisplay가 true일 때 타이머 시작
            const timer = setTimeout(() => {
                setDisplay(false); // 5초 후 자동으로 닫힘
            }, 10000);

            // 컴포넌트가 언마운트되거나 isDisplay가 변경될 때 타이머 정리
            return () => clearTimeout(timer);
        }
    }, [isDisplay]);

    if (error) return <p>Error: {error}</p>;
    if (!weather) return <p>Loading...</p>;

    return (
        <>
            <article className={styles.weatherBox}>
                <p className={styles.weatherTitle} onClick={() => {
                    const status = isDisplay ? false : true;
                    setDisplay(status);

                }}>강원도 날씨 <i className={isDisplay ? "xi-angle-up" : "xi-angle-down"}></i></p>
                <div>
                    <img
                        className={styles.weatherIcon}
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                        alt="날씨 아이콘"
                    />
                    <p className={styles.temperature}>{(weather.main.temp).toFixed(1)}°C</p>
                </div>
            </article>
            {isDisplay && <WeekWeather currentWeather={currentWeather} />}
        </>
    );
}

// == MainContent ==
function MainContent() {
    const navigate = useNavigate();
    const slideImages = [slideImg_2, slideImg_1, slideImg_3, slideImg_4, slideImg_5, slideImg_6];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    /* 2024.11.04 동현 추가부분 */
    const [inputValue, setInputValue] = useState('');
    const [showToast, setShowToast] = useState(false);
    const handleError = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // 3초 후 자동 사라짐
    };

    /* END 2024.11.04 동현 추가부분 */

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true); // 페이드 아웃 시작
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) =>
                    prevIndex === slideImages.length - 1 ? 0 : prevIndex + 1
                );
                setIsFading(false); // 페이드 인 시작
            }, 900); // 페이드 아웃 시간
        }, 7000); // 이미지 전환 주기 (페이드 인/아웃 포함)

        return () => clearInterval(interval);
    }, [slideImages.length]);

    const onSearchClick = () => {
        const data = { region: {}, category: {} };
        //region 데이터 추가
        for (let key in defaultObj.region) {
            if (inputValue.includes(key)) {
                data["region"][key] = defaultObj.region[key];
            }
        }
        //category 데이터 추가
        for (let key in defaultObj.category) {
            if (inputValue.includes(key)) {
                data["category"][key] = defaultObj.category[key];
            }
        }

        // ** 입력된 값이 필터되지 않았으면 페이지가 넘어가지 않고 토스트 출력 및 value값 초기화
        if (Object.keys(data["region"]).length === 0 && Object.keys(data["category"]).length === 0) {
            setInputValue('');
            handleError();
            return;
        }

        //category 데이터만 있을 경우 지역 "강원" 추가
        if (Object.keys(data["region"]).length === 0) {
            data["region"]["강원"] = 0;
        }

        //페이지 이동
        navigate("/aiPlanner", { state: { data: data, message: inputValue } });
    }

    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result) => {
            setInputValue(result);
        }
    });

    const micStyle = {
        color: "#00aaff",
        backgroundColor: "#ffffff"
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
        stop();
    };

    return (
        <section className={styles.mainContent}>
            <section className={styles.slideArea}>
                <article className={styles.slideimgWrap}>
                    {slideImages.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`슬라이드 이미지 ${index + 1}`}
                            className={`${styles.slideImage} ${index === currentImageIndex ? (isFading ? styles.fadeOut : styles.fadeIn) : styles.hidden}`}
                        />
                    ))}
                </article>
                <p className={styles.sourceText}>사진 출처: <a href='https://www.gangwon.to/gwtour'>강원관광</a></p>
            </section>
            <article className={styles.promptBox}>
                <h2 className={styles.promptTitle}>당신을 위한 강원도 여행지, 클릭 한 번으로 찾아보세요!</h2>
                <div className={styles.input_mic}>
                    <input className={styles.aiInput} type="text" placeholder="속초 핫플레이스 추천해줘! (지역명 입력 필수)"
                        value={inputValue}
                        onChange={(e) => { setInputValue(e.target.value) }}
                        onKeyDown={(e) => { if (e.key === "Enter") onSearchClick() }}
                    />
                    <button className={styles.micButton} onClick={e => { onMicClick() }} style={listening ? micStyle : null}>
                        {listening ? <i className="xi-equalizer-thin"></i> : <i className="xi-microphone"></i>}
                    </button>
                </div>
                <button className={styles.submitBtn} onClick={e => onSearchClick()}>추천 받기</button>
                {showToast && <Toast message="❌ 입력이 올바르지 않습니다!" />}
            </article>
        </section>
    );
}

export default Home;
