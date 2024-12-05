const audioSrcSelect = document.getElementById("audio-source-select");
const audioFile = document.getElementById("audio-source-file");
const audioBr1 = document.getElementById("abr1");
const audioBr2 = document.getElementById("abr2");
const settings = document.getElementById("settings");

const FREQ_FFT_SIZE = 64; // must be power of 2
const TIME_FFT_SIZE = 4096;

const FREQ_BINS = FREQ_FFT_SIZE / 2;
const TIME_BINS = TIME_FFT_SIZE;

let context;
let audio;
let source;
let freqAnalyzer;
let timeAnalyzer;
let playbackAudio = true;

let freqData; // fft_size / 2 bins of frequencies
let timeData; // fft_size bins of current waveform/time-domain

audioSrcSelect.addEventListener("change", function () {
  // remove previous context
  context = null;
  source = null;
  freqAnalyzer = null;
  timeAnalyzer = null;
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

  freqAnalyzer = context.createAnalyser();
  freqAnalyzer.fftSize = FREQ_FFT_SIZE;
  freqAnalyzer.smoothingTimeConstant = 0.9;

  timeAnalyzer = context.createAnalyser();
  timeAnalyzer.fftSize = TIME_FFT_SIZE;

  const bufferLength = freqAnalyzer.frequencyBinCount;
  freqData = new Uint8Array(bufferLength);
  timeData = new Uint8Array(TIME_FFT_SIZE);

  source.connect(freqAnalyzer);
  source.connect(timeAnalyzer);

  if (playbackAudio) freqAnalyzer.connect(context.destination);
}

function getFreqData() {
  if (!freqAnalyzer) return null;

  freqAnalyzer.getByteFrequencyData(freqData);

  return freqData;
}

function getTimeData() {
  if (!timeAnalyzer) return null;

  timeAnalyzer.getByteTimeDomainData(timeData);

  return timeData;
}

export { getTimeData, getFreqData, FREQ_BINS, TIME_BINS };
