// Finding the page elements that JavaScript will update
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

const attendanceGoal = 50;
const storageKey = "intelSummitCheckIn";

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables"
};

let attendees = [];

// Loading saved attendees when the page opens
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));

  if (saved && Array.isArray(saved.attendees)) {
    attendees = saved.attendees.filter(function (attendee) {
      return (
        attendee &&
        typeof attendee.name === "string" &&
        attendee.name.trim() !== "" &&
        Object.hasOwn(teamNames, attendee.team)
      );
    });
  }
} catch (error) {
  console.warn("Saved attendance could not be loaded", error);
}

// Creating the celebration message and attendee list with JavaScript
const celebration = document.createElement("p");
celebration.setAttribute("role", "status");
celebration.style.cssText =
  "display:none; margin-top:20px; padding:16px; " +
  "background:#ecfdf3; border-radius:12px; color:#166534;";
document.querySelector(".team-stats").appendChild(celebration);

const listSection = document.createElement("section");
listSection.style.cssText =
  "margin-top:24px; padding-top:24px; " +
  "border-top:2px solid #f1f5f9; text-align:left;";

const listHeading = document.createElement("h3");
listHeading.textContent = "Checked-In Attendees";
listHeading.style.marginBottom = "12px";

const attendeeList = document.createElement("ul");
attendeeList.style.cssText = "list-style:none; padding:0;";

listSection.append(listHeading, attendeeList);
document.querySelector(".team-stats").appendChild(listSection);

// Making the greeting and progress bar accessible to screen readers
greeting.setAttribute("role", "status");
progressBar.setAttribute("role", "progressbar");
progressBar.setAttribute("aria-label", "Attendance goal progress");
progressBar.setAttribute("aria-valuemin", "0");
progressBar.setAttribute("aria-valuemax", attendanceGoal);

// Counting how many attendees belong to each team
function getTeamCounts() {
  const counts = { water: 0, zero: 0, power: 0 };

  attendees.forEach(function (attendee) {
    counts[attendee.team] += 1;
  });

  return counts;
}

// Updating the counters, progress bar, attendee list, and celebration
function updatePage() {
  const total = attendees.length;
  const counts = getTeamCounts();

  attendeeCount.textContent = total;

  Object.keys(counts).forEach(function (team) {
    document.getElementById(team + "Count").textContent = counts[team];
  });

  // Keeping the progress bar at 100% if attendance goes beyond the goal
  const percentage = Math.min((total / attendanceGoal) * 100, 100);
  progressBar.style.width = percentage + "%";
  progressBar.setAttribute(
    "aria-valuenow",
    Math.min(total, attendanceGoal)
  );
  progressBar.setAttribute(
    "aria-valuetext",
    total + " attendees checked in; goal: " + attendanceGoal
  );

  attendeeList.replaceChildren();

  if (total === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "No attendees checked in yet";
    attendeeList.appendChild(emptyMessage);
  }

  attendees.forEach(function (attendee) {
    const item = document.createElement("li");
    item.textContent = attendee.name + " — " + teamNames[attendee.team];
    item.style.cssText =
      "padding:12px; margin-bottom:8px; " +
      "background:#f8fafc; border-radius:8px;";
    attendeeList.appendChild(item);
  });

  if (total >= attendanceGoal) {
    const highestCount = Math.max(...Object.values(counts));

    const leaders = Object.keys(counts).filter(function (team) {
      return counts[team] === highestCount;
    });

    const leaderNames = leaders.map(function (team) {
      return teamNames[team];
    });

    celebration.textContent =
      leaders.length === 1
        ? "🎉 Attendance goal reached! " +
          leaderNames[0] +
          " leads with " +
          highestCount +
          " attendees!"
        : "🎉 Attendance goal reached! It's a tie between " +
          leaderNames.join(" and ") +
          " with " +
          highestCount +
          " attendees each!";

    celebration.style.display = "block";
  } else {
    celebration.style.display = "none";
  }
}

// Saving the attendees, total attendance, and team counts in localStorage
function saveProgress() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        attendees: attendees,
        total: attendees.length,
        teamCounts: getTeamCounts()
      })
    );

    return true;
  } catch (error) {
    console.warn("Attendance could not be saved", error);
    return false;
  }
}

// Listening for someone to submit the check-in form
form.addEventListener("submit", function (event) {
  // Preventing the form from refreshing the page
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;

  greeting.classList.add("success-message");
  greeting.style.display = "block";

  if (!name || !Object.hasOwn(teamNames, team)) {
    greeting.textContent = "Please enter a name and select a team";
    return;
  }

  attendees.push({
    name: name,
    team: team
  });

  updatePage();
  const saved = saveProgress();

  greeting.textContent =
    "Welcome, " + name + "! You checked in with " + teamNames[team];

  if (!saved) {
    greeting.textContent +=
      " — Check-in recorded, but this browser could not save your progress";
  }

  form.reset();
  nameInput.focus();
});

// Displaying any saved attendance when the page first opens
updatePage();