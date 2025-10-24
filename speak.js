// voice.js (giữ nguyên định dạng văn bản, đọc theo dòng / từ)
document.addEventListener("DOMContentLoaded", () => {
  const rv = window.responsiveVoice;
  if (!rv) {
    console.warn("ResponsiveVoice chưa sẵn sàng");
    return;
  }

  // ✅ Thêm icon loa 🔊 trước mỗi <p> (nhưng KHÔNG làm thay đổi nội dung thẻ)
  document.querySelectorAll("p").forEach(p => {
    if (p.querySelector(".speaking-toggle")) return;

    // Tạo 1 wrapper chứa icon loa + nội dung gốc
    const wrapper = document.createElement("span");
    wrapper.classList.add("line-block");

    const icon = document.createElement("i");
    icon.classList.add("fa", "fa-volume-up", "volume-icon");
    icon.setAttribute("aria-hidden", "true");

    // Giữ nguyên HTML gốc
    const textSpan = document.createElement("span");
    textSpan.classList.add("line-text");
    textSpan.innerHTML = p.innerHTML;

    // Thay nội dung p bằng khối mới
    wrapper.appendChild(icon);
    wrapper.appendChild(textSpan);
    p.innerHTML = "";
    p.appendChild(wrapper);
  });

  // ✅ Tô sáng chữ đang đọc
  let currentHighlight = null;
  function clearHighlight() {
    if (currentHighlight) {
      currentHighlight.classList.remove("reading-highlight");
      currentHighlight = null;
    }
  }
  function highlightWord(w) {
    clearHighlight();
    w.classList.add("reading-highlight");
    currentHighlight = w;
  }

  // ✅ Xác định ngôn ngữ của từ
  function detectLang(word) {
    const eng = /^[A-Za-z0-9]+$/;
    return eng.test(word) ? "en" : "vi";
  }

  // ✅ Tự chia nhỏ từ (mà không phá format)
  function splitWordsPreserveTags(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.trim()) nodes.push(node);
    }
    nodes.forEach(node => {
      const frag = document.createDocumentFragment();
      const words = node.nodeValue.split(/\s+/);
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = word;
        frag.appendChild(span);
        if (i < words.length - 1) frag.appendChild(document.createTextNode(" "));
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // ✅ Áp dụng chia từ vào tất cả dòng văn bản
  document.querySelectorAll(".line-text").forEach(splitWordsPreserveTags);

  // ✅ Đọc từng từ nối tiếp trong dòng
  async function speakSentence(el) {
    const words = Array.from(el.querySelectorAll(".word"));
    for (const w of words) {
      highlightWord(w);
      const text = w.innerText.replace(/[^\p{L}\p{N}\s]/gu, "");
      if (!text) continue;
      const lang = detectLang(text);
      const voice = lang === "vi" ? selectedVi : selectedEn;
      await new Promise(resolve => {
        rv.speak(text, voice, {
          rate: 1.0,
          pitch: 1.1,
          onend: resolve
        });
      });
    }
    clearHighlight();
  }

  // ✅ Xử lý sự kiện click
  document.body.addEventListener("click", e => {
    if (e.target.closest(".speaking-toggle")) return;

    // 🔸 Bấm vào từ
    if (e.target.classList.contains("word")) {
      e.stopPropagation();
      const w = e.target;
      highlightWord(w);
      const text = w.innerText.replace(/[^\p{L}\p{N}\s]/gu, "");
      const lang = detectLang(text);
      const voice = lang === "vi" ? selectedVi : selectedEn;
      rv.speak(text, voice, { rate: 1.0, pitch: 1.1, onend: clearHighlight });
      return;
    }

    // 🔸 Bấm vào icon loa → đọc toàn dòng (1 <p>)
    if (e.target.classList.contains("volume-icon")) {
      e.stopPropagation();
      const line = e.target.closest(".line-block").querySelector(".line-text");
      speakSentence(line);
    }
  });
});
