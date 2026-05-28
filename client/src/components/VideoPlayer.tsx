import YouTube, { type YouTubeProps } from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  onReady?: (player: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
}

function VideoPlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onSeek,
}: VideoPlayerProps) {

  const handleReady: YouTubeProps["onReady"] = (
    event
  ) => {
    onReady?.(event.target);
  };

  const handleStateChange: YouTubeProps["onStateChange"] = (
    event
  ) => {
    const currentTime = event.target.getCurrentTime();
    if (event.data === 1) {
      onSeek?.(currentTime);
    }
  };

  return (
    <div className="w-full">

      <YouTube
        videoId={videoId}
        opts={{
          width: "100%",
          height: "500",
          playerVars: {
            autoplay: 0,
          },
        }}
        onReady={handleReady}
        onPlay={onPlay}
        onPause={onPause}
        onStateChange={handleStateChange}
      />

    </div>
  );
}

export default VideoPlayer;

