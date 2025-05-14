<template>
  <div class="container">
    <div class="controlsTopLeft">
      <div class="selectContainer">
        <label for="noteType" class="neonText">Note Type: </label>
        <select id="noteType" v-model="noteType" :disabled="isPlaying" @change="adjustNoteType" class="neonSelect">
          <option v-for="type in noteTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
      <div class="selectContainer">
        <label for="oscillatorType" class="neonText">Oscillator Type:</label>
        <select id="oscillatorType" v-model="selectedOscillatorType" :disabled="isPlaying" @change="adjustOscillatorType" class="neonSelect">
          <option v-for="type in oscillatorTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
    </div>
    <div class="tempoContainerTop">
      <label for="tempo" class="neonText">Tempo: {{ tempo }}</label>
      <input
        id="tempo"
        type="range"
        min="40"
        max="200"
        v-model="tempo"
        @input="adjustTempo"
        class="neonSlider"
      />
    </div>
    <div class="gridContainer">
      <div v-for="(grid, rowIndex) in grids" :key="rowIndex" class="gridRow">
        <button
          v-for="(beat, stepIndex) in grid"
          :key="stepIndex"
          class="gridButton"
          :class="{ active: beat.isActive }"
          :style="getButtonStyle(stepIndex, beat.isActive)"
          @click="updateGrids(grids, rowIndex, stepIndex, !beat.isActive)"
        ></button>
      </div>
    </div>
    <div class="startButtonContainer">
      <button v-if="!isPlaying" @click="startLoop" class="neonButton">Start</button>
      <button v-if="isPlaying" @click="stopLoop" class="neonButton">Stop</button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { makeGrid, makeSynths, updateBeatStatus } from './utils/make-grid.utils'
import { gridBeat } from './models/gridBeat.model'
import * as Tone from 'tone'

const gridNotes = ref<string[]>([
  'C5','B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'
]);
const grids = ref<gridBeat[][]>(makeGrid(gridNotes.value))
const tempo = ref<number>(120)
const noteTypes=ref<string[]>(['4n', '8n', '16n',])
const noteType = ref<string>('8n')
const selectedOscillatorType = ref<string>('sine');
const oscillatorTypes = ref<string[]>([
  'sine',
  'square',
  'triangle',
  'sawtooth',
  'sine1',
  'square1',
  'triangle1',
  'sawtooth1',
]);
let synths: any = [];
const isPlaying = ref<boolean>(false)
const started = ref<boolean>(false)
const beat = ref<number>(0)


onMounted(() => {
  synths = makeSynths(grids.value.length, selectedOscillatorType.value); // Initialize synths as a ref's value
})

const updateGrids = (grid: gridBeat[][],
  rowIndex: number,
  stepIndex: number,
  isActive: boolean) => {
   grids.value = updateBeatStatus(grid, rowIndex, stepIndex, isActive)
}

const adjustTempo = () => { 
    Tone.getTransport().bpm.value = tempo.value
}

const adjustNoteType = () => {
  Tone.getTransport().cancel();
  started.value = false;
}

const adjustOscillatorType = () => {
  synths = makeSynths(grids.value.length, selectedOscillatorType.value); 
  Tone.getTransport().cancel();
  started.value = false;
};

const getButtonStyle = (stepIndex: number, isActive: boolean) => {
  if (isActive) {
    return { backgroundColor: '#007bff' };
  }
  if (isPlaying.value && stepIndex === beat.value) { // Access .value
    return { backgroundColor: '#FFFF33' };
  }
  return {};
};

const configLoop = () => {
  const repeat = (time: any) => {
    beat.value = (beat.value + 1) % 16;
    grids.value.forEach((row: any, index: any) => {
      let synth = synths[index]; // Access the current value of the synths ref
      let note = row[beat.value];
      if (note.isActive) {
        synth.triggerAttackRelease(note.note, noteType.value, time);
      }
    });
  };

  Tone.getTransport().bpm.value = tempo.value;
  Tone.getTransport().scheduleRepeat(repeat, noteType.value);

  Tone.getTransport().start();
  isPlaying.value = true; // Access .value
};

  const startLoop = async () => {
    if (!started.value) { // Access .value
      Tone.start();
      Tone.getDestination().volume.rampTo(-10, 0.001)
      started.value = true; // Access .value
      configLoop();
    } else {
      isPlaying.value = true; // Access .value
      Tone.getTransport().start();
    }
  }

  const stopLoop = () => {
      isPlaying.value = false; // Access .value
      Tone.getTransport().stop()
  };
</script>

<style lang="scss">
@use 'sass:color'; /* Import the sass:color module */

$neon-blue: #0bf;
$neon-pink: #f0f;
$neon-yellow: #ff0;
$dark-bg: #111;

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: $dark-bg; /* Dark background */
  color: $neon-blue; /* Default text color */
  font-family: 'Arial Black', sans-serif; /* Futuristic font */
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px; /* Add some padding around the edges */
  box-sizing: border-box; /* Ensure padding is within the container's dimensions */
}

.controlsTopLeft {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between the select elements */
  align-items: flex-start; /* Align labels and selects to the left */
}

.tempoContainerTop {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px; /* Space between tempo and grid */
}

.gridContainer{
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px; /* Space between grid and start button */
}

.gridButton {
  width: 25px;
  height: 25px;
  border: 2px solid $neon-blue !important; /* Neon blue border */
  background: $dark-bg;
  margin-right: 2px;
  box-shadow: 0 0 5px $neon-blue, 0 0 10px $neon-blue; /* Neon glow */
}

.active {
  background: $neon-blue;
  box-shadow: 0 0 5px $neon-blue, 0 0 20px $neon-blue; /* Stronger glow when active */
}

.gridRow{
  margin-bottom: 2px;
}

.startButtonContainer {
  display: flex;
  justify-content: center; /* Center the buttons */
  width: 100%;
}

.selectContainer {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align label and select */
}

.neonButton {
  padding: 10px 20px;
  border: none;
  background-color: $neon-pink;
  color: $dark-bg;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 5px $neon-pink, 0 0 20px $neon-pink;
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: color.scale($neon-pink, $lightness: -10%); /* Corrected color.scale usage */
    box-shadow: 0 0 10px $neon-pink, 0 0 30px $neon-pink;
  }
}

.neonText {
  color: $neon-yellow;
  text-shadow: 0 0 5px $neon-yellow, 0 0 10px $neon-yellow;
  margin-right: 10px;
}

.neonSlider {
  -webkit-appearance: none;
  width: 200px;
  height: 15px;
  background: $dark-bg;
  outline: none;
  border: 1px solid $neon-yellow;
  box-shadow: 0 0 5px $neon-yellow, 0 0 10px $neon-yellow;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: $neon-yellow;
    cursor: pointer;
    box-shadow: 0 0 5px $neon-yellow, 0 0 20px $neon-yellow;
  }
}

.neonSelect {
  padding: 8px;
  background-color: $dark-bg;
  color: $neon-yellow;
  border: 1px solid $neon-yellow;
  box-shadow: 0 0 5px $neon-yellow, 0 0 10px $neon-yellow;
  cursor: pointer;
  margin-top: 5px; /* Add a little space between label and select */
}
</style>