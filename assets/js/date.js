let lastMinute = null;

function date() {
  const now = new Date();
  const currentMinute = now.getMinutes();

  if (lastMinute === currentMinute) {
    return;
  }
  lastMinute = currentMinute;

  const locale = window.appLocale || navigator.languages;

  timeEl = document.getElementById("time")
  timeEl.textContent = now.toLocaleTimeString(
    locale,
    {
      hour: "numeric",
      minute: "numeric",
    }
  )
  if (timeEl.textContent.length > 5) {
    timeEl.classList.add("small-clock")
  }
  document.getElementById("date").textContent = now.toLocaleDateString(
    locale,
    {
      weekday: "long",
      day: "numeric",
      month: "long"
    }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  date();
  setInterval(date, 1000);
});
