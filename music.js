const songs = [
  "JGwWNGJdvx8", // Shape of You
  "fHI8X4OXluQ", // Blinding Lights
  "TUVcZfQe-Kw"  // Levitating
];

let currentSongIndex = 0;
let player;

const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Load YouTube IFrame API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Initialize YouTube Player
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "0",
    width: "0",
    videoId: songs[currentSongIndex],
    events: {
      "onReady": onPlayerReady,
      "onStateChange": onPlayerStateChange
    },
    playerVars: {
      autoplay: 1,
      controls: 0,
      showinfo: 0,
      rel: 0,
      modestbranding: 1,
      fs: 0,
      iv_load_policy: 3,
      vq: "small" // Encourage lower quality
    }
  });
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playNextSong();
  }
}

function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  player.loadVideoById(songs[currentSongIndex]);
}

function playPreviousSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  player.loadVideoById(songs[currentSongIndex]);
}

playPauseBtn.addEventListener("click", () => {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    playPauseBtn.textContent = "⏯";
  } else {
    player.playVideo();
    playPauseBtn.textContent = "⏸";
  }
});

prevBtn.addEventListener("click", playPreviousSong);
nextBtn.addEventListener("click", playNextSong);
