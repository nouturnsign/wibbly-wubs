import * as bars from "./bars";

// Load Google Fonts
const link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

bars.createBarsScene();

document.getElementById("red").addEventListener("input", bars.updateBarColors);
document
  .getElementById("green")
  .addEventListener("input", bars.updateBarColors);
document.getElementById("blue").addEventListener("input", bars.updateBarColors);

// list of IDs of options for each mode to use below

// Placeholder buttons for switching modes
// Since the second mode hasn't yet been developed, this is still a WIP
document.getElementById("barMode").addEventListener("click", () => {
  alert("Switch to bar graph music visualizer");
  // show all bar mode options
  // hide all other options
});
document.getElementById("particleMode").addEventListener("click", () => {
  alert(
    "Switch to particle-like music visualizer with more interesting patterns",
  );
});

document
  .getElementById("psychedelic")
  .addEventListener("input", bars.togglePsychedelicMode);

document
  .getElementById("textureInput")
  .addEventListener("change", bars.handleTextureInput);
