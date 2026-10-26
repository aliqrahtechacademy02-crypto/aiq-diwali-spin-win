const prizes = [
  {
    label: "10% OFF\nEligible Courses",
    short: "10% OFF",
    color: "#cb2635",
    terms: "Valid on eligible courses. Confirm eligibility with the academy."
  },
  {
    label: "₹500 OFF\nEligible Courses",
    short: "₹500 OFF",
    color: "#f3b632",
    terms: "Minimum course fee and eligibility conditions apply."
  },
  {
    label: "₹1,000 OFF\nSelected Courses",
    short: "₹1,000 OFF",
    color: "#633aa0",
    terms: "Valid on selected courses only. Confirm eligibility with the academy."
  },
  {
    label: "FREE AI\nTOOLS WORKSHOP",
    short: "Free AI Tools Workshop",
    color: "#0d9b85",
    terms: "Workshop date and availability must be confirmed with the academy."
  },
  {
    label: "FREE CANVA\nWORKSHOP",
    short: "Free Canva Workshop",
    color: "#f47716",
    terms: "Workshop date and availability must be confirmed with the academy."
  },
  {
    label: "DIWALI\nCOURSE BUNDLE",
    short: "Diwali Course Bundle",
    color: "#244b9b",
    terms: "Bundle pricing and eligible courses must be confirmed with the academy."
  },
  {
    label: "FREE CAREER\nGUIDANCE SESSION",
    short: "Free Career Guidance Session",
    color: "#d33c91",
    terms: "Appointment subject to availability."
  },
  {
    label: "EXCLUSIVE\nDIWALI OFFER",
    short: "Exclusive Diwali Offer",
    color: "#238a36",
    terms: "Contact the academy to confirm the available offer and eligibility."
  }
];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

let rotation = 0;
let spinning = false;
let participant = null;

// --------------------------------------------------
// DRAW THE WHEEL
// --------------------------------------------------

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 5;
  const arc = (Math.PI * 2) / prizes.length;

  ctx.clearRect(0, 0, size, size);

  prizes.forEach((prize, i) => {
    const start = rotation + i * arc - Math.PI / 2;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.closePath();

    ctx.fillStyle = prize.color;
    ctx.fill();

    ctx.strokeStyle = "#ffdf83";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();

    ctx.translate(center, center);
    ctx.rotate(start + arc / 2);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = prize.label.split("\n");
    const textRadius = radius * 0.66;

    ctx.translate(textRadius, 0);

    const angle = start + arc / 2;

    if (Math.cos(angle) < 0) {
      ctx.rotate(Math.PI);
    }

    ctx.fillStyle =
      prize.color === "#f3b632" ? "#21102a" : "#fff8ec";

    ctx.font = "700 22px Arial";

    lines.forEach((line, lineIndex) => {
      ctx.fillText(
        line,
        0,
        (lineIndex - (lines.length - 1) / 2) * 27,
        145
      );
    });

    ctx.restore();
  });
}

drawWheel();

// --------------------------------------------------
// CAMPAIGN STATUS
// --------------------------------------------------

function campaignState() {
  const now = new Date();

  // Campaign uses India Standard Time.
  const start = new Date("2026-10-25T00:00:00+05:30");
  const end = new Date("2026-11-07T00:00:00+05:30");

  const status = document.getElementById("campaign-status");
  const button = document.getElementById("spin-button");
  const formNote = document.getElementById("form-note");

  if (now < start) {
    status.textContent = "OPENS 25 OCTOBER 2026";
    button.disabled = true;
    button.textContent = "CAMPAIGN OPENS 25 OCTOBER";
    button.style.opacity = ".65";

    formNote.textContent =
      "Registration and spins open on 25 October 2026.";
  } else if (now >= end) {
    status.textContent = "CAMPAIGN ENDED";
    button.disabled = true;
    button.textContent = "CAMPAIGN ENDED";
    button.style.opacity = ".65";

    formNote.textContent =
      "This Diwali campaign has ended.";
  } else {
    status.textContent = "DIWALI CAMPAIGN IS LIVE";
    button.disabled = false;
    button.textContent = "REGISTER & SPIN";
    button.style.opacity = "1";

    formNote.textContent =
      "Enter your details and spin to discover your Diwali offer.";
  }
}

campaignState();

// --------------------------------------------------
// RESULT MODAL
// --------------------------------------------------

function openResult(prize) {
  document.getElementById("prize-name").textContent = prize.short;

  document.getElementById("coupon-code").textContent =
    participant.coupon;

  document.getElementById("result-terms").textContent =
    `${prize.terms} Your coupon has been recorded by the academy's campaign system. Contact the academy to confirm redemption conditions.`;

  const message =
    `Hello AL IQRAH TECH ACADEMY!\n\n` +
    `My name is ${participant.name}.\n` +
    `My course interest is ${participant.course}.\n` +
    `My Diwali Spin & Win prize is: ${prize.short}.\n` +
    `My coupon code is: ${participant.coupon}.\n\n` +
    `Please confirm my eligibility and redemption details.`;

  document.getElementById("claim-button").href =
    `https://wa.me/917418093446?text=${encodeURIComponent(message)}`;

  document.getElementById("result-modal").hidden = false;
}

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("result-modal").hidden = true;
});

