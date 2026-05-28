import YouTube from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
}

function VideoPlayer({
  videoId,
}: VideoPlayerProps) {

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
      />

    </div>
  );
}

export default VideoPlayer;