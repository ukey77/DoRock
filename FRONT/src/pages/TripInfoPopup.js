import React, { useState } from "react";
import popupStyles from "../css/TripInfoPopup.module.css";
import areaCode1 from "../data/areaCode1.json";

const TripInfoPopup = (props) => {
    const { closePopup, research } = props;
    const areaCode = [{ rnum: 0, code: "0", name: "강원도" }, ...areaCode1.response.body.items.item];

    const [checkedItems, setCheckedItems] = useState(["0"]); // 선택된 체크박스 ID 관리
    const [showWarning, setShowWarning] = useState(false); // 경고 메시지 상태

    const handleCheckboxChange = (e, code) => {
        if (e.target.checked) {
            if (checkedItems.length >= 5 && code !== "0") { // 경고 메세지 ("5개만 입력~")
                e.target.checked = false;
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 1000);
            } else {
                if (code === "0") {
                    setCheckedItems([code]);
                } else {
                    setCheckedItems(checkedItems[0] === "0" ? [code] : [...checkedItems, code]);
                }
            }
        } else {
            setCheckedItems(checkedItems.filter((item) => item !== code)); // 선택 항목 제거
        }
    };

    const handleButtonClick = () => {
        research(checkedItems); // 선택된 항목 전송
        closePopup(false);
    };

    const resetButtonClick = () => {
        setCheckedItems([]); // 선택 항목 초기화
    };

    return (
        <div className={popupStyles.popupContainer}>
            <main className={popupStyles.popupMain}>
                {/* <section className={popupStyles.buttonSection}>
                    <button key={"popup_resetButton"} onClick={resetButtonClick}>지역초기화</button>
                    <button key={"popup_searchButton"} onClick={handleButtonClick}>검색</button>
                </section> */}
                <section className={popupStyles.checkBoxSection}>
                    {areaCode.map((value, index) => (
                        <React.Fragment key={value.code}>
                            <input
                                id={value.code}
                                type="checkbox"
                                checked={checkedItems.includes(value.code)}
                                onChange={(e) => handleCheckboxChange(e, value.code)}
                            />
                            <label htmlFor={value.code}>{value.name}</label>
                        </React.Fragment>
                    ))}
                </section>
                <section className={popupStyles.buttonSection}>
                    {/* <button key={"popup_resetButton"} onClick={resetButtonClick}>지역초기화</button> */}
                    <button key={"popup_searchButton"} onClick={handleButtonClick}>검색</button>
                </section>
                <div className={`${popupStyles['warning-message']} ${showWarning ? popupStyles.visible : ""}`}>
                    최대 5개까지만 선택할 수 있습니다.
                </div>
            </main>
            <div className={popupStyles.popupBackground} onClick={() => closePopup(false)}></div>
        </div>
    );
};

export default TripInfoPopup;
