const calculateBtn = document.getElementById("btn");
const darkToggle = document.getElementById("dark-toggle");
const downloadBtn = document.getElementById("download-btn");
const extras = document.querySelector(".extras");
const resultsSection = document.querySelector(".results-section");

let latestData = {};

calculateBtn.addEventListener("click", () => {
  const nameInput = document.getElementById("name")?.value.trim();
  const dobInput = document.getElementById("dob")?.value;

  if (!nameInput) return alert("Please enter your name.");
  if (!dobInput) return alert("Please select your date of birth.");

  const birthDate = new Date(dobInput);
  const now = new Date();
  if (birthDate > now) return alert("Date of birth cannot be in the future.");

  resultsSection.classList.remove("hidden");
  extras.classList.remove("hidden");

  const diffMs = now - birthDate;
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  document.querySelector(".years").textContent = `= ${years} years ${months} months ${days} days`;
  document.querySelector(".months").textContent = `= ${totalMonths} months ${days} days`;
  document.querySelector(".weeks").textContent = `= ${totalDays.toLocaleString()} days`;
  document.querySelector(".days").textContent = `≈ ${totalHours.toLocaleString()} hours`;
  document.querySelector(".hours").textContent = `≈ ${totalMinutes.toLocaleString()} minutes`;
  document.querySelector(".mins").textContent = `≈ ${totalSeconds.toLocaleString()} seconds`;

  const nextBirthday = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));
  document.querySelector(".next-birthday").textContent = `🎂 ${daysToNext} day(s) until your next birthday!`;

  const milestones = [];
  if (totalSeconds >= 1_000_000) milestones.push("🎉 1M seconds lived!");
  if (totalMinutes >= 1_000_000) milestones.push("⏳ 1M minutes milestone!");
  if (totalDays >= 10_000) milestones.push("🌟 10K days lived!");
  const milestoneText = milestones.length ? milestones.join(" | ") : "No milestone yet, keep living!";
  document.querySelector(".milestones").textContent = milestoneText;

  const zodiacSigns = [
    ["Capricorn", 0, 19], ["Aquarius", 0, 20], ["Pisces", 1, 19], ["Aries", 2, 20],
    ["Taurus", 3, 20], ["Gemini", 4, 21], ["Cancer", 5, 20], ["Leo", 6, 22],
    ["Virgo", 7, 22], ["Libra", 8, 22], ["Scorpio", 9, 21], ["Sagittarius", 10, 21],
    ["Capricorn", 11, 31]
  ];
  const month = birthDate.getMonth();
  const day = birthDate.getDate();
  const sign = zodiacSigns.find(([_, m, d]) => month === m && day <= d) || zodiacSigns[month + 1];
  const zodiac = sign[0];
  document.querySelector(".zodiac").textContent = `Zodiac Sign: ${zodiac}`;

  const averageLife = 72.6;
  const lifePercent = ((years + months / 12 + days / 365) / averageLife * 100).toFixed(1);
  document.querySelector(".life-expectancy").textContent = `📊 You've lived approximately ${lifePercent}% of the average human lifespan.`;

  document.querySelectorAll(".results-section p").forEach((p, i) => {
    p.classList.remove("animate");
    void p.offsetWidth;
    p.style.animationDelay = `${i * 0.05}s`;
    p.classList.add("animate");
  });

  latestData = {
    name: nameInput,
    years,
    months: totalMonths,
    days: totalDays,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds,
    zodiac,
    nextBirthdayDays: daysToNext,
    milestones: milestoneText,
    lifePercent
  };

  startLiveAge(birthDate);
});

function startLiveAge(dob) {
  clearInterval(window.liveAgeInterval);
  function updateLiveAge() {
    const now = new Date();
    const diff = now - new Date(dob);
    const ageDate = new Date(diff);
    const y = ageDate.getUTCFullYear() - 1970;
    const m = ageDate.getUTCMonth();
    const d = ageDate.getUTCDate() - 1;
    const h = ageDate.getUTCHours();
    const min = ageDate.getUTCMinutes();
    const s = ageDate.getUTCSeconds();

    document.querySelector(".live-age").textContent =
      `Live Age: ${y}y ${m}m ${d}d ${h}h ${min}m ${s}s`;
  }

  updateLiveAge();
  window.liveAgeInterval = setInterval(updateLiveAge, 1000);
}

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.innerHTML = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

downloadBtn.addEventListener("click", () => {
  if (!latestData || !latestData.name) return alert("Please calculate your age first.");

  const {
    name, years, months, days, hours, minutes, seconds,
    zodiac, nextBirthdayDays, milestones, lifePercent
  } = latestData;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Age Summary Report for ${name}`, 20, 20);

  doc.setFontSize(12);
  let y = 40;
  const lineHeight = 8;

  const lines = [
    `Name: ${name}`,
    `Age: ${years} years`,
    `Total Months: ${months}`,
    `Total Days: ${days}`,
    `Total Hours: ${hours}`,
    `Total Minutes: ${minutes}`,
    `Total Seconds: ${seconds}`,
    ``,
    `Zodiac Sign: ${zodiac}`,
    `Next Birthday In: ${nextBirthdayDays} day(s)`,
    ``,
    `Milestones:`,
    `${milestones}`,
    ``,
    `Life Expectancy Progress: ${lifePercent}%`
  ];

  lines.forEach(line => {
    doc.text(line, 20, y);
    y += lineHeight;
  });

  doc.save(`age-summary-${name}.pdf`);
});

tsParticles.load("tsparticles", {
  fullScreen: { enable: false },
  particles: {
    number: { value: 60 },
    color: { value: "#0077ff" },
    shape: { type: "circle" },
    opacity: { value: 0.3 },
    size: { value: { min: 1, max: 3 } },
    move: { enable: true, speed: 1 }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      resize: true
    }
  },
  background: {
    color: "transparent"
  }
});

