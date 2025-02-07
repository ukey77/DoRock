import styles from '../css/Chatroom.module.css'
import { useState, useEffect, useRef } from 'react'
import Domain from "../data/Domain.json"
import { useSpeechRecognition } from 'react-speech-kit';
const Chatroom = ({ title }) => {

    const [question, setQuestion] = useState("");
    const [data, setData] = useState({ title: title, question: null })
    const [gptChats, setGptChats] = useState([]);
    const [userChats, setUserChats] = useState([]);
    const chatContainerRef = useRef(null);
    const [dynamicContent, setDynamicContent] = useState([]);
    const [responseData, setResponseData] = useState(null)
    const [chatResponsed, setChatResponsed] = useState(true); //응답받는 중이면 false

    const updateQuestion = (event) => {
        setQuestion(event.target.value)
        setData({ title: title, question: event.target.value })
    }

    const baseContext = <><section className={styles.gpt}>
        <article className={styles.gptChatBox}>
            <p>🤖 : 안녕하세요! 여행지에 대해 알고 싶은 내용을 질문해 주세요.</p>
            <p className={styles.gptExampleText}>예) {title}의 역사에 대해 알려줘</p>
        </article>
    </section>
    </>

    //채팅창 맨 아래로 보내기위한 함수
    const moveToBottom = () => {
        if (chatContainerRef.current) {
            // chatContainerRef.current.scrollTo({ top: chatContainerRef.current?.offsetHeight, behavior: 'smooth' });
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }

    //AI 응답 받기위한 
    const fetchQuestion = () => {
        stop();
        if (question === "" || chatResponsed === false) { return } // input value가 공백이고 받아오는중이면 함수 종료

        setChatResponsed(false);
        setResponseData(null);

        setUserChats(prevUserChat => [...prevUserChat, question]);
        //입력필드 초기화 
        setQuestion("");
        const url = `${Domain["domainPath"]}/tripInfoDetail/`
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("서버 응답이 정상적이지 않다.");
            }
            return response.text();
        })
        .then(responseData => {
            // console.log(responseData);
            setResponseData(responseData);
        })
        .catch((error => {
            // console.log("에러 발생 ", error);
        }));
    }


    useEffect(() => {
        if (responseData != null) { //초기 선언 당시 실행 안되게 
            // setGptChats(prevGptChat => [...prevGptChat, responseData]);
            setGptChats([...gptChats, responseData]);
        }
    }, [responseData]);

    useEffect(() => {
        const jsx = []
        userChats.forEach((value, i, a) => {
            jsx.push(
                <section className={styles.user} key={"userchat" + i}>
                    <article className={styles.UserChatBox}>
                        <p>🙂 : {userChats[i]}</p>
                    </article>
                </section>
                ,
                <section className={styles.gpt} key={"gptchat" + i}>
                    <article className={styles.gptChatBox}>
                        <p>🤖 : {gptChats[i]}</p>
                    </article>
                </section>)
        });
        setDynamicContent(jsx)
        console.log(gptChats)
    }, [gptChats]);

    useEffect(() => {
        setChatResponsed(true)
        setTimeout(() => {
            moveToBottom();
        }, 0);
    }, [dynamicContent]);

    // 마이크 기능
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result) => {
            setQuestion(result);
            setData({ title: title, question: result });
        },
    });

    const micStyle = {
        color: "#4fa8c7",
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
        <>
            <main className={styles.chatContainer}>
                <section className={styles.top}>
                    <p>GPT에게 물어보세요!</p>
                </section>
                <section ref={chatContainerRef} className={styles.chatHistoryArea}>
                    {/* ========================================================= */}
                    {baseContext}
                    {chatResponsed ? dynamicContent : <h3 className={styles.loading}>🤖...</h3>}
                    {/* ========================================================= */}
                </section>
                <section className={styles.promptArea}>
                    <input className={styles.prompt}
                        type="text"
                        placeholder={title + "에 대하여 궁금한점을 입력하세요!"}
                        onChange={e => updateQuestion(e)}
                        onKeyDown={e => { if (e.key === "Enter") fetchQuestion() }}
                        value={question} />
                    <button className={styles.micButton} onClick={e => { onMicClick() }} style={listening ? micStyle : null}>
                        {listening ? <i className="xi-equalizer-thin"></i> : <i className="xi-microphone"></i>}
                    </button>
                    <button className={styles.searchBtn}
                        onClick={fetchQuestion}
                    >&#x27A4;</button>
                </section>
            </main>
        </>
    )
}

export default Chatroom;