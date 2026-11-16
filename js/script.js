/* =========================================================
   JEDA SEJENAK - script.js
   Dipakai semua halaman. Tiap fitur aman dijalankan
   walau elemennya tidak ada di halaman tersebut.
   ========================================================= */
(() => {
  "use strict";

  /* ---------- 1. MOBILE MENU ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    links.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    // tutup saat link diklik
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    // tutup dengan tombol Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    // kalau layar dilebarkan, pastikan menu tertutup
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- 2. FILTER KATEGORI MENU ---------- */
  const chips = document.querySelectorAll(".chip");
  const cards = document.querySelectorAll(".menu-card");
  const count = document.getElementById("menu-count");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      let shown = 0;

      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));

      cards.forEach((card) => {
        const match = filter === "semua" || card.dataset.category === filter;
        card.hidden = !match;
        if (match) shown++;
      });

      if (count) count.textContent = `Menampilkan ${shown} menu`;
    });
  });

  /* ---------- 3. STATUS BUKA / TUTUP + HARI INI ---------- */
  // getDay(): 0 = Minggu, 1 = Senin, ... 6 = Sabtu. [buka, tutup] dalam jam.
  // Ubah jam di sini kalau jadwal berubah (dan di tabel HTML location.html).
  const HOURS = {
    0: [12, 22],
    1: [10, 23],
    2: [10, 23],
    3: [10, 23],
    4: [10, 23],
    5: [10, 23],
    6: [10, 24],
  };

  let isOpenNow = true;
  const fmt = (h) => String(h % 24).padStart(2, "0") + ".00";

  function updateStatus() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours() + now.getMinutes() / 60;
    const [open, close] = HOURS[day];
    const isOpen = hour >= open && hour < close;
    isOpenNow = isOpen;

    let text;
    if (isOpen) {
      text = `Buka sekarang, tutup pukul ${fmt(close)}`;
    } else if (hour < open) {
      text = `Tutup sekarang, buka hari ini pukul ${fmt(open)}`;
    } else {
      text = `Tutup sekarang, buka besok pukul ${fmt(HOURS[(day + 1) % 7][0])}`;
    }

    document.querySelectorAll("[data-open-status]").forEach((el) => {
      el.textContent = text;
      el.classList.toggle("is-open", isOpen);
      el.classList.toggle("is-closed", !isOpen);
    });

    document.querySelectorAll("[data-day]").forEach((row) => {
      row.classList.toggle("is-today", Number(row.dataset.day) === day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- 4. FORM KONTAK -> WHATSAPP ---------- */
  const WA_NUMBER = "628975091253"; // ganti dengan nomor cafe (tanpa + dan spasi)
  const form = document.getElementById("wa-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.elements.nama.value.trim();
      const message = form.elements.pesan.value.trim();
      const text = encodeURIComponent(`Halo Jeda Sejenak, saya ${name}. ${message}`);
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");
    });
  }

  /* ---------- 5. TAS PESANAN: ADD TO BAG -> WHATSAPP ---------- */
  // Isi tas disimpan di localStorage, jadi tetap ada saat pindah halaman.
  const KEY = "jeda-sejenak-bag", PKEY = "jeda-sejenak-profil";
  const MAX_QTY = 20;
  const rp = (n) => "Rp " + n.toLocaleString("id-ID");
  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage penuh/diblok: abaikan */ } };
  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clean = (arr) => (Array.isArray(arr) ? arr.filter((i) => i && i.id && i.price > 0 && i.qty > 0) : []);

  let bag = clean(read(KEY, []));
  let sentUrl = null, lastFocus = null;

  const root = h("div");
  root.innerHTML = `
    <div class="bag-overlay" data-bag-close></div>
    <aside class="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" aria-hidden="true">
      <div class="bag-head">
        <h2 id="bag-title">Tas kamu 🛍️</h2>
        <button class="bag-close" type="button" aria-label="Tutup tas" data-bag-close>✕</button>
      </div>
      <div class="bag-empty" hidden>
        <p class="bag-emoji" aria-hidden="true">🫥</p>
        <p>Tasmu masih kosong. Yuk isi dulu!</p>
        <a class="btn" href="menu.html">Intip menu</a>
      </div>
      <div class="bag-done" hidden>
        <p class="bag-emoji" aria-hidden="true">🎉</p>
        <h3>Pesananmu meluncur!</h3>
        <p>WhatsApp harusnya sudah terbuka. Tinggal tekan kirim di sana.</p>
        <a class="btn" data-wa-again target="_blank" rel="noopener">Buka WhatsApp lagi</a>
        <button class="btn btn--ghost" type="button" data-bag-finish>Selesai, kosongkan tas</button>
      </div>
      <form class="bag-form" novalidate>
        <div class="bag-scroll">
          <ul class="bag-list"></ul>
          <div class="field"><label for="bag-nama">Nama</label><input id="bag-nama" name="nama" type="text" autocomplete="name" required></div>
          <fieldset class="seg">
            <legend>Pesanan untuk</legend>
            <label><input type="radio" name="mode" value="Makan di sini" checked><span>🪑 Makan di sini</span></label>
            <label><input type="radio" name="mode" value="Bawa pulang"><span>🛍️ Bawa pulang</span></label>
          </fieldset>
          <div class="field" data-meja><label for="bag-meja">Nomor meja (kalau sudah tahu)</label><input id="bag-meja" name="meja" type="text" inputmode="numeric" maxlength="6"></div>
          <div class="field"><label for="bag-catatan">Catatan</label><textarea id="bag-catatan" name="catatan" rows="2" placeholder="Less sugar, pedas, tanpa es..."></textarea></div>
        </div>
        <div class="bag-foot">
          <p class="bag-note" hidden>Kafe lagi tutup. Pesananmu tetap terkirim, dibalas pas buka ya.</p>
          <p class="bag-total"><span>Total</span><strong data-bag-total>Rp 0</strong></p>
          <button class="btn btn--wa" type="submit">Pesan lewat WhatsApp</button>
        </div>
      </form>
    </aside>
    <div class="toasts" role="status" aria-live="polite"></div>
    <button class="bag-bar" type="button" data-bag-open hidden><span data-bar-text></span><b>Lihat tas →</b></button>`;
  document.body.append(root);

  const $ = (s) => root.querySelector(s);
  const drawer = $(".bag-drawer"), overlay = $(".bag-overlay"), bagForm = $(".bag-form");
  const list = $(".bag-list"), empty = $(".bag-empty"), done = $(".bag-done");
  const bar = $(".bag-bar"), toasts = $(".toasts"), closeBtn = $(".bag-close");
  const isOpen = () => drawer.classList.contains("is-open");

  // isi ulang nama & pilihan terakhir
  const prof = read(PKEY, {});
  if (typeof prof.nama === "string") bagForm.elements.nama.value = prof.nama;
  if (prof.mode === "Bawa pulang") bagForm.elements.mode.value = "Bawa pulang";

  function row(i) {
    const li = h("li", "bag-item");
    const img = h("img");
    img.src = i.img; img.alt = ""; img.width = 64; img.height = 48;
    const info = h("div", "bag-info");
    info.append(h("strong", "", i.name), h("span", "", rp(i.price * i.qty)));
    const qty = h("div", "qty");
    const btn = (label, sym, d) => {
      const b = h("button", "", sym);
      b.type = "button"; b.dataset.id = i.id; b.dataset.d = d;
      b.setAttribute("aria-label", `${label} ${i.name}`);
      return b;
    };
    qty.append(btn("Kurangi", "−", -1), h("span", "", i.qty), btn("Tambah", "+", 1));
    li.append(img, info, qty);
    return li;
  }

  function render() {
    const count = bag.reduce((s, i) => s + i.qty, 0);
    const total = bag.reduce((s, i) => s + i.qty * i.price, 0);
    document.querySelectorAll("[data-bag-count]").forEach((b) => { b.textContent = count; b.hidden = !count; });
    bar.hidden = !count || isOpen();
    document.body.classList.toggle("has-bag-bar", !bar.hidden);
    $("[data-bar-text]").textContent = `${count} item · ${rp(total)}`;
    list.replaceChildren(...bag.map(row));
    empty.hidden = bag.length > 0 || !!sentUrl;
    done.hidden = !sentUrl;
    bagForm.hidden = !bag.length || !!sentUrl;
    $("[data-bag-total]").textContent = rp(total);
    $(".bag-note").hidden = isOpenNow;
    $("[data-meja]").hidden = bagForm.elements.mode.value !== "Makan di sini";
  }

  function change(id, d) {
    const it = bag.find((i) => i.id === id);
    if (!it) return;
    it.qty = Math.min(MAX_QTY, it.qty + d);
    if (it.qty <= 0) bag = bag.filter((i) => i !== it);
    save(KEY, bag);
    render();
    list.querySelector(`button[data-id="${id}"][data-d="${d}"]`)?.focus();
  }

  function openBag() {
    if (toggle && links) setMenu(false);
    lastFocus = document.activeElement;
    drawer.classList.add("is-open"); overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("bag-open");
    render();
    closeBtn.focus();
  }
  function closeBag() {
    if (!isOpen()) return;
    drawer.classList.remove("is-open"); overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("bag-open");
    render();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toast(title, sub, img) {
    const t = h("div", "toast");
    if (img) { const i = h("img"); i.src = img; i.alt = ""; i.width = 48; i.height = 36; t.append(i); }
    const msg = h("div", "toast-msg");
    msg.append(h("strong", "", title), h("span", "", sub));
    t.append(msg);
    if (img) { const b = h("button", "toast-link", "Lihat tas"); b.type = "button"; b.dataset.bagOpen = ""; t.append(b); }
    toasts.append(t);
    while (toasts.children.length > 3) toasts.firstChild.remove();
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
  }

  // bulatan kecil "terbang" dari tombol ke ikon tas
  function fly(from, img) {
    const target = document.querySelector(".bag-btn");
    if (calm || !target) return;
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const dot = h("span", "fly");
    dot.style.backgroundImage = `url("${img}")`;
    dot.style.left = a.left + a.width / 2 - 22 + "px";
    dot.style.top = a.top + a.height / 2 - 22 + "px";
    document.body.append(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: 1 },
       { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(0.8)`, opacity: 1, offset: 0.45 },
       { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.6 }],
      { duration: 700, easing: "ease-in-out" }
    ).onfinish = () => dot.remove();
  }

  const CHEERS = ["masuk tas! 🛍️", "mantap, dicatat! ✨", "gas, ditambah! 🔥", "pilihan bagus! 😎"];
  function addFromCard(btn) {
    const c = btn.closest(".menu-card");
    if (!c) return;
    const { id, name, img } = c.dataset, price = Number(c.dataset.price);
    sentUrl = null;
    const it = bag.find((i) => i.id === id);
    if (it) it.qty = Math.min(MAX_QTY, it.qty + 1); else bag.push({ id, name, price, img, qty: 1 });
    save(KEY, bag);
    render();

    const bagBtn = document.querySelector(".bag-btn");
    if (bagBtn) { bagBtn.classList.remove("bump"); void bagBtn.offsetWidth; bagBtn.classList.add("bump"); }
    fly(btn, img);
    const lab = btn.querySelector(".add-label");
    btn.classList.add("is-added"); lab.textContent = "Masuk!";
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.classList.remove("is-added"); lab.textContent = "Tambah"; }, 1100);
    toast(name, CHEERS[Math.floor(Math.random() * CHEERS.length)], img);
  }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) return addFromCard(add);
    if (e.target.closest("[data-bag-open]")) return openBag();
    if (e.target.closest("[data-bag-close]")) return closeBag();
    if (e.target.closest("[data-bag-finish]")) {
      bag = []; sentUrl = null; save(KEY, bag); render(); closeBag();
      toast("Makasih! 💛", "Sampai ketemu di Jeda Sejenak.");
    }
  });
  list.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-d]");
    if (b) change(b.dataset.id, Number(b.dataset.d));
  });
  bagForm.addEventListener("change", render);

  bagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!bag.length || !bagForm.reportValidity()) return;
    const f = bagForm.elements;
    const name = f.nama.value.trim(), meja = f.meja.value.trim(), note = f.catatan.value.trim();
    const dine = f.mode.value === "Makan di sini";
    const total = bag.reduce((s, i) => s + i.qty * i.price, 0);
    save(PKEY, { nama: name, mode: f.mode.value });
    const text = [
      "Halo Jeda Sejenak! Saya mau pesan:", "",
      ...bag.map((i, n) => `${n + 1}. ${i.name} x${i.qty} - ${rp(i.qty * i.price)}`), "",
      `Total: ${rp(total)}`, "",
      `Nama: ${name}`,
      `Pesanan: ${f.mode.value}${dine && meja ? " (meja " + meja + ")" : ""}`,
      ...(note ? [`Catatan: ${note}`] : []), "",
      "Terima kasih!",
    ].join("\n");
    sentUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    root.querySelector("[data-wa-again]").href = sentUrl;
    window.open(sentUrl, "_blank", "noopener");
    render();
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") return closeBag();
    if (e.key !== "Tab") return;
    const items = [...drawer.querySelectorAll("a[href], button, input, textarea")].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // sinkron kalau tas diubah di tab lain
  window.addEventListener("storage", (e) => { if (e.key === KEY) { bag = clean(read(KEY, [])); render(); } });
  render();

  /* ---------- 6. TAHUN DI FOOTER ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
