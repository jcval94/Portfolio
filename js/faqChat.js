/* --------------- carga FAQs desde JSON local ------------------------*/
let faqs = [];
fetch('data/faqs.json')
  .then(r=>r.json())
  .then(data=>faqs=data);

/* -------- helpers UI -----------------------------------------------*/
const box     = id=>document.getElementById(id);
const addBubble = (text, type, extraClass="")=>{
  const div = document.createElement("div");
  div.className = `${type}-message ${extraClass}`.trim();
  div.textContent = text;
  box('chat-box').appendChild(div);
  box('chat-box').scrollTop = box('chat-box').scrollHeight;
  return div;
};

/* efecto de tipeo progresivo ----------------------------------------*/
const typeText = (el, text, speed=22)=>{
  let idx=0; el.textContent="";
  return new Promise(res=>{
    const int = setInterval(()=>{
      el.textContent += text.charAt(idx++);
      if(idx>=text.length){clearInterval(int); res();}
    },speed);
  });
};

/* contador de interacciones totales ---------------------------------*/
let fallbackCount = 0;
const fallbackMsg = "Gracias por tu interés, podemos platicar más a fondo de mi experiencia, comunícate a +52 55 1048 3685";

/* -------------------- procesa pregunta -----------------------------*/
async function handleQuestion(qText){
  fallbackCount += 1;                // cada selección o envío suma
  addBubble(qText,"user");

  const processing = addBubble("Procesando respuesta ☕…","bot","processing");

  // Buscar FAQ exacto
  const faq = faqs.find(f=>f.question.toLowerCase()===qText.toLowerCase());
  let answer = "";

  if(faq){
    answer = faq.answer;
  } else {
    // Intentar respuesta via OpenAI
    try {
      const r = await fetch('/process',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:qText})
      });
      const data = await r.json();
      answer = data.result || "";
    } catch {
      // en caso de fallo en fetch => contact message
      answer = fallbackMsg;
    }
  }

  // Si sigue vacío, usar fallback genérico
  if(!answer){
    answer = (fallbackCount>=3 && fallbackCount%2===1)
             ? fallbackMsg
             : "📚 OpenAI";
  }

  // Reemplaza “procesando…” con tipeo
  processing.classList.remove("processing");
  await typeText(processing, answer);
}

/* -------------------- interface ------------------------------------*/
document.addEventListener("DOMContentLoaded",()=>{
  const launcher = box("chat-launcher");
  const wrapper  = box("chat-wrapper");
  const closeBtn = box("chat-close");
  const form     = box("chat-form");
  const input    = box("chat-input");

  /* abrir chat */
  launcher.onclick = ()=>{
    wrapper.style.display = "flex";
    launcher.style.display = "none";
    box('chat-box').innerHTML = "";
    addBubble("¡Hola! Selecciona una pregunta o escribe la tuya 👇","bot");
    // Quick replies
    faqs.forEach(f=>{
      const btn = addBubble(f.question,"bot","quick-reply");
      btn.onclick = ()=>{ input.value=""; handleQuestion(f.question); };
    });
  };

  /* cerrar */
  closeBtn.onclick = ()=>{
    wrapper.style.display = "none";
    launcher.style.display = "flex";
  };

  /* envío manual */
  form.onsubmit = e=>{
    e.preventDefault();
    const txt = input.value.trim();
    if(!txt) return;
    input.value="";
    handleQuestion(txt);
  };
});
