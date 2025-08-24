export const openWindow = (url: string) => {
  window.open(url, "_blank");
};

export const smoothScrollTo = (element: HTMLElement, targetPosition: number) => {
  const startPosition = element.scrollTop;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  const duration = 1200;

  function animateScroll(currentTime: number) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const ease = easeInOutQuad(progress);

    element.scrollTop = startPosition + distance * ease;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  function easeInOutQuad(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  requestAnimationFrame(animateScroll);
};