import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";

gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });
  const [loadedData, setLoadedData] = useState([]);

  const { isEnd, isLastVideo, videoId, isPlaying } = video;

  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });

    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => setVideo((prev) => ({ ...prev, startPlay: true, isPlaying: true })),
    });
  }, [videoId]);

  useEffect(() => {
    let currentProgress = 0;
    const span = videoSpanRef.current[videoId];
    if (span) {
      const anim = gsap.to(span, {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);
          if (progress !== currentProgress) {
            currentProgress = progress;
            gsap.to(videoDivRef.current[videoId], {
              width: window.innerWidth < 1200 ? "10vw" : "4vw",
            });
            gsap.to(span, { width: `${currentProgress}%`, backgroundColor: "white" });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], { width: "12px" });
            gsap.to(span, { backgroundColor: "#afafaf" });
          }
        },
      });

      gsap.ticker[isPlaying ? "add" : "remove"](() =>
        anim.progress(videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration)
      );
    }
  }, [videoId, isPlaying]);

  useEffect(() => {
    if (loadedData.length > 3) {
      videoRef.current[videoId][isPlaying ? "play" : "pause"]();
    }
  }, [videoId, isPlaying, loadedData]);

  const handleProcess = (type, i) => {
    const handlers = {
      "video-end": () => setVideo((prev) => ({ ...prev, isEnd: true, videoId: i + 1 })),
      "video-last": () => setVideo((prev) => ({ ...prev, isLastVideo: true })),
      "video-reset": () => setVideo((prev) => ({ ...prev, videoId: 0, isLastVideo: false })),
      "pause": () => setVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying })),
      "play": () => setVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying })),
    };
    return handlers[type] && handlers[type]();
  };

  const handleLoadedMetaData = (i, e) => setLoadedData((prev) => [...prev, e]);

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  id="video"
                  playsInline
                  className={list.id === 2 ? "translate-x-44 pointer-events-none" : "pointer-events-none"}
                  preload="auto"
                  muted
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() => handleProcess(i !== 3 ? "video-end" : "video-last", i)}
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text, i) => (
                  <p key={i} className="md:text-2xl text-xl font-medium">{text}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            <span key={i} className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer" ref={(el) => (videoDivRef.current[i] = el)}>
              <span className="absolute h-full w-full rounded-full" ref={(el) => (videoSpanRef.current[i] = el)} />
            </span>
          ))}
        </div>

        <button className="control-btn">
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
            onClick={() => handleProcess(isLastVideo ? "video-reset" : !isPlaying ? "play" : "pause")}
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
