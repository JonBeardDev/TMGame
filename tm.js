Array.prototype.shuffle = function () {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
};

const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);
const $E = (tag, props = {}, kids = []) =>
  kids.reduce(
    (e, c) => (e.appendChild(c), e),
    Object.assign(document.createElement(tag), props)
  );

const divmod = (n, d) => [Math.floor(n / d), n % d];
const rand = (m, n) => Math.floor(Math.random() * (n - m + 1)) + m;

const gen_series = () => {
  for (let i = 0; i < 15; ++i) {
    const s = i * 5 + 1 - ~~(i / 3) * 14;
    const label = $E("div", { className: "slabel", innerText: `Series ${s}` });
    const sbox = $E("div", { className: "series", id: `s${s}` }, [label]);
    sbox.addEventListener("click", () => handle(s));
    qs("#board").appendChild(sbox);
  }
};

const bgpos = (e, n) => {
  const [y, x] = divmod(n, 10);
  e.style.backgroundPositionY = `${y / 0.07}%`;
  e.style.backgroundPositionX = `${x / 0.09}%`;
};

const undo = (e) => {
  e.preventDefault();
  const seat = e.target;
  const n = seat.getAttribute("data-i");
  seat.parentNode.childNodes[0].style.visibility = "visible";
  seat.parentNode.removeChild(seat);
  deck.push(cur, n);
  tick();
};

const gen_seat = (n) => {
  const seat = $E("div", { className: "seat" });
  seat.setAttribute("data-i", n);
  seat.addEventListener("contextmenu", undo);
  bgpos(seat, n);
  return seat;
};

const names =
  "Frank Skinner|Josh Widdicombe|Roisin Conaty|Romesh Ranganathan|Tim Key|Doc Brown|Joe Wilkinson|Jon Richardson|Katherine Ryan|Richard Osman|Al Murray|Dave Gorman|Paul Chowdhry|Rob Beckett|Sara Pascoe|Hugh Dennis|Joe Lycett|Lolly Adefope|Mel Giedroyc|Noel Fielding|Aisling Bea|Bob Mortimer|Mark Watson|Nish Kumar|Sally Phillips|Alice Levine|Asim Chaudhry|Liza Tarbuck|Russell Howard|Tim Vine|James Acaster|Jessica Knappett|Kerry Godliman|Phil Wang|Rhod Gilbert|Iain Stirling|Joe Thomas|Lou Sanders|Paul Sinha|Sian Gibson|David Baddiel|Ed Gamble|Jo Brand|Katy Wix|Rose Matafeo|Daisy May Cooper|Johnny Vegas|Katherine Parkinson|Mawaan Rizwan|Richard Herring|Charlotte Ritchie|Jamali Maddix|Lee Mack|Mike Wozniak|Sarah Kendall|Alan Davies|Desiree Burch|Guz Khan|Morgana Robinson|Victoria Coren Mitchell|Ardal O'Hanlon|Bridget Christie|Chris Ramsey|Judi Love|Sophie Duker|Dara Ó Briain|Fern Brady|John Kearns|Munya Chawawa|Sarah Millican|Frankie Boyle|Ivo Graham|Jenny Eclair|Kiell Smith-Bynoe|Mae Martin".split(
    "|"
  );

const pass = [],
  deck = [...Array(names.length).keys()];
let cur, computed_margin, confetti, start, timer;
let done = false,
  passes = 0;

const judge = () => {
  clearInterval(timer);
  let score = 0;
  qsa(".seat").forEach((s) => {
    sid = s.parentNode.id.substr(1) * 1 - 1;
    if (~~(s.getAttribute("data-i") / 5) == sid) {
      score += 1;
      s.classList.add("dim");
    }
  });
  qs(
    "#current"
  ).innerHTML = `<span id="score">${score}</span><span id="outof">/ 75</span>`;
  qs("#pass").innerText = `Passes: ${passes}`;
  if (score == 75) celebrate();
  return true;
};

const tick = () => {
  if (deck.length == 0) {
    if (pass.length == 0) return (done = judge());
    else {
      deck.splice(0, 0, ...pass.splice(0, pass.length));
      qs("#pass-info").innerText = "";
      qsa(".pile-card").forEach((e) => e.parentNode.removeChild(e));
    }
  }
  bgpos(qs("#port"), (cur = deck.pop()));
  qs("#deck").innerText = deck.length;
  qs("#name").innerText = names[cur].split(" ")[0].toLowerCase();
};

const confetti_go = (n) => () => {
  confetti.addConfetti({
    confettiColors: ["#eab64d", "#c49151", "#a32927", "#fc4c4e"],
    confettiRadius: 6,
    confettiNumber: n || 400,
  });
};

const celebrate = () => {
  confetti_go(600)();
  setTimeout(confetti_go(), 1600);
  setTimeout(confetti_go(), 2000);
  setTimeout(confetti_go(60), 6000);
};

const clock = () => {
  const now = performance.now();
  const elapsed = (now - start) / 1000;
  if (elapsed < 60) qs("#timer").innerText = elapsed.toFixed(1);
  else {
    const [m, s] = divmod(elapsed, 60);
    qs("#timer").innerText = `${m}:${String(~~s).padStart(2, "0")}`;
    clearInterval(timer);
    timer = setInterval(clock, 1000);
  }
};

const pile_add = () => {
  const card = $E("div", { className: "pile-card" });
  card.setAttribute(
    "style",
    `left: ${rand(15, 75)}%;
      top: ${rand(5, 50)}%;
      transform: rotate(${rand(1, 180)}deg);`
  );
  qs("#pass-wrap").appendChild(card);
};

const handle_pass = () => {
  if (done) return;
  passes += 1;
  pass.push(cur);
  pile_add();
  qs("#pass-info").innerText = ` (${pass.length})`;
  tick();
};

const handle = (si) => {
  if (done) return;
  if (!start) {
    start = performance.now();
    timer = setInterval(clock, 100);
  }

  const sbox = qs(`#s${si}`);
  if (sbox.childNodes.length > 4)
    sbox.childNodes[0].style.visibility = "hidden";
  if (sbox.childNodes.length > 5) return;

  const seat = gen_seat(cur);
  const seated = sbox.querySelectorAll(".seat");
  const ni = seat.getAttribute("data-i");
  const ti = Array.from(seated).find(
    (e) => names[e.getAttribute("data-i")] > names[ni]
  );
  sbox.insertBefore(seat, ti);

  if (!computed_margin) {
    const wb = sbox.getBoundingClientRect().width - 4;
    const ws = seat.getBoundingClientRect().width;
    computed_margin = (wb - ws * 5) / 10;
    const sheet = document.styleSheets[0],
      rules = Array.from(sheet.cssRules),
      i = rules.findIndex((r) => r.selectorText == ".seat");
    rules[i].style.margin = `0 ${computed_margin}px`;
  }

  tick();
};

const toggle_help = () => {
  const h = qs("#help-modal");
  h.style.display = h.style.display == "flex" ? "none" : "flex";
};

const toggle_timer = (e) => {
  qs("#timer").style.visibility = e.checked ? "visible" : "hidden";
};

window.addEventListener("DOMContentLoaded", () => {
  qs("#pass").addEventListener("click", handle_pass);
  gen_series();
  deck.shuffle();
  tick();

  confetti = new JSConfetti();
});

window.addEventListener("keyup", (e) => {
  if ((m = e.code.match(/^Digit([0-9])$/))) {
    const sid = e.shiftKey * 10 + m[1] * 1;
    if (sid > 0 && sid < 16) handle(sid);
  }
});
