const navbar=document.getElementById("navbar");
const menuButton=document.getElementById("menuButton");
const navMenu=document.getElementById("navMenu");

menuButton.addEventListener("click",()=>navMenu.classList.toggle("open"));
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>navMenu.classList.remove("open")));

window.addEventListener("scroll",()=>{
  navbar.classList.toggle("scrolled",window.scrollY>40);
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.15});

document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const sections=document.querySelectorAll("section[id]");
const links=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{
  let current="";
  sections.forEach(section=>{
    if(window.scrollY>=section.offsetTop-150 &&
       window.scrollY<section.offsetTop+section.offsetHeight){
      current=section.id;
    }
  });
  links.forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+current));
});

const visual=document.querySelector(".hero-visual");
if(visual && window.innerWidth>800){
  visual.addEventListener("mousemove",e=>{
    const r=visual.getBoundingClientRect();
    const rx=(e.clientY-r.top-r.height/2)/35;
    const ry=(r.width/2-(e.clientX-r.left))/35;
    visual.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  visual.addEventListener("mouseleave",()=>visual.style.transform="none");
}


async function loadServicesForRequest(){
  const select=document.getElementById("serviceSelect");
  if(!select) return;
  try{
    const r=await fetch("/api/services");
    const d=await r.json();
    if(d.success) d.services.forEach(s=>{const o=document.createElement("option");o.value=s.service_id;o.textContent=s.service_name;select.appendChild(o);});
  }catch(e){ console.log("Services could not be loaded",e); }
}

const requestForm=document.getElementById("requestForm");
if(requestForm) requestForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const result=document.getElementById("requestResult");
  const body=Object.fromEntries(new FormData(requestForm).entries());
  try{
    const r=await fetch("/api/service-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d=await r.json(); result.textContent=d.message; result.style.color=d.success?"#9be79b":"#ff7777"; if(d.success) requestForm.reset();
  }catch(e){result.textContent="Unable to connect to the server.";result.style.color="#ff7777";}
});
loadServicesForRequest();