document.getElementById("result-modal").addEventListener("click", (event) => {
  if (event.target.id === "result-modal") {
    event.currentTarget.hidden = true;
  }
});

// --------------------------------------------------
// FIND THE SERVER'S PRIZE ON THE WHEEL
// --------------------------------------------------

function findPrizeIndex(serverPrizeName) {
  function normalize(value) {
    return String(value || "")
      .replace(/\\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const serverName = normalize(serverPrizeName);

  return prizes.findIndex((prize) => {
    return (
      normalize(prize.short) === serverName ||
      normalize(prize.label) === serverName
    );
  });
}

// --------------------------------------------------
// SPIN ANIMATION
// The prize must come from Supabase, never from the browser.
// --------------------------------------------------

function animateToPrize(winnerIndex) {
  return new Promise((resolve, reject) => {
    if (
      !canvas ||
      !ctx ||
      !Number.isInteger(winnerIndex) ||
      winnerIndex < 0 ||
      winnerIndex >= prizes.length
    ) {
      reject(new Error("Invalid wheel or prize index."));
      return;
    }

    const fullTurn = Math.PI * 2;
    const arc = fullTurn / prizes.length;
    const startRotation = rotation;

    const currentAngle =
      ((startRotation % fullTurn) + fullTurn) % fullTurn;

    const desiredAngle =
      fullTurn - (winnerIndex + 0.5) * arc;

    const extraRotation =
      ((desiredAngle - currentAngle) % fullTurn + fullTurn) % fullTurn;

    const targetRotation =
      startRotation + fullTurn * 6 + extraRotation;

    const startTime = performance.now();
    const duration = 4600;

    function animate(now) {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 4);

      rotation =
        startRotation +
        (targetRotation - startRotation) * eased;

      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        rotation =
          ((rotation % fullTurn) + fullTurn) % fullTurn;

        drawWheel();
        resolve();
      }
    }

    drawWheel();
    requestAnimationFrame(animate);
  });
}
// --------------------------------------------------
// SUBMIT REGISTRATION AND REQUEST A SECURE SPIN
// --------------------------------------------------

document.getElementById("spin-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (spinning) return;
  if (!event.currentTarget.reportValidity()) return;

  const button = document.getElementById("spin-button");
  const formNote = document.getElementById("form-note");

  const name = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const course = document.getElementById("course").value;

  // Check the campaign dates before sending a request.
  const now = new Date();
  const start = new Date("2026-10-25T00:00:00+05:30");
  const end = new Date("2026-11-07T00:00:00+05:30");

  if (now < start || now >= end) {
    campaignState();
    return;
  }

  // Confirm that Supabase configuration was loaded.
  if (
    typeof SUPABASE_URL === "undefined" ||
    typeof SUPABASE_PUBLISHABLE_KEY === "undefined"
  ) {
    formNote.textContent =
      "Configuration error: check supabase-config.js and reload the page.";
    return;
  }

  spinning = true;
  button.disabled = true;
  button.textContent = "CHECKING YOUR ENTRY...";
  formNote.textContent = "Submitting your registration securely. Please wait.";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/play-diwali-spin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          full_name: name,
          phone: phone,
          course_interest: course
        })
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.success !== true) {
      const message =
        result?.message ||
        "We couldn't process your entry. Please try again later.";

      formNote.textContent = message;
      return;
    }

    // The winning prize and coupon are returned by Supabase.
    const winnerIndex = findPrizeIndex(result.prize_name);

    if (winnerIndex === -1 || !result.coupon_code) {
      console.error("Unexpected Supabase response:", result);

      formNote.textContent =
        "Your entry was processed, but we couldn't display the result. Please contact the academy and do not submit another entry.";

      return;
    }

    participant = {
      name: name,
      phone: phone,
      course: course,
      coupon: result.coupon_code
    };

    button.textContent = "YOUR SPIN IS RECORDED";

    formNote.textContent =
      "Your entry has been recorded successfully!";

    // Animate to the prize already selected by the server.
  console.log("Starting wheel animation. Prize index:", winnerIndex);

await animateToPrize(winnerIndex);

console.log("Wheel animation finished.");

// Show the winning prize and coupon after the wheel stops.
openResult(prizes[winnerIndex]);
  } catch (error) {
    console.error("Spin request error:", error);

    formNote.textContent =
      "Unable to connect to the campaign server. Please check your connection and try again. If your request may already have completed, contact the academy before submitting again.";
  } finally {
    spinning = false;

    // Re-enable only if the campaign is still open.
    campaignState();

    // Keep the button locked after a successful spin in this page.
    if (participant && participant.coupon) {
      button.disabled = true;
      button.textContent = "YOUR SPIN IS RECORDED";
    }
  }
});

window.testWheelAnimation = function () {
  console.log("Test started!");
  animateToPrize(3);
};