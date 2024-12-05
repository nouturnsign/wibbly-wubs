const audioSrcSelect = document.getElementById("audio-source-select");
const audioFile = document.getElementById("audio-source-file");
const audioBr1 = document.getElementById("abr1");
const audioBr2 = document.getElementById("abr2");
const settings = document.getElementById("settings");

const FFT_SIZE = 64; // must be power of 2

let context;
let audio;
let source;
let analyser;
let playbackAudio = true;

let freqData; // fft_size / 2 bins of frequencies
let timeData; // fft_size bins of current waveform/time-domain

audioSrcSelect.addEventListener("change", function () {
  // remove previous context
  context = null;
  source = null;
  analyser = null;
  playbackAudio = true;

  audioFile.setAttribute("hidden", true);
  audioBr1.setAttribute("hidden", true);
  audioBr2.setAttribute("hidden", true);

  if (audio) {
    audio.remove();
    audio = null;
  }

  if (audioSrcSelect.value === "none") return;

  context = new AudioContext();

  switch (audioSrcSelect.value) {
    case "mic":
      playbackAudio = false;

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          source = context.createMediaStreamSource(stream);
          createAnalyser();
        })
        .catch((err) => {
          alert("Error getting microphone input");
          console.error("Error getting microphone input: ", err);
        });

      break;
    case "file":
      audioFile.removeAttribute("hidden");
      audioBr1.removeAttribute("hidden");
      audioBr2.removeAttribute("hidden");

      audio = document.createElement("audio");
      audio.setAttribute("controls", "");
      audio.setAttribute("autoplay", "");
      settings.appendChild(audio);

      break;
    case "temp":
      audio = document.createElement("audio");
      audio.setAttribute("controls", "");
      audio.setAttribute("autoplay", "");
      audio.src =
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3";
      audio.crossOrigin = "anonymous";
      settings.appendChild(audio);

      source = context.createMediaElementSource(audio);
      createAnalyser();

      break;
  }
});

audioFile.addEventListener("change", function () {
  if (!this.files || !this.files[0]) return;

  audio.src = window.URL.createObjectURL(this.files[0]);

  source = context.createMediaElementSource(audio);
  createAnalyser();

  audio.play();
});

function createAnalyser() {
  if (!context || !source) return;

  analyser = context.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  analyser.smoothingTimeConstant = 0.9;

  const bufferLength = analyser.frequencyBinCount;
  freqData = new Uint8Array(bufferLength);
  timeData = new Uint8Array(FFT_SIZE);

  source.connect(analyser);

  if (playbackAudio) analyser.connect(context.destination);
}

function getFreqData() {
  if (!analyser) return null;

  analyser.getByteFrequencyData(freqData);

  return freqData;
}

function getTimeData() {
  if (!analyser) return null;

  analyser.getByteTimeDomainData(timeData);

  return timeData;
}

export { getTimeData, getFreqData };
