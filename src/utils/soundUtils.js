// Play a one-shot sound effect — always creates a fresh Audio instance
// so it never conflicts with singletons or countdown
export function playSfx(src, volume = 0.85) {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.play().catch(() => {})
  } catch (e) {}
}
