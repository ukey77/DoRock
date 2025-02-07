import React, { useEffect, useState } from "react";
import Youtube from "react-youtube";
import Api from '../data/Api.json';
import styles from "../css/YoutubeVideo.module.css";

const YoutubeVideo = ({ title }) => {
    // const [youtubeVideos, setYoutubeVideos] = useState(null); // Array
    const [youtubeJSX, setYoutubeJSX] = useState([]);

    useEffect(() => {
        const getYoutubeData = async () => {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title}&type=video&key=${Api["youtube"]}&order=date&maxResults=4&relevanceLanguage=ko`);
            const youtubeData = await response.json();

            // setYoutubeVideos(youtubeData["items"]);
            setYoutubeJSX(
                youtubeData["items"].map((video, index) => {
                    return <Youtube key={`Youtube${index}`} videoId={video["id"]["videoId"]}></Youtube>
                })
            )
        }
        getYoutubeData();
    }, []);


    return (
        <>
            <section className={styles.youtubeArea}>
                    {youtubeJSX}
            </section>
        </>

    );
}

export default YoutubeVideo;