// import cassetteEject from "./sound-effects/cassette-eject.mp3";
// import cassetteInsert from './sound-effects/tape-cassette-insert.mp3';
// import casetteButtonSound from './sound-effects/cassette-tape-button.mp3';


// export const soundEffects = {
//   cassetteEject,
//   cassetteInsert,
//   casetteButtonSound,
// }

export const playSoundEffect = (soundEffect: string) => {
  const audio = new Audio(soundEffect);
  audio.play();
}