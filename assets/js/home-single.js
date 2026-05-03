const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");

const items = [...document.querySelectorAll(".menu-item")];

const paths = {
  squad: document.getElementById("arc-squad"),
  fixtures: document.getElementById("arc-fixtures"),
  gallery: document.getElementById("arc-gallery")
};

const dots = {
  squad: document.getElementById("dot-squad"),
  fixtures: document.getElementById("dot-fixtures"),
  gallery: document.getElementById("dot-gallery")
};

const grads = {
  squad: document.getElementById("grad-squad"),
  fixtures: document.getElementById("grad-fixtures"),
  gallery: document.getElementById("grad-gallery")
};

/* INTERACTION */
logo.onclick = (e)=>{
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if(scene.classList.contains("is-open")){
    positionMenu();
    drawArcs();
  }
};

document.body.onclick = ()=>scene.classList.remove("is-open");

/* MENU POSITION (compact & safe) */
function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;

  const radius = Math.min(
    Math.min(innerWidth, innerHeight) * 0.28,
    280
  );

  const angles = {
    squad:-90,
    fixtures:35,
    gallery:215
  };

  items.forEach(el=>{
    const a = angles[el.dataset.key]*Math.PI/180;
    el.style.left = `${cx + Math.cos(a)*radius}px`;
    el.style.top  = `${cy + Math.sin(a)*radius}px`;
  });
}

/* ARC DRAWING (SMALL, ALIGNED, CONTROLLED) */
function drawArcs(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const logoRadius = r.width/2 + 12;

  items.forEach(el=>{
    const key = el.dataset.key;
    const b = el.getBoundingClientRect();

    let ex = b.left + b.width/2;
    let ey = b.top  + b.height/2;

    const dx = ex-cx;
    const dy = ey-cy;
    const len = Math.hypot(dx,dy)||1;

    const sx = cx + (dx/len)*logoRadius;
    const sy = cy + (dy/len)*logoRadius;

    ex -= (dx/len)*36;
    ey -= (dy/len)*36;

    const nx = -dy/len;
    const ny =  dx/len;
    const bend = 10;

    const c1x = sx + dx*0.35 + nx*bend;
    const c1y = sy + dy*0.35 + ny*bend;
    const c2x = sx + dx*0.65 + nx*bend;
    const c2y = sy + dy*0.65 + ny*bend;

    paths[key].setAttribute(
      "d",
      `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
    );

    grads[key].setAttribute("x1", sx);
    grads[key].setAttribute("y1", sy);
    grads[key].setAttribute("x2", ex);
    grads[key].setAttribute("y2", ey);
    grads[key].innerHTML = `
      <stop offset="0%" stop-color="#ffd27d"/>
      <stop offset="75%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#f5a623" stop-opacity="0"/>
    `;

    paths[key].setAttribute("stroke", `url(#grad-${key})`);

    dots[key].setAttribute("cx", ex);
    dots[key].setAttribute("cy", ey);
  });
}

window.onresize = ()=>{
  if(scene.classList.contains("is-open")){
    positionMenu();
    drawArcs();
  }
};
