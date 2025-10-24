// menu.js
let selectedVi = "Vietnamese Female";
let selectedEn = "UK English Female";

document.addEventListener("DOMContentLoaded", () => {
  const rv = window.responsiveVoice;
  const contextMenu = document.getElementById("ContextMenu");
  const settingMenu = document.getElementById("SettingMenu");
  const vietnameseList = document.getElementById("VietnameseVoiceList");
  const englishList = document.getElementById("EnglishVoiceList");
  const settingBtn = document.getElementById("setting");
  const closeSetting = document.getElementById("CloseSetting");

  if (!contextMenu || !settingMenu) {
    console.warn("Thiếu phần tử #ContextMenu hoặc #SettingMenu");
    return;
  }

  // Ẩn toàn bộ menu
  function hideAllMenus() {
    contextMenu.classList.remove("show");
    settingMenu.classList.remove("show");
  }

  // Khi click ngoài menu → ẩn
  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target) && !settingMenu.contains(e.target)) {
      hideAllMenus();
    }
  });

  // Khi click chuột phải → hiện ContextMenu
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    hideAllMenus();

    // Tính toán vị trí hợp lý (tránh vượt biên)
    const menuWidth = contextMenu.offsetWidth || 180;
    const menuHeight = contextMenu.offsetHeight || 120;

    let left = e.clientX;
    let top = e.clientY;

    if (left + menuWidth > window.innerWidth - 10) {
      left = window.innerWidth - menuWidth - 10;
    }
    if (top + menuHeight > window.innerHeight - 10) {
      top = window.innerHeight - menuHeight - 10;
    }

    contextMenu.style.left = `${left}px`;
    contextMenu.style.top = `${top}px`;
    contextMenu.classList.add("show");
  });

  // Khi bấm "Cài đặt" → mở SettingMenu cùng vị trí
  if (settingBtn) {
    settingBtn.addEventListener("click", () => {
      contextMenu.classList.remove("show");

      settingMenu.style.left = contextMenu.style.left;
      settingMenu.style.top = contextMenu.style.top;
      settingMenu.classList.add("show");

      buildVoiceLists();
    });
  }

  // Nút đóng SettingMenu
  if (closeSetting) {
    closeSetting.addEventListener("click", () => {
      settingMenu.classList.remove("show");
    });
  }

  // Hiển thị danh sách giọng đọc
  function buildVoiceLists() {
    if (!rv || !rv.getVoices) return;

    const voices = rv.getVoices() || [];
    const viVoices = voices.filter(v => v.name.includes("Vietnamese"));
    const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));

    vietnameseList.innerHTML = "";
    englishList.innerHTML = "";

    viVoices.forEach(v => {
      const li = document.createElement("li");
      li.textContent = v.name + (v.name === selectedVi ? " ✓" : "");
      vietnameseList.appendChild(li);
    });

    enVoices.forEach(v => {
      const li = document.createElement("li");
      li.textContent = v.name + (v.name === selectedEn ? " ✓" : "");
      englishList.appendChild(li);
    });
  }

  // Ẩn khi load
  contextMenu.classList.remove("show");
  settingMenu.classList.remove("show");
});
