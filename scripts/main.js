import * as bars from "./bars";
import * as particles from "./particles";
import * as fluid from "./fluid";

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

let curMode = "bar";
let curModeDiv = document.getElementById("barSettings");
let curModeButton = document.getElementById("barMode");

// Placeholder buttons for switching modes
// Since the second mode hasn't yet been developed, this is still a WIP
document.getElementById("barMode").addEventListener("click", () => {
  switchModes(curMode, "bar");
});

document.getElementById("particleMode").addEventListener("click", () => {
  switchModes(curMode, "particle");
});

document.getElementById("fluidMode").addEventListener("click", () => {
  switchModes(curMode, "fluid");
});

function switchModes(from, to) {
  if (from === to) return false;

  curModeDiv.setAttribute("hidden", true);
  curModeButton.removeAttribute("disabled");

  switch (from) {
    case "bar":
      bars.destroyBarsScene();

      break;
    case "particle":
      particles.destroyParticlesScene();

      break;
    case "fluid":
      fluid.destroyFluidScene();
      break;
    default:
      console.error("unknown mode switching from: ", from);
  }

  curModeDiv = document.getElementById(to + "Settings");
  curModeDiv.removeAttribute("hidden");
  curModeButton = document.getElementById(to + "Mode");
  curModeButton.setAttribute("disabled", true);

  curMode = to;

  switch (to) {
    case "bar":
      bars.createBarsScene();

      break;
    case "particle":
      particles.createParticlesScene();

      break;
    case "fluid":
      fluid.createFluidScene();
      break;
    default:
      console.error("unknown mode switching to: ", to);
  }
}

document
  .getElementById("psychedelic")
  .addEventListener("input", bars.togglePsychedelicMode);
